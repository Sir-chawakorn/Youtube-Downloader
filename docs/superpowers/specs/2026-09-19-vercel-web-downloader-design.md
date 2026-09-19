# Vercel-Ready Web YouTube Downloader Design Specification

**Date:** 2026-09-19  
**Status:** Approved by User  
**Target:** Vercel (Frontend) + Cloud/Local Backend (FastAPI + yt-dlp + FFmpeg)

---

## 1. Problem Statement & Motivation

Previously, the YouTube Downloader was designed as a local-only utility:
- The Next.js frontend only expected a backend at `http://127.0.0.1:8000/api`.
- When a download completed, files were saved solely on the host computer's disk, with UI actions ("Open File" / "Open Folder") that invoked host OS commands (`open` / `xdg-open` / `explorer.exe`).
- There was no mechanism for a user visiting via a remote web browser (e.g. deployed on Vercel) to download the finished file directly into their own browser/device.
- CORS restricted requests strictly to `localhost`.
- The repository structure had `frontend/` in a subdirectory without root Vercel build configuration.

Deploying to Vercel requires adapting the application so:
1. **Frontend deploys seamlessly to Vercel**: Root deployment configuration (`vercel.json`) allows direct GitHub repository connection.
2. **Direct Browser Downloads**: Users on any device (Mac, Windows, iOS, Android) can download the generated MP4/MP3 directly to their client device via HTTP download stream (`Content-Disposition: attachment`).
3. **Backend Cloud-Ready**: FastAPI supports Vercel CORS origins, provides direct file serving endpoints, and includes 1-click cloud deployment files (`Dockerfile`, `render.yaml`).
4. **Flexible Backend Connection**: The frontend dynamically connects to any backend URL (via `NEXT_PUBLIC_API_URL` or runtime UI configuration in Settings) and displays server connection status.

---

## 2. System Architecture

```text
+-------------------------------------------------------------------------+
|                              USER DEVICE                                |
|  Web Browser (Desktop / Mobile / Tablet)                                |
+--------------------+-----------------------------------+----------------+
                     |                                   |
                     | 1. HTTP / Next.js Bundle          | 2. Direct Media Download
                     v                                   |    (GET /api/download/:id/file)
+------------------------------------+                   |
|          VERCEL CLOUD              |                   |
|  Next.js 15 App Router Frontend    |                   |
|  - Minimal Glassmorphism UI        |                   |
|  - Dynamic API Base URL            |                   |
|  - Auto-Download to Device Trigger |                   |
|  - Realtime SSE Progress Listener  |                   |
+--------------------+---------------+                   |
                     |                                   |
                     | 3. REST API / SSE Events          |
                     v                                   |
+--------------------------------------------------------+----------------+
|          FASTAPI BACKEND (Render / Railway / VPS / Localhost)           |
|  - CORS enabled for https://*.vercel.app and localhost                  |
|  - yt-dlp & FFmpeg Engine (Video & Audio Transcoding)                   |
|  - Realtime SSE Event Stream (/api/download/:id/events)                 |
|  - File Delivery Stream (/api/download/:id/file)                        |
|  - SQLite Persistence (/api/history)                                    |
+-------------------------------------------------------------------------+
```

---

## 3. Backend Changes (FastAPI)

### 3.1 Direct File Download Endpoint
**Route:** `GET /api/download/{download_id}/file`

- **Parameters:** `download_id` (UUID string)
- **Logic:**
  1. Look up `download_id` in active downloads or SQLite database (`db_service.get_download(download_id)`).
  2. Verify physical file exists on disk at `record.file_path`. If not found, return HTTP 404 with clear message.
  3. Extract sanitized filename from `file_path`.
  4. Determine MIME type (e.g. `video/mp4`, `audio/mpeg`, `audio/mp4`, `audio/wav`).
  5. Return `FileResponse(path, filename=filename, media_type=mime, content_disposition_type="attachment")`.
  6. Supports HTTP Range headers for fast resumption and browser chunked downloading.

