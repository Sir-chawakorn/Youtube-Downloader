import re
from urllib.parse import urlparse, parse_qs

YOUTUBE_DOMAINS = {
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be",
}

# Regex to match video ID
VIDEO_ID_REGEX = re.compile(r"^[a-zA-Z0-9_-]{11}$")


def clean_youtube_url(url: str) -> str:
    """Trim whitespace and return cleaned url string."""
    if not url:
        return ""
    return url.strip()


def extract_video_id(url: str) -> str:
    """Extract YouTube video ID from various formats (watch, shorts, youtu.be)."""
    cleaned = clean_youtube_url(url)
    if not cleaned:
        return ""

    if not cleaned.startswith("http://") and not cleaned.startswith("https://"):
        cleaned = "https://" + cleaned

    try:
        parsed = urlparse(cleaned)
        netloc = parsed.netloc.lower()
        
        # Remove port if present
        if ":" in netloc:
            netloc = netloc.split(":")[0]

        if netloc not in YOUTUBE_DOMAINS:
            return ""

        path = parsed.path

        # youtu.be/VIDEO_ID
        if netloc == "youtu.be":
            vid = path.lstrip("/").split("/")[0].split("?")[0]
            return vid if VIDEO_ID_REGEX.match(vid) else ""

        # youtube.com/watch?v=VIDEO_ID
        if path == "/watch":
            qs = parse_qs(parsed.query)
            v_list = qs.get("v")
            if v_list and len(v_list[0]) == 11:
                return v_list[0]

        # youtube.com/shorts/VIDEO_ID
        if path.startswith("/shorts/"):
            vid = path.split("/shorts/")[1].split("/")[0].split("?")[0]
            return vid if VIDEO_ID_REGEX.match(vid) else ""

        # youtube.com/embed/VIDEO_ID
        if path.startswith("/embed/"):
            vid = path.split("/embed/")[1].split("/")[0].split("?")[0]
            return vid if VIDEO_ID_REGEX.match(vid) else ""

        # youtube.com/live/VIDEO_ID
        if path.startswith("/live/"):
            vid = path.split("/live/")[1].split("/")[0].split("?")[0]
            return vid if VIDEO_ID_REGEX.match(vid) else ""

    except Exception:
        return ""

    return ""


def is_valid_youtube_url(url: str) -> bool:
    """Check if the given URL is a valid YouTube URL."""
    return bool(extract_video_id(url))
