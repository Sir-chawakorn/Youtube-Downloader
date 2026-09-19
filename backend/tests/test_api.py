from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_system_status():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["ytdlp_installed"] is True
    assert "ffmpeg_installed" in data
    assert "download_folder" in data
    assert data["disk_free_bytes"] > 0


def test_common_folders():
    response = client.get("/api/system/common-folders")
    assert response.status_code == 200
    data = response.json()
    assert len(data["folders"]) > 0


def test_settings_api():
    # GET settings
    r1 = client.get("/api/settings")
    assert r1.status_code == 200
    current = r1.json()

    # PUT settings
    current["default_video_format"] = "mp4"
    r2 = client.put("/api/settings", json=current)
    assert r2.status_code == 200
    assert r2.json()["default_video_format"] == "mp4"


def test_history_api():
    r = client.get("/api/history")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_analyze_invalid_url():
    r = client.post("/api/analyze", json={"url": "not-a-youtube-url"})
    assert r.status_code == 400
    assert "ไม่ถูกต้อง" in r.json()["detail"] or "URL" in r.json()["detail"]


def test_download_file_endpoint_not_found():
    r = client.get("/api/download/non-existent-uuid-12345/file")
    assert r.status_code == 404


def test_download_file_missing_physical_file():
    import uuid
    from datetime import datetime, timezone
    from app.services.database import db_service
    from app.models.download import DownloadRecord

    fake_id = str(uuid.uuid4())
    record = DownloadRecord(
        id=fake_id,
        video_id="faketest123",
        url="https://youtube.com/watch?v=faketest123",
        title="Fake Video",
        channel="Fake Channel",
        thumbnail="https://example.com/thumb.jpg",
        format="mp4",
        quality="1080",
        file_path="/tmp/non_existent_file_test_9999.mp4",
        status="completed",
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db_service.add_or_update_download(record)

    r = client.get(f"/api/download/{fake_id}/file")
    assert r.status_code == 404
    assert "ไม่พบไฟล์" in r.json()["detail"] or "not found" in r.json()["detail"].lower()


def test_download_file_endpoint_success(tmp_path):
    import uuid
    from datetime import datetime, timezone
    from app.services.database import db_service
    from app.models.download import DownloadRecord

    test_file = tmp_path / "test_sample_video.mp4"
    test_file.write_bytes(b"dummy video stream content 12345")

    valid_id = str(uuid.uuid4())
    record = DownloadRecord(
        id=valid_id,
        video_id="validtest123",
        url="https://youtube.com/watch?v=validtest123",
        title="Valid Test Video",
        channel="Test Channel",
        thumbnail="https://example.com/thumb.jpg",
        format="mp4",
        quality="1080",
        file_path=str(test_file),
        status="completed",
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db_service.add_or_update_download(record)

    r = client.get(f"/api/download/{valid_id}/file")
    assert r.status_code == 200
    assert "attachment" in r.headers.get("content-disposition", "")
    assert "test_sample_video.mp4" in r.headers.get("content-disposition", "")
    assert r.content == b"dummy video stream content 12345"

