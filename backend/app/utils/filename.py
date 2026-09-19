import re
from typing import Dict, Any


FORBIDDEN_CHARS_PATTERN = re.compile(r'[\/\\:\*\?"<>\|\x00-\x1f]')


def sanitize_filename(name: str, max_length: int = 180) -> str:
    """
    Sanitize filename by removing illegal filesystem characters and truncating.
    """
    if not name:
        return "untitled"

    # Replace forbidden characters with underscore or dash
    sanitized = FORBIDDEN_CHARS_PATTERN.sub("-", name)

    # Replace consecutive spaces and dashes
    sanitized = re.sub(r"\s+", " ", sanitized)
    sanitized = re.sub(r"-+", "-", sanitized)
    sanitized = sanitized.strip(". ")

    # Truncate if too long while preserving UTF-8 integrity
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length].rstrip(". ")

    return sanitized or "untitled"


def format_filename(template: str, info: Dict[str, Any], ext: str) -> str:
    """
    Format template using metadata info and ensure safe filename.
    Supported placeholders:
    %(title)s, %(channel)s, %(id)s, %(upload_date)s, %(resolution)s, %(ext)s
    """
    if not template:
        template = "%(title)s.%(ext)s"

    title = sanitize_filename(str(info.get("title", "Video")))
    channel = sanitize_filename(str(info.get("channel", "Channel")))
    video_id = sanitize_filename(str(info.get("id", "id")))
    upload_date = sanitize_filename(str(info.get("upload_date", "")))
    resolution = sanitize_filename(str(info.get("resolution", "")))

    ext = ext.lstrip(".")

    mapping = {
        "title": title,
        "channel": channel,
        "id": video_id,
        "upload_date": upload_date,
        "resolution": resolution,
        "ext": ext,
    }

    try:
        filename = template % mapping
    except (KeyError, ValueError, TypeError):
        filename = f"{title}.{ext}"

    # Ensure it ends with .ext
    if not filename.endswith(f".{ext}"):
        filename = f"{filename}.{ext}"

    return filename
