from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import health_router
from app.api.user_routes import user_router
from app.core.config import settings
from app.api.patient_routes import patient_router
from app.api.profile_routes import profile_router
from app.api.visit_summary_routes import visit_summary_router
from app.api.exercise_routes import exercise_router
from app.api.treatment_plan_routes import treatment_plan_router
from app.api.ai_search_routes import ai_search_router
from app.api.homepage_routes import homepage_router

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
    _app.include_router(visit_summary_router, prefix="/visit-summary")
    _app.include_router(exercise_router, prefix="/exercise")
    _app.include_router(treatment_plan_router, prefix="/treatment-plan")
    _app.include_router(ai_search_router, prefix="/ai-search")
    _app.include_router(homepage_router, prefix="/home")

    return _app

app = get_application()
