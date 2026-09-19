from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.youtube_service import youtube_service
from ..services.database import db_service
from ..models.video import VideoMetadata
from ..models.download import DownloadRecord

router = APIRouter(prefix="/api", tags=["analyze"])


class AnalyzeRequest(BaseModel):
    url: str


class AnalyzeResponse(BaseModel):
    metadata: VideoMetadata
    already_downloaded: bool = False
    existing_record: Optional[DownloadRecord] = None


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_url(req: AnalyzeRequest):
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="กรุณาระบุ URL วิดีโอ YouTube")

    try:
        metadata = youtube_service.analyze_url(req.url)
        
        # Check duplicate detection (PRD #87)
        existing = db_service.find_completed_by_video_id(metadata.id)
        already_downloaded = existing is not None

        return AnalyzeResponse(
            metadata=metadata,
            already_downloaded=already_downloaded,
            existing_record=existing,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
