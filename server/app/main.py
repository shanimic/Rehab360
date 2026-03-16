from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.base import api_router
from app.core.config import settings

def get_application() -> FastAPI:
    _app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION
    )

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include all routes from the api_router
    _app.include_router(api_router)

    return _app

app = get_application()
