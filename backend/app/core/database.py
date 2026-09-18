import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

# Determine database engine
db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        echo=False
    )
    # Test connection
    with engine.connect() as conn:
        logger.info(f"Database connected successfully via {db_url.split('://')[0]}")
except Exception as e:
    logger.warning(f"Could not connect to {db_url} ({e}). Falling back to local SQLite.")
    sqlite_url = "sqlite:///./threatdna_ai.db"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.models import (
        user,
        alert,
        analysis,
        dataset,
        experiment,
        metric
    )
    Base.metadata.create_all(bind=engine)
