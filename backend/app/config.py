import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from root or backend directory
env_file = Path(__file__).resolve().parent.parent.parent / ".env"
if not env_file.exists():
    env_file = Path(__file__).resolve().parent.parent / ".env"

if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Flood Rescue Data Management & Dynamic Reporting System")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "FLOOD_RESCUE_SUPER_SECRET_JWT_KEY_2026")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))
    
    _raw_db_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/smart_flood"
    )
    if _raw_db_url.startswith("postgres://"):
        DATABASE_URL: str = _raw_db_url.replace("postgres://", "postgresql://", 1)
    else:
        DATABASE_URL: str = _raw_db_url

    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "*").split(",")
        if origin.strip()
    ]

    # Gmail SMTP Credentials
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "True").lower() in ("true", "1", "t")
    SMTP_USER: str = os.getenv("SMTP_USER", "digitalalchemists00@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "wrrn psnl emjg bvae")
    DEFAULT_FROM_EMAIL: str = os.getenv("DEFAULT_FROM_EMAIL", "digitalalchemists00@gmail.com")

settings = Settings()


