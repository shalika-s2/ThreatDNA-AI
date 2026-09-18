import json
import logging
import re
from typing import Optional, Dict, Any
from app.core.config import settings
from app.prompts.alert_analysis_prompt import (
    ALERT_ANALYSIS_SYSTEM_PROMPT,
    generate_alert_analysis_user_prompt
)
from app.schemas.analysis import LLMAlertAnalysisResult

logger = logging.getLogger(__name__)

def sanitize_json_output(text: str) -> str:
    """Extract and parse JSON from LLM text response if wrapped in code blocks."""
    cleaned = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if match:
        cleaned = match.group(1).strip()
    return cleaned

class LLMService:
    def __init__(self, provider: Optional[str] = None, model: Optional[str] = None):
        self.provider = (provider or settings.LLM_PROVIDER).lower()
        self.model = model or settings.LLM_MODEL
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    async def analyze_alert(
        self,
        raw_log: str,
        source_ip: str = "Unknown",
        destination_ip: str = "Unknown",
        source_port: str = "Unknown",
        destination_port: str = "Unknown",
        protocol: str = "TCP",
        attack_type: str = "Generic Alert",
        signature: str = "N/A"
    ) -> LLMAlertAnalysisResult:
        """Main entry point to analyze an alert with fallback heuristics if API key is missing."""
        user_prompt = generate_alert_analysis_user_prompt(
            raw_log=raw_log,
            source_ip=source_ip,
            destination_ip=destination_ip,
            source_port=source_port,
            destination_port=destination_port,
            protocol=protocol,
            attack_type=attack_type,
            signature=signature
        )

        try:
            if self.provider == "gemini" and self.gemini_key:
                return await self._analyze_gemini(user_prompt)
            elif self.provider == "openai" and self.openai_key:
                return await self._analyze_openai(user_prompt)
            else:
                logger.info(f"Using research heuristic engine for provider={self.provider} (no external API key configured)")
                return self._analyze_heuristic(
                    raw_log=raw_log,
                    attack_type=attack_type,
                    source_ip=source_ip,
                    protocol=protocol,
                    signature=signature
                )
        except Exception as e:
            logger.warning(f"LLM request error ({e}). Falling back to research heuristic engine.")
            return self._analyze_heuristic(
                raw_log=raw_log,
                attack_type=attack_type,
                source_ip=source_ip,
                protocol=protocol,
                signature=signature
            )

    async def _analyze_gemini(self, user_prompt: str) -> LLMAlertAnalysisResult:
        import httpx
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.gemini_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{ALERT_ANALYSIS_SYSTEM_PROMPT}\n\n{user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(sanitize_json_output(raw_text))
            return LLMAlertAnalysisResult(**parsed)

    async def _analyze_openai(self, user_prompt: str) -> LLMAlertAnalysisResult:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=self.openai_key)
        response = await client.chat.completions.create(
            model=self.model or "gpt-4o-mini",
            messages=[
                {"role": "system", "content": ALERT_ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        raw_text = response.choices[0].message.content
        parsed = json.loads(sanitize_json_output(raw_text))
        return LLMAlertAnalysisResult(**parsed)

    def _analyze_heuristic(
        self,
        raw_log: str,
        attack_type: str,
        source_ip: str,
        protocol: str,
        signature: str
    ) -> LLMAlertAnalysisResult:
        """Academic cybersecurity research baseline engine for offline evaluation & deterministic triage."""
        log_lower = f"{raw_log} {attack_type} {signature}".lower()

        # Check Benign indicators
        benign_patterns = [
            "benign", "healthz", "keep-alive", "valid_token", "normal", "static asset",
            "reverse dns", "oauth callback", "session sync", "cluster query"
        ]
        is_benign = any(bp in log_lower for bp in benign_patterns) and not any(
            x in log_lower for x in ["or 1=1", "etc/passwd", "failed password", "jndi", "syn sent to ports", "tree connect", "eval(", "<script>"]
        )

        if is_benign:
            return LLMAlertAnalysisResult(
                classification="benign",
                severity="low",
                priority="P4",
                confidence=0.92,
                false_positive_likelihood=0.96,
                reason="Routine legitimate network traffic matching standard operational signatures with no malicious payload or privilege escalation indicators.",
                recommended_action="No containment necessary. Allow traffic and maintain standard telemetry logging."
            )

        # Critical / High Exploitation Patterns
        if any(x in log_lower for x in ["log4j", "eternalblue", "rce", "remote code execution", "shell.php", "c2", "cobalt strike", "ransomware"]):
            return LLMAlertAnalysisResult(
                classification="malicious",
                severity="critical",
                priority="P1",
                confidence=0.97,
                false_positive_likelihood=0.03,
                reason="Active high-impact exploitation pattern detected indicating direct remote code execution or command-and-control communication.",
                recommended_action="Immediately isolate the destination host, block the source IP at perimeter firewalls, and initiate incident response."
            )

        # SQL Injection / Path Traversal / XSS / SSRF
        if any(x in log_lower for x in ["sql injection", "1=1", "waitfor delay", "etc/passwd", "traversal", "xss", "<script>", "ssrf", "169.254."]):
            return LLMAlertAnalysisResult(
                classification="malicious",
                severity="high",
                priority="P2",
                confidence=0.94,
                false_positive_likelihood=0.06,
                reason="Web application exploit payload identified with clear injection tokens attempting unauthorized database access or file disclosure.",
                recommended_action="Inspect WAF rules, review application parameter sanitization, and verify query execution logs on backend database."
            )

        # Brute Force / Port Scan / Botnet Probe
        if any(x in log_lower for x in ["brute force", "failed password", "port scan", "syn sweep", "mirai", "telnet", "hydra"]):
            return LLMAlertAnalysisResult(
                classification="malicious",
                severity="medium",
                priority="P3",
                confidence=0.89,
                false_positive_likelihood=0.11,
                reason="Repetitive anomalous scanning or authentication failure pattern characteristic of automated reconnaissance and credential guessing.",
                recommended_action="Enforce temporary IP rate-limiting, verify account lockout policies, and monitor target host for successful logins."
            )

        # Suspicious Default
        return LLMAlertAnalysisResult(
            classification="suspicious",
            severity="medium",
            priority="P3",
            confidence=0.78,
            false_positive_likelihood=0.22,
            reason="Unusual protocol structure and telemetry headers detected that deviate from baseline norms without verified exploit payload.",
            recommended_action="Cross-reference with endpoint EDR telemetry and monitor next 15 minutes of outbound traffic."
        )
