from app.utils.validators import is_valid_youtube_url, clean_youtube_url, extract_video_id


def test_valid_youtube_urls():
    valid_urls = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://youtube.com/watch?v=dQw4w9WgXcQ",
        "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://youtu.be/dQw4w9WgXcQ",
        "https://youtube.com/shorts/dQw4w9WgXcQ",
        "http://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s",
        "   https://youtu.be/dQw4w9WgXcQ   ",
    ]
    for url in valid_urls:
        assert is_valid_youtube_url(url), f"Should be valid: {url}"
        assert extract_video_id(url) == "dQw4w9WgXcQ"


def test_invalid_youtube_urls():
    invalid_urls = [
        "",
        "   ",
        "https://vimeo.com/123456",
        "https://facebook.com/watch?v=123",
        "https://notyoutube.com/watch?v=dQw4w9WgXcQ",
        "not a url at all",
        "https://youtube.com/about",
    ]
    for url in invalid_urls:
        assert not is_valid_youtube_url(url), f"Should be invalid: {url}"


def test_clean_youtube_url():
    assert clean_youtube_url("  https://youtu.be/abc  ") == "https://youtu.be/abc"
