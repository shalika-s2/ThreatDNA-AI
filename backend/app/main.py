import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.utils.seed_data import seed_database
from app.routers import (
    auth,
    dashboard,
    alerts,
    analyses,
    datasets,
    experiments,
    metrics,
    reports
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("threatdna")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ThreatDNA-AI database schema...")
    try:
        init_db()
        seed_database()
        logger.info("Database schema and synthetic seed data initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}", exc_info=True)
    yield
    logger.info("ThreatDNA-AI server shutdown.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.TAGLINE} — Academic Cybersecurity Research Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:8001",
    settings.FRONTEND_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(analyses.router, prefix=settings.API_V1_STR)
app.include_router(datasets.router, prefix=settings.API_V1_STR)
app.include_router(experiments.router, prefix=settings.API_V1_STR)
app.include_router(metrics.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "OPERATIONAL",
        "llm_provider": settings.LLM_PROVIDER,
        "llm_model": settings.LLM_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
