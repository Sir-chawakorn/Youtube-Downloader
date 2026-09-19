import os
import re
import shutil
import asyncio
import threading
import subprocess
from datetime import datetime, timezone
from typing import Dict, Optional, List

from ..models.download import DownloadRequest, DownloadRecord, ProgressEvent
from ..services.database import db_service
from ..services.ffmpeg_service import ffmpeg_service
from ..services.youtube_service import get_ytdlp_binary_path
from ..utils.validators import extract_video_id
from ..utils.filename import format_filename, sanitize_filename
from ..utils.filesystem import get_temp_dir_for_download, cleanup_temp_dir, check_disk_space
from ..utils.errors import translate_error


class ActiveDownload:
    def __init__(self, download_id: str, request: DownloadRequest):
        self.download_id = download_id
        self.request = request
        self.status = "queued"
        self.progress = 0.0
        self.speed = 0.0
        self.speed_string = "0 KB/s"
        self.eta = None
        self.eta_string = "--:--"
        self.downloaded_bytes = 0
        self.total_bytes = 0
        self.file_path = None
        self.filename = None
        self.error_message = None
        self.process: Optional[subprocess.Popen] = None
        self.is_cancelled = False
        self.listeners: List[asyncio.Queue] = []
        self.created_at = datetime.now(timezone.utc).isoformat()
        self.completed_at = None
        self.lock = threading.Lock()

    def to_event(self) -> ProgressEvent:
        with self.lock:
            return ProgressEvent(
                download_id=self.download_id,
                status=self.status,
                progress=round(self.progress, 1),
                speed=self.speed,
                speed_string=self.speed_string,
                eta=self.eta,
                eta_string=self.eta_string,
                downloaded_bytes=self.downloaded_bytes,
                total_bytes=self.total_bytes,
                file_path=self.file_path,
                filename=self.filename,
                error_message=self.error_message,
            )

    def broadcast(self, loop: asyncio.AbstractEventLoop):
        event = self.to_event()
        for q in list(self.listeners):
            try:
                loop.call_soon_threadsafe(q.put_nowait, event)
            except Exception:
                pass


