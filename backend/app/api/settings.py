from fastapi import APIRouter
from ..models.settings import AppSettings
from ..services.database import db_service

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=AppSettings)
async def get_settings():
    return db_service.get_settings()


@router.put("", response_model=AppSettings)
async def update_settings(settings: AppSettings):
    return db_service.update_settings(settings)
