"""Configuracao via variaveis de ambiente usando Pydantic Settings."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[3]
DEFAULT_SQLITE_URL = f"sqlite+pysqlite:///{ROOT_DIR / 'data' / 'udev.db'}"


class Settings(BaseSettings):
    """Configuracoes principais do projeto."""

    DATABASE_URL: str = DEFAULT_SQLITE_URL
    SECRET_KEY: str = "trocar-em-producao"
    PAYMENT_WEBHOOK_SECRET: str = "trocar-em-producao"
    STORAGE_PATH: str = str(ROOT_DIR / "data")

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    BOOTSTRAP_MANAGER_EMAIL: str = "gestor@udev.local"
    BOOTSTRAP_MANAGER_PASSWORD: str = "Mudar123!"
    BOOTSTRAP_MANAGER_NAME: str = "Equipe Gestora Udev"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
