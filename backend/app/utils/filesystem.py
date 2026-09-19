import os
import shutil
import subprocess
import platform
from typing import Tuple, Optional


def get_base_data_dir() -> str:
    """Returns application data directory: ~/.local-youtube-downloader or .app-data in workspace."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_dir = os.path.join(base_dir, ".app-data")
    os.makedirs(data_dir, exist_ok=True)
    return data_dir


def get_temp_dir_for_download(download_id: str) -> str:
    """Creates and returns an isolated temp directory for a download."""
    data_dir = get_base_data_dir()
    temp_dir = os.path.join(data_dir, "temp", download_id)
    os.makedirs(temp_dir, exist_ok=True)
    return temp_dir


def cleanup_temp_dir(temp_dir: str):
    """Safely removes temporary directory and all intermediate files."""
    try:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
    except Exception:
        pass


def cleanup_stale_temps():
    """Clean up orphan temp directories on startup (PRD #64, #88)."""
    try:
        temp_root = os.path.join(get_base_data_dir(), "temp")
        if os.path.exists(temp_root):
            for item in os.listdir(temp_root):
                item_path = os.path.join(temp_root, item)
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path, ignore_errors=True)
    except Exception:
        pass


def check_disk_space(path: str, required_bytes: Optional[int] = None) -> Tuple[bool, int, int]:
    """
    Check if path has enough free space.
    Returns (has_enough, available_bytes, required_bytes).
    """
    target = path if os.path.exists(path) else os.path.expanduser("~")
    try:
        stat = shutil.disk_usage(target)
        available = stat.free
        if required_bytes is not None and required_bytes > 0:
            return (available >= required_bytes, available, required_bytes)
        # Default minimum 200MB free required
        min_required = 200 * 1024 * 1024
        return (available >= min_required, available, min_required)
    except Exception:
        return (True, 1024 * 1024 * 1024, 0)


def open_file_in_os(file_path: str) -> bool:
    """Opens the file in default player / system viewer."""
    if not os.path.exists(file_path):
        return False

    system = platform.system()
    try:
        if system == "Darwin":
            subprocess.run(["open", file_path], check=True)
            return True
        elif system == "Windows":
            os.startfile(file_path)
            return True
        else: # Linux
            subprocess.run(["xdg-open", file_path], check=True)
            return True
    except Exception:
        return False


def open_folder_in_os(target_path: str) -> bool:
    """Opens folder or reveals file in Finder / File Explorer."""
    if not os.path.exists(target_path):
        # Fallback to parent dir if file doesn't exist
        parent = os.path.dirname(target_path)
        if os.path.exists(parent):
            target_path = parent
        else:
            return False

    system = platform.system()
    try:
        if system == "Darwin":
            if os.path.isfile(target_path):
                # Reveal file in Finder
                subprocess.run(["open", "-R", target_path], check=True)
            else:
                subprocess.run(["open", target_path], check=True)
            return True
        elif system == "Windows":
            if os.path.isfile(target_path):
                subprocess.run(["explorer", "/select,", target_path], check=True)
            else:
                subprocess.run(["explorer", target_path], check=True)
            return True
        else:
            folder = os.path.dirname(target_path) if os.path.isfile(target_path) else target_path
            subprocess.run(["xdg-open", folder], check=True)
            return True
    except Exception:
        return False
