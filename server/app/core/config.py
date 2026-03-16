from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rehab360 API"
    PROJECT_VERSION: str = "1.0.0"
    
    # DEV SETTINGS
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()
