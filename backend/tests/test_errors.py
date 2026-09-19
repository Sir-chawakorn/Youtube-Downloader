from app.utils.errors import translate_error


def test_translate_error_messages():
    e1 = "ERROR: Requested format is not available"
    res1 = translate_error(e1)
    assert "คุณภาพที่เลือกไม่สามารถดาวน์โหลดได้" in res1

    e2 = "This video is private"
    res2 = translate_error(e2)
    assert "วิดีโอนี้เป็นแบบส่วนตัว" in res2

    e3 = "Sign in to confirm your age"
    res3 = translate_error(e3)
    assert "จำกัดอายุผู้รับชม" in res3

    e4 = "ffmpeg not found"
    res4 = translate_error(e4)
    assert "ไม่พบโปรแกรม FFmpeg" in res4

    e5 = "Disk full, no space left on device"
    res5 = translate_error(e5)
    assert "พื้นที่ว่างในดิสก์ไม่เพียงพอ" in res5
