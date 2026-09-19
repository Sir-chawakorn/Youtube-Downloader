from app.utils.filename import sanitize_filename, format_filename


def test_sanitize_filename_forbidden_chars():
    dirty = 'My: Video/ With \\ Illegal * Char? In "Name" <Here> | Now!'
    clean = sanitize_filename(dirty)
    for forbidden in ['/', '\\', ':', '*', '?', '"', '<', '>', '|']:
        assert forbidden not in clean
    assert "My- Video- With - Illegal - Char- In -Name- -Here- - Now!" == clean or "-" in clean


def test_sanitize_filename_length():
    very_long = "A" * 300
    clean = sanitize_filename(very_long, max_length=150)
    assert len(clean) <= 150


def test_format_filename_templates():
    meta = {
        "title": "Rick Astley - Never Gonna Give You Up",
        "channel": "RickAstleyVEVO",
        "id": "dQw4w9WgXcQ",
        "upload_date": "20091025",
    }
    # Default template
    fn1 = format_filename("%(title)s.%(ext)s", meta, "mp4")
    assert fn1 == "Rick Astley - Never Gonna Give You Up.mp4"

    # Title + Channel template
    fn2 = format_filename("%(title)s - %(channel)s.%(ext)s", meta, "mp3")
    assert fn2 == "Rick Astley - Never Gonna Give You Up - RickAstleyVEVO.mp3"

    # Upload date + Title template
    fn3 = format_filename("%(upload_date)s - %(title)s.%(ext)s", meta, "mp4")
    assert fn3 == "20091025 - Rick Astley - Never Gonna Give You Up.mp4"
