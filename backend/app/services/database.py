import os
import sqlite3
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from ..models.download import DownloadRecord
from ..models.settings import AppSettings


class DatabaseService:
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            data_dir = os.path.join(base_dir, "data")
            os.makedirs(data_dir, exist_ok=True)
            db_path = os.path.join(data_dir, "app.db")
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS downloads (
                    id TEXT PRIMARY KEY,
                    video_id TEXT NOT NULL,
                    url TEXT NOT NULL,
                    title TEXT NOT NULL,
                    channel TEXT NOT NULL,
                    thumbnail TEXT,
                    format TEXT NOT NULL,
                    quality TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    file_size INTEGER,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    completed_at TEXT,
                    error_message TEXT
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def add_or_update_download(self, record: DownloadRecord):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO downloads (
                    id, video_id, url, title, channel, thumbnail,
                    format, quality, file_path, file_size, status,
                    created_at, completed_at, error_message
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    file_size=excluded.file_size,
                    status=excluded.status,
                    completed_at=excluded.completed_at,
                    error_message=excluded.error_message,
                    file_path=excluded.file_path
                """,
                (
                    record.id,
                    record.video_id,
                    record.url,
                    record.title,
                    record.channel,
                    record.thumbnail,
                    record.format,
                    record.quality,
                    record.file_path,
                    record.file_size,
                    record.status,
                    record.created_at,
                    record.completed_at,
                    record.error_message,
                ),
            )
            conn.commit()

    def get_download(self, download_id: str) -> Optional[DownloadRecord]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM downloads WHERE id = ?", (download_id,))
            row = cursor.fetchone()
            if row:
                return DownloadRecord(**dict(row))
        return None

    def find_completed_by_video_id(self, video_id: str) -> Optional[DownloadRecord]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM downloads WHERE video_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 1",
                (video_id,),
            )
            row = cursor.fetchone()
            if row:
                return DownloadRecord(**dict(row))
        return None

    def list_downloads(self, limit: int = 100, offset: int = 0) -> List[DownloadRecord]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM downloads ORDER BY created_at DESC LIMIT ? OFFSET ?",
                (limit, offset),
            )
            rows = cursor.fetchall()
            return [DownloadRecord(**dict(row)) for row in rows]

    def delete_download(self, download_id: str) -> bool:
        """Removes the record from the database history without deleting the physical file."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM downloads WHERE id = ?", (download_id,))
            conn.commit()
            return cursor.rowcount > 0

    def clear_history(self) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM downloads")
            conn.commit()
            return cursor.rowcount

    def get_settings(self) -> AppSettings:
        default_settings = AppSettings()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT key, value FROM settings")
            rows = cursor.fetchall()
            if not rows:
                return default_settings
            data = default_settings.model_dump()
            for row in rows:
                key = row["key"]
                raw_val = row["value"]
                try:
                    val = json.loads(raw_val)
                except Exception:
                    val = raw_val
                if key in data:
                    data[key] = val
            return AppSettings(**data)

    def update_settings(self, settings: AppSettings) -> AppSettings:
        now = datetime.now(timezone.utc).isoformat()
        data = settings.model_dump()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for key, val in data.items():
                val_json = json.dumps(val)
                cursor.execute(
                    """
                    INSERT INTO settings (key, value, updated_at)
                    VALUES (?, ?, ?)
                    ON CONFLICT(key) DO UPDATE SET
                        value=excluded.value,
                        updated_at=excluded.updated_at
                    """,
                    (key, val_json, now),
                )
            conn.commit()
        return settings


db_service = DatabaseService()
