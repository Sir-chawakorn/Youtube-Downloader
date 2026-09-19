from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..models.download import DownloadRecord
from ..services.database import db_service
from ..utils.filesystem import open_file_in_os, open_folder_in_os

router = APIRouter(prefix="/api/history", tags=["history"])


class StatusResponse(BaseModel):
    success: bool
    message: str


@router.get("", response_model=List[DownloadRecord])
async def list_history(limit: int = 100, offset: int = 0):
    return db_service.list_downloads(limit=limit, offset=offset)


@router.delete("/{download_id}", response_model=StatusResponse)
async def delete_history_item(download_id: str):
    """
    Remove record from history. Does NOT delete physical file on disk (PRD #34, #757).
    """
    success = db_service.delete_download(download_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return StatusResponse(success=True, message="ลบรายการประวัติสำเร็จ (ไฟล์ในเครื่องไม่ถูกลบ)")


@router.delete("", response_model=StatusResponse)
async def clear_all_history():
    count = db_service.clear_history()
    return StatusResponse(success=True, message=f"ล้างประวัติการดาวน์โหลด {count} รายการ")


@router.post("/{download_id}/open-file", response_model=StatusResponse)
async def open_file(download_id: str):
    record = db_service.get_download(download_id)
    if not record or not record.file_path:
        raise HTTPException(status_code=404, detail="Download record not found")

    opened = open_file_in_os(record.file_path)
    if not opened:
        raise HTTPException(status_code=404, detail="ไม่พบไฟล์ในเครื่อง หรือไฟล์ถูกย้าย/ลบไปแล้ว")

    return StatusResponse(success=True, message="เปิดไฟล์สำเร็จ")


@router.post("/{download_id}/open-folder", response_model=StatusResponse)
async def open_folder(download_id: str):
    record = db_service.get_download(download_id)
    if not record or not record.file_path:
        raise HTTPException(status_code=404, detail="Download record not found")

    opened = open_folder_in_os(record.file_path)
    if not opened:
        raise HTTPException(status_code=404, detail="ไม่สามารถเปิดโฟลเดอร์ได้ โฟลเดอร์อาจถูกย้ายหรือลบ")

    return StatusResponse(success=True, message="เปิดโฟลเดอร์สำเร็จ")
