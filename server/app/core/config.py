from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rehab360 API"
    PROJECT_VERSION: str = "1.0.0"
    CORS_ORIGINS: list[str] = ["*"]

    # Database Settings
    DB_HOST: str = "localhost"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "rehab360"

    # This tells Pydantic to read from the .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
