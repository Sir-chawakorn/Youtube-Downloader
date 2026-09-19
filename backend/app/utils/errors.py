from typing import Dict, Any


ERROR_PATTERNS = [
    (
        ["requested format is not available", "format not available"],
        "คุณภาพที่เลือกไม่สามารถดาวน์โหลดได้ กรุณาเลือก Auto / Best หรือเลือกคุณภาพอื่น (Selected quality not available)",
    ),
    (
        ["this video is private", "private video"],
        "วิดีโอนี้เป็นแบบส่วนตัว ไม่สามารถเข้าถึงได้ (Private video)",
    ),
    (
        ["this video has been removed", "video unavailable", "video is unavailable"],
        "ไม่พบวิดีโอนี้ หรือวิดีโอถูกลบไปแล้ว (Video is unavailable or removed)",
    ),
    (
        ["sign in to confirm your age", "age-restricted", "confirm your age"],
        "วิดีโอนี้จำกัดอายุผู้รับชม ต้องเข้าสู่ระบบเพื่อยืนยันอายุ (Age-restricted video)",
    ),
    (
        ["ffmpeg not found", "ffmpeg is not installed", "ffprobe not found"],
        "ไม่พบโปรแกรม FFmpeg ในระบบ กรุณาตรวจสอบการติดตั้ง FFmpeg (FFmpeg not installed)",
    ),
    (
        ["http error 429", "too many requests"],
        "YouTube จำกัดการส่งคำขอชั่วคราว กรุณารอสักครู่แล้วลองใหม่ (Too many requests from YouTube)",
    ),
    (
        ["connection refused", "timed out", "timeout", "network is unreachable", "connection reset"],
        "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ต (Network connection timeout or error)",
    ),
    (
        ["no space left on device", "disk full"],
        "พื้นที่ว่างในดิสก์ไม่เพียงพอสำหรับการดาวน์โหลด (Not enough disk space available)",
    ),
    (
        ["permission denied"],
        "ไม่มีสิทธิ์เขียนไฟล์ลงในโฟลเดอร์ที่เลือก กรุณาเลือกโฟลเดอร์อื่น (Permission denied on destination folder)",
    ),
    (
        ["live stream recording is not supported", "is a live stream"],
        "ยังไม่รองรับการดาวน์โหลดวิดีโอที่กำลัง Live สดอยู่ (Live stream downloading is not supported yet)",
    ),
    (
        ["members-only", "join this channel"],
        "วิดีโอนี้สำหรับสมาชิกช่องเท่านั้น (Members-only video)",
    ),
    (
        ["invalid url", "unsupported url"],
        "URL ไม่ถูกต้อง หรือไม่ใช่ลิงก์ YouTube ที่รองรับ (Invalid YouTube URL)",
    ),
]


def translate_error(err: Any) -> str:
    """
    Translates raw technical errors (e.g. from yt-dlp) into friendly messages.
    """
    err_str = str(err).lower()
    for triggers, friendly_msg in ERROR_PATTERNS:
        for trigger in triggers:
            if trigger in err_str:
                return friendly_msg

    # Generic clean fallback
    clean_msg = str(err)
    if "ERROR:" in clean_msg:
        clean_msg = clean_msg.split("ERROR:", 1)[1].strip()
    return clean_msg