class DownloadService:
    def __init__(self):
        self.active_downloads: Dict[str, ActiveDownload] = {}
        self.loop: Optional[asyncio.AbstractEventLoop] = None

    def set_event_loop(self, loop: asyncio.AbstractEventLoop):
        self.loop = loop

    def get_active(self, download_id: str) -> Optional[ActiveDownload]:
        return self.active_downloads.get(download_id)

    def cancel_download(self, download_id: str) -> bool:
        item = self.active_downloads.get(download_id)
        if not item:
            return False

        with item.lock:
            item.is_cancelled = True
            item.status = "cancelled"
            item.error_message = "การดาวน์โหลดถูกยกเลิก (Download cancelled by user)"

        # Terminate subprocess immediately (PRD #29)
        if item.process and item.process.poll() is None:
            try:
                item.process.terminate()
                item.process.wait(timeout=2)
            except Exception:
                try:
                    item.process.kill()
                except Exception:
                    pass

        # Update in DB
        record = db_service.get_download(download_id)
        if record:
            record.status = "cancelled"
            record.error_message = item.error_message
            record.completed_at = datetime.now(timezone.utc).isoformat()
            db_service.add_or_update_download(record)

        if self.loop:
            item.broadcast(self.loop)

        # Cleanup temp dir
        temp_dir = get_temp_dir_for_download(download_id)
        cleanup_temp_dir(temp_dir)
        return True

    def start_download(self, download_id: str, request: DownloadRequest):
        active = ActiveDownload(download_id, request)
        self.active_downloads[download_id] = active

        thread = threading.Thread(
            target=self._run_download_process,
            args=(download_id, request, active),
            daemon=True,
        )
        thread.start()

    def _run_download_process(
        self,
        download_id: str,
        req: DownloadRequest,
        active: ActiveDownload,
    ):
        temp_dir = get_temp_dir_for_download(download_id)
        settings = db_service.get_settings()
        ffmpeg_path = ffmpeg_service.get_ffmpeg_path()
        ytdlp_bin = get_ytdlp_binary_path()

        save_folder = req.save_path or settings.default_folder
        save_folder = os.path.expanduser(save_folder)
        os.makedirs(save_folder, exist_ok=True)

        loop = self.loop or asyncio.get_event_loop()

        # Step 1: Disk space check (PRD #63, #65)
        has_space, available, _ = check_disk_space(save_folder)
        if not has_space:
            with active.lock:
                active.status = "failed"
                active.error_message = f"พื้นที่ว่างในดิสก์ไม่เพียงพอ (เหลือเพียง {available // (1024*1024)} MB)"
            active.broadcast(loop)
            cleanup_temp_dir(temp_dir)
            return

        with active.lock:
            active.status = "analyzing"
            active.progress = 5.0
        active.broadcast(loop)

        # Step 2: Build command arguments array (No shell=True, PRD #62)
        outtmpl = os.path.join(temp_dir, "%(title)s.%(ext)s")
        cmd = [
            ytdlp_bin,
            "--newline",
            "--no-playlist",
            "--no-warnings",
            "--ffmpeg-location", ffmpeg_path,
            "-o", outtmpl,
            "--progress-template", "download:%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s|%(progress.downloaded_bytes)s|%(progress.total_bytes)s",
        ]

        if req.type == "audio":
            target_format = req.format.lower() if req.format else "mp3"
            cmd.extend(["-x", "--audio-format", target_format])
            if req.quality and req.quality != "best":
                cmd.extend(["--audio-quality", f"{req.quality}K"])
            if req.embed_thumbnail:
                cmd.append("--embed-thumbnail")
            if req.embed_metadata:
                cmd.append("--embed-metadata")
        else:
            target_format = req.format.lower() if req.format else "mp4"
            if req.quality == "best" or not req.quality:
                cmd.extend(["-f", "bestvideo+bestaudio/best"])
            else:
                try:
                    q_num = int(req.quality)
                    cmd.extend(["-f", f"bestvideo[height<={q_num}]+bestaudio/best[height<={q_num}]/best"])
                except Exception:
                    cmd.extend(["-f", "bestvideo+bestaudio/best"])

            cmd.extend(["--merge-output-format", target_format])

            if req.embed_thumbnail:
                cmd.append("--embed-thumbnail")
            if req.embed_metadata:
                cmd.append("--embed-metadata")
            if req.subtitle_lang and req.subtitle_lang.lower() != "none":
                cmd.append("--write-subs")
                if req.subtitle_lang == "all":
                    cmd.append("--all-subs")
                else:
                    cmd.extend(["--sub-langs", req.subtitle_lang])
                if req.embed_subtitle:
                    cmd.append("--embed-subs")

        cmd.append(req.url)

        # Record initial in DB
        vid_id = extract_video_id(req.url)
        initial_record = DownloadRecord(
            id=download_id,
            video_id=vid_id,
            url=req.url,
            title="Downloading...",
            channel="",
            thumbnail="",
            format=req.format,
            quality=req.quality,
            file_path="",
            file_size=0,
            status="downloading",
            created_at=active.created_at,
        )
        db_service.add_or_update_download(initial_record)

        try:
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
            active.process = process

            output_lines = []
            for line in iter(process.stdout.readline, ""):
                if active.is_cancelled:
                    break

                line_str = line.strip()
                output_lines.append(line_str)

                # Parse progress
                if line_str.startswith("download:"):
                    parts = line_str[len("download:"):].split("|")
                    if len(parts) >= 5:
                        pct_str, speed_str, eta_str, down_bytes_str, tot_bytes_str = parts[:5]
                        try:
                            clean_pct = float(pct_str.replace("%", "").strip())
                            clean_down = int(down_bytes_str) if down_bytes_str.isdigit() else 0
                            clean_tot = int(tot_bytes_str) if tot_bytes_str.isdigit() else 0
                        except Exception:
                            clean_pct = active.progress
                            clean_down = active.downloaded_bytes
                            clean_tot = active.total_bytes

                        with active.lock:
                            active.status = "downloading"
                            active.progress = max(active.progress, min(95.0, clean_pct))
                            active.speed_string = speed_str.strip() or active.speed_string
                            active.eta_string = eta_str.strip() or active.eta_string
                            if clean_down:
                                active.downloaded_bytes = clean_down
                            if clean_tot:
                                active.total_bytes = clean_tot

                        active.broadcast(loop)

                elif "[Merger]" in line_str:
                    with active.lock:
                        active.status = "merging"
                        active.progress = 97.0
                    active.broadcast(loop)

                elif "[ExtractAudio]" in line_str:
                    with active.lock:
                        active.status = "converting"
                        active.progress = 97.0
                    active.broadcast(loop)

                elif "Deleting original file" in line_str or "[Metadata]" in line_str:
                    with active.lock:
                        active.status = "processing"
                        active.progress = 98.0
                    active.broadcast(loop)

            process.stdout.close()
            process.wait()

            if active.is_cancelled:
                return

            if process.returncode != 0:
                raw_error = "\n".join(output_lines[-5:]) if output_lines else "Unknown error occurred"
                raise RuntimeError(translate_error(raw_error))

            # Step 3: Find produced file in temp_dir and move to destination
            generated_files = [
                os.path.join(temp_dir, f)
                for f in os.listdir(temp_dir)
                if not f.endswith(".temp") and not f.endswith(".part") and os.path.isfile(os.path.join(temp_dir, f))
            ]

            if not generated_files:
                raise RuntimeError("ไม่พบไฟล์ผลลัพธ์จากการดาวน์โหลด")

            generated_files.sort(key=lambda p: os.path.getsize(p), reverse=True)
            source_file = generated_files[0]
            actual_ext = os.path.splitext(source_file)[1].lstrip(".")
            temp_filename = os.path.basename(source_file)

            # Metadata info approximation for filename template
            info_dict = {
                "title": os.path.splitext(temp_filename)[0],
                "channel": "",
                "id": "",
                "upload_date": "",
            }

            template = req.filename_template or settings.filename_template
            final_filename = format_filename(template, info_dict, actual_ext)
            final_path = os.path.join(save_folder, final_filename)

            base_name, ext = os.path.splitext(final_filename)
            counter = 1
            while os.path.exists(final_path):
                final_filename = f"{base_name} ({counter}){ext}"
                final_path = os.path.join(save_folder, final_filename)
                counter += 1

            shutil.move(source_file, final_path)
            file_size = os.path.getsize(final_path)

            now_str = datetime.now(timezone.utc).isoformat()
            final_record = DownloadRecord(
                id=download_id,
                video_id=vid_id,
                url=req.url,
                title=info_dict.get("title", "Video"),
                channel=info_dict.get("channel", ""),
                thumbnail="",
                format=actual_ext,
                quality=req.quality,
                file_path=final_path,
                file_size=file_size,
                status="completed",
                created_at=active.created_at,
                completed_at=now_str,
            )
            db_service.add_or_update_download(final_record)

            with active.lock:
                active.status = "completed"
                active.progress = 100.0
                active.file_path = final_path
                active.filename = final_filename
                active.completed_at = now_str
            active.broadcast(loop)

        except Exception as e:
            if not active.is_cancelled:
                friendly_err = translate_error(e)
                with active.lock:
                    active.status = "failed"
                    active.error_message = friendly_err
                active.broadcast(loop)

                record = db_service.get_download(download_id)
                if record:
                    record.status = "failed"
                    record.error_message = friendly_err
                    record.completed_at = datetime.now(timezone.utc).isoformat()
                    db_service.add_or_update_download(record)

        finally:
            cleanup_temp_dir(temp_dir)


download_service = DownloadService()
