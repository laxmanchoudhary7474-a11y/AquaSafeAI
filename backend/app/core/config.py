from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AquaSafeAI"
    
    # Database
    DATABASE_URL: str
    
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

settings = Settings()
