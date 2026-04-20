from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import health_router
from app.api.user_routes import user_router
from app.core.config import settings
from app.api.patient_routes import patient_router
from app.api.profile_routes import profile_router

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

    _app.include_router(health_router)
    _app.include_router(user_router, prefix="/users")
    _app.include_router(patient_router, prefix="/patient")
    _app.include_router(profile_router, prefix="/profile")

    return _app

app = get_application()
