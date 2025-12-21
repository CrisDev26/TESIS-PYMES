from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = "PYMES API"
    # Por defecto usamos PostgreSQL local PYMES; puedes
    # sobreescribir con DATABASE_URL en el .env si cambias credenciales.
    database_url: str = Field(
        "postgresql+psycopg2://postgres:postgres@localhost:5432/PYMES",
        env="DATABASE_URL",
    )

    openai_api_key: str | None = Field(default=None, env="OPENAI_API_KEY")
    openai_model_recommender: str = "gpt-4.1-mini"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
