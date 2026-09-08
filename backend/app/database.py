import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

SQLITE_FALLBACK_URL = "sqlite:///./flood_rescue_db.sqlite"

def get_engine():
    db_url = settings.DATABASE_URL
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # Attempt Postgres connection first
    if db_url and db_url.startswith("postgresql"):
        try:
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_recycle=300,
                pool_size=10,
                max_overflow=20
            )
            # Test connection
            with engine.connect() as conn:
                pass
            print(f"[DATABASE] Connected successfully to PostgreSQL: {db_url.split('@')[-1] if '@' in db_url else db_url}")
            return engine
        except Exception as e:
            print(f"[DATABASE] PostgreSQL connection failed ({e}). Falling back to local SQLite: {SQLITE_FALLBACK_URL}")
            return create_engine(SQLITE_FALLBACK_URL, connect_args={"check_same_thread": False})
    else:
        return create_engine(db_url, connect_args={"check_same_thread": False} if "sqlite" in db_url else {})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
