import os
import tempfile
from app.services.database import DatabaseService
from app.models.download import DownloadRecord
from app.models.settings import AppSettings


def test_database_crud():
    with tempfile.NamedTemporaryFile(suffix=".db") as f:
        db = DatabaseService(db_path=f.name)

        record = DownloadRecord(
            id="test-1",
            video_id="vid-1",
            url="https://youtube.com/watch?v=vid-1",
            title="Test Video",
            channel="Channel A",
            thumbnail="https://example.com/thumb.jpg",
            format="mp4",
            quality="1080",
            file_path="/tmp/test.mp4",
            file_size=10240,
            status="completed",
            created_at="2026-09-19T00:00:00",
            completed_at="2026-09-19T00:01:00",
        )

        db.add_or_update_download(record)

        fetched = db.get_download("test-1")
        assert fetched is not None
        assert fetched.title == "Test Video"
        assert fetched.status == "completed"

        # Duplicate detection check
        dup = db.find_completed_by_video_id("vid-1")
        assert dup is not None
        assert dup.id == "test-1"

        # List
        items = db.list_downloads()
        assert len(items) == 1

        # Delete from history
        db.delete_download("test-1")
        assert db.get_download("test-1") is None


def test_database_settings():
    with tempfile.NamedTemporaryFile(suffix=".db") as f:
        db = DatabaseService(db_path=f.name)

        settings = db.get_settings()
        assert settings.default_video_format == "mp4"

        settings.default_video_format = "mkv"
        settings.default_video_quality = "720"
        db.update_settings(settings)

        updated = db.get_settings()
        assert updated.default_video_format == "mkv"
        assert updated.default_video_quality == "720"