### 3.2 CORS Middleware Update
In `backend/app/main.py`:
- Support environment variable `CORS_ORIGINS` (comma-separated list).
- Default to allowing:
  - `http://localhost:3000`, `http://127.0.0.1:3000`
  - `http://localhost:3001`, `http://127.0.0.1:3001`
  - All Vercel preview and production subdomains: `allow_origin_regex=r"^https://.*\.vercel\.app$"`
  - Wildcard option when `CORS_ALLOW_ALL=true`.

### 3.3 Cloud Deployment Manifests
- **`Dockerfile`**: Lightweight Python 3.11/3.12 Alpine or Debian slim image with `ffmpeg` and `yt-dlp` pre-installed, running Uvicorn on port `8000`.
- **`render.yaml`**: One-click infrastructure blueprint for deploying backend as a free web service on Render.com.
- **`Procfile`**: Standard process file (`web: uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`) for Heroku / Railway / Koyeb.

---

## 4. Frontend Changes (Next.js)

### 4.1 Vercel Deployment Configuration
- Add root `vercel.json`:
  ```json
  {
    "framework": "nextjs",
    "buildCommand": "cd frontend && npm run build",
    "outputDirectory": "frontend/.next",
    "installCommand": "cd frontend && npm install"
  }
  ```
  *(Or root workspace script configuration to guarantee zero-friction Vercel builds).*

### 4.2 Dynamic API Client & Backend Connection Manager
In `frontend/lib/api.ts`:
- Support runtime API URL override stored in `localStorage`:
  - Priority: `localStorage.getItem("custom_api_url")` > `process.env.NEXT_PUBLIC_API_URL` > `"http://127.0.0.1:8000/api"`.
- Add helper `api.getDownloadFileUrl(downloadId: string)`:
  - Returns `${API_BASE}/download/${downloadId}/file`.
- Add helper `api.triggerBrowserDownload(downloadId: string, filename?: string)`:
  - Creates an invisible `<a>` element with `href` pointing to the file URL and programmatically clicks it, initiating a native browser download into user's `Downloads` folder.

### 4.3 UI Updates: Direct Browser Download Actions
1. **`DownloadComplete.tsx`**:
   - Primary action button: **"⬇️ ดาวน์โหลดลงเครื่อง (Save to Device)"** (prominent green gradient button).
   - "ดาวน์โหลดอัตโนมัติ" (Auto-download): When download status becomes `completed`, immediately trigger `api.triggerBrowserDownload(downloadId)`.
   - Host OS buttons ("Open File" / "Open Folder"): Displayed only when connected to a local backend (`127.0.0.1` or `localhost`).
2. **`HistoryPage.tsx`**:
   - Add **"⬇️ ดาวน์โหลดลงเครื่อง (Save to Device)"** icon button for every completed history item.
3. **Navbar & Settings**:
   - Show Backend Connection Indicator badge in Navbar:
     - 🟢 **Backend พร้อมใช้งาน (Connected)**
     - 🔴 **ไม่พบการเชื่อมต่อ Backend (Offline)**: Clicking opens a modal or navigates to Settings with guidance on connecting a backend URL (Render, Railway, or local).
   - In `SettingsPage`: Add "Backend API URL" field with "Test Connection" button, allowing users to switch backends easily.

---

## 5. Verification Plan

### 5.1 Automated Tests
- **Backend Tests (`pytest`)**:
  - Test `GET /api/download/{download_id}/file` returns HTTP 200 with `Content-Disposition: attachment` when file exists.
  - Test `GET /api/download/{download_id}/file` returns HTTP 404 when download ID does not exist or file is missing.
  - Test CORS middleware allows Vercel domain origins.
- **Frontend Build**:
  - Run `npm run build` in `frontend/` to ensure 100% type safety and zero compile errors.

### 5.2 Manual Verification
- Verify browser download trigger: Download test video, ensure browser prompts to save `.mp4`/`.mp3` to local computer.
- Verify History page download button triggers direct download.
- Verify Backend Status Indicator updates on connection success/failure.
