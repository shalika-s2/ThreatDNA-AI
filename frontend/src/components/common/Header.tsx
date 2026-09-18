import React, { useState, useEffect } from 'react';
import { Clock, Shield, Terminal, Zap, Radio, Activity } from 'lucide-react';

export const Header: React.FC<{ title?: string; subtitle?: string }> = ({
  title = 'ThreatDNA-AI // TERMINAL',
  subtitle = 'AI IDS TRIAGE & FALSE-POSITIVE REDUCTION PLATFORM',
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [estTimeStr, setEstTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
      setEstTimeStr(now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }) + ' EST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-40 flex flex-col select-none">
      {/* 1. Primary Solid Bloomberg Terminal Amber Header Strip */}
      <header className="bg-terminalAmber text-black px-4 py-1.5 flex items-center justify-between border-b border-black font-mono shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-black text-terminalAmber px-2 py-0.5 font-black text-xs uppercase tracking-wider flex items-center space-x-1 border border-black">
            <Terminal className="w-3.5 h-3.5 mr-1" />
            <span>GMT://TERMINAL</span>
          </div>
          <span className="font-extrabold text-xs tracking-wider uppercase">
            {title}
          </span>
          <span className="hidden md:inline-block text-[11px] font-bold text-black/80 uppercase">
            | {subtitle}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold">
          {/* NYC EST / UTC Clocks */}
          <div className="hidden lg:flex items-center space-x-2 bg-black/15 px-2 py-0.5 rounded text-[11px]">
            <Clock className="w-3 h-3 text-black" />
            <span>{estTimeStr}</span>
            <span className="text-black/60">/</span>
            <span>{timeStr}</span>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center space-x-1.5 bg-black text-stockGreen px-2.5 py-0.5 border border-black text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stockGreen opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-stockGreen"></span>
            </span>
            <span className="font-extrabold uppercase tracking-wider">
              ONLINE
            </span>
          </div>

          {/* Prompt quick info */}
          <div className="hidden sm:inline-block bg-black/20 text-black px-2 py-0.5 text-[10px] font-extrabold">
            MODE: LIVE_SOC_FEED
          </div>
        </div>
      </header>

      {/* 2. Secondary Horizontal Terminal Ticker Bar */}
      <div className="bg-[#050505] border-b border-border px-3 py-1 flex items-center overflow-hidden font-mono text-[11px] text-textSecondary">
        <div className="flex items-center text-terminalAmber font-extrabold pr-3 mr-2 border-r border-border shrink-0 text-xs">
          <Activity className="w-3.5 h-3.5 mr-1 text-terminalAmber animate-pulse" />
          <span>TICKER &gt;&gt;</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-ticker-scroll space-x-6 flex items-center">
            <span className="inline-flex items-center">
              <span className="text-terminalAmber font-bold mr-1.5">[PRECISION]</span>
              <span className="text-stockGreen font-bold">96.4%</span>
              <span className="text-stockGreen ml-1">▲ +2.1%</span>
            </span>
            <span className="text-[#332000]">|</span>
            <span className="inline-flex items-center">
              <span className="text-terminalAmber font-bold mr-1.5">[FP_REDUCTION]</span>
              <span className="text-stockGreen font-bold">89.2%</span>
              <span className="text-stockGreen ml-1">▲ +4.8%</span>
            </span>
            <span className="text-[#332000]">|</span>
            <span className="inline-flex items-center">
              <span className="text-terminalAmber font-bold mr-1.5">[LATENCY]</span>
              <span className="text-white font-bold">18.4ms</span>
              <span className="text-stockGreen ml-1">▼ -3.2ms</span>
            </span>
            <span className="text-[#332000]">|</span>
            <span className="inline-flex items-center">
              <span className="text-terminalAmber font-bold mr-1.5">[ALERT_VOLUME]</span>
              <span className="text-white font-bold">2,418/hr</span>
            </span>
            <span className="text-[#332000]">|</span>
            <span className="inline-flex items-center">
              <span className="text-terminalAmber font-bold mr-1.5">[SURICATA_ENGINE]</span>
              <span className="text-stockGreen font-bold">SYNCHRONIZED</span>
            </span>
            <span className="text-[#332000]">|</span>
            <span className="inline-flex items-center">
              <span className="text-terminalAmber font-bold mr-1.5">[LLM_TRIAGE]</span>
              <span className="text-terminalAmber font-bold">GPT-4o / QWEN READY</span>
            </span>
            <span className="text-[#332000]">|</span>
            <span className="inline-flex items-center">
              <span className="text-terminalAmber font-bold mr-1.5">[CRITICAL_QUEUE]</span>
              <span className="text-stockRed font-bold">14 ESCALATED</span>
              <span className="text-stockRed ml-1">▼</span>
            </span>
            <span className="text-[#332000]">|</span>
            <span className="inline-flex items-center">
              <span className="text-terminalAmber font-bold mr-1.5">[BUFFER_MEM]</span>
              <span className="text-textSecondary">48.2MB (0.02%)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
