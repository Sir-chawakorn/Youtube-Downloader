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
