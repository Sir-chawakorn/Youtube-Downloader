import uuid
import asyncio
import json
import os
import mimetypes
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from ..models.download import DownloadRequest, ProgressEvent
from ..services.download_service import download_service
from ..services.database import db_service

router = APIRouter(prefix="/api/download", tags=["download"])


class StartDownloadResponse(BaseModel):
    download_id: str
    status: str


class ActionResponse(BaseModel):
    success: bool
    message: str


@router.post("", response_model=StartDownloadResponse)
async def start_download(req: DownloadRequest):
    if not req.url:
        raise HTTPException(status_code=400, detail="Missing URL")

    download_id = str(uuid.uuid4())
    download_service.start_download(download_id, req)
    return StartDownloadResponse(download_id=download_id, status="queued")


@router.get("/{download_id}/events")
async def download_events(download_id: str, request: Request):
    """
    Real-time Server-Sent Events stream for download progress (PRD #49).
    """
    active = download_service.get_active(download_id)
    record = db_service.get_download(download_id)

    if not active and not record:
        raise HTTPException(status_code=404, detail="Download ID not found")

    async def event_generator():
        # If already completed or failed in history and not active in memory
        if not active or active.status in ["completed", "failed", "cancelled"]:
            ev = active.to_event() if active else ProgressEvent(
                download_id=download_id,
                status=record.status if record else "completed",
                progress=100.0 if record and record.status == "completed" else 0.0,
                file_path=record.file_path if record else None,
                error_message=record.error_message if record else None,
            )
            yield {"event": "progress", "data": ev.model_dump_json()}
            return

        queue = asyncio.Queue()
        active.listeners.append(queue)

        # Emit initial current state immediately
        initial_ev = active.to_event()
        yield {"event": "progress", "data": initial_ev.model_dump_json()}

        try:
            while True:
                if await request.is_disconnected():
                    break

                try:
                    event: ProgressEvent = await asyncio.wait_for(queue.get(), timeout=2.0)
                    yield {"event": "progress", "data": event.model_dump_json()}
                    if event.status in ["completed", "failed", "cancelled"]:
                        break
                except asyncio.TimeoutError:
                    # Heartbeat / keepalive
                    curr = active.to_event()
                    yield {"event": "heartbeat", "data": curr.model_dump_json()}
                    if curr.status in ["completed", "failed", "cancelled"]:
                        break

        finally:
            if queue in active.listeners:
                active.listeners.remove(queue)

    return EventSourceResponse(event_generator())


@router.post("/{download_id}/cancel", response_model=ActionResponse)
async def cancel_download(download_id: str):
    success = download_service.cancel_download(download_id)
    if not success:
        # Check if record exists
        record = db_service.get_download(download_id)
        if record:
            return ActionResponse(success=False, message="การดาวน์โหลดสิ้นสุดไปแล้ว")
        raise HTTPException(status_code=404, detail="Download ID not found")
    return ActionResponse(success=True, message="ยกเลิกการดาวน์โหลดเรียบร้อยแล้ว")


@router.post("/{download_id}/retry", response_model=StartDownloadResponse)
async def retry_download(download_id: str):
    active = download_service.get_active(download_id)
    if not active:
        # Check DB record
        record = db_service.get_download(download_id)
        if not record:
            raise HTTPException(status_code=404, detail="Download not found")
        # Build request from record
        is_audio = record.format in ["mp3", "m4a", "opus", "wav"]
        req = DownloadRequest(
            url=record.url,
            type="audio" if is_audio else "video",
            quality=record.quality,
            format=record.format,
            save_path=None,
        )
    else:
        req = active.request

    new_id = str(uuid.uuid4())
    download_service.start_download(new_id, req)
    return StartDownloadResponse(download_id=new_id, status="queued")


@router.get("/{download_id}/file")
async def download_file_stream(download_id: str):
    """
    Direct browser file download endpoint for remote (Vercel) and local users.
    Returns HTTP 200 with Content-Disposition: attachment to trigger browser download.
    """
    record = db_service.get_download(download_id)
    file_path = None
    if record and record.file_path:
        file_path = record.file_path
    else:
        active = download_service.get_active(download_id)
        if active and active.file_path:
            file_path = active.file_path

    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="ไม่พบไฟล์ในระบบ หรือไฟล์อาจถูกลบ/ย้ายไปแล้ว",
        )

    filename = os.path.basename(file_path)
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=mime_type,
        content_disposition_type="attachment",
    )

