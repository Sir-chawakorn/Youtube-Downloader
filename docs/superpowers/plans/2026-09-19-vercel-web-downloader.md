# Vercel Deployment & Direct Browser Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the YouTube Downloader into a Vercel-ready Web Application allowing remote web users to paste links and download media directly into their browser/device, with CORS support for Vercel, dynamic backend configuration, and 1-click cloud manifests.

**Architecture:** Frontend (Next.js 15) deployed on Vercel connecting dynamically to a FastAPI backend (Render / Railway / VPS / Localhost); FastAPI provides a `GET /api/download/{id}/file` attachment stream with broad CORS; Frontend triggers native browser file download directly into the user's Downloads folder upon completion.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Python 3.9+, FastAPI, yt-dlp, FFmpeg, Docker.

**Spec:** `docs/superpowers/specs/2026-09-19-vercel-web-downloader-design.md`

## Global Constraints
- Do not break backward compatibility with existing local desktop features (open file / folder still available when on localhost).
- Frontend must build cleanly (`npm run build`) with zero TypeScript / ESLint errors.
- Backend automated tests (`pytest`) must pass 100%.
- Sensitive files, local SQLite DB, node_modules, and virtualenv must remain git-ignored.

---

### Task 1: Backend Direct Browser File Download Endpoint & Unit Tests

**Files:**
- Modify: `backend/app/api/download.py`
- Modify: `backend/tests/test_api.py`

**Interfaces:**
- Produces: `GET /api/download/{download_id}/file` returning `FileResponse` with `Content-Disposition: attachment`.

- [ ] **Step 1: Write the failing tests in `backend/tests/test_api.py`**
Add tests verifying:
  1. `test_download_file_endpoint_not_found`: Non-existent download ID returns HTTP 404.
  2. `test_download_file_missing_physical_file`: DB record exists but physical file deleted returns HTTP 404.
  3. `test_download_file_endpoint_success`: Valid DB record with existing file returns HTTP 200 with attachment header.

- [ ] **Step 2: Run pytest to verify the tests fail**
Run: `pytest backend/tests/test_api.py -k test_download_file -v`
Expected: FAIL (404/Method not allowed or endpoint missing).

- [ ] **Step 3: Implement `GET /api/download/{download_id}/file` in `backend/app/api/download.py`**
Use `fastapi.responses.FileResponse` with sanitized filename, media type determination, and attachment header.

- [ ] **Step 4: Run pytest to verify all tests pass**
Run: `pytest`
Expected: PASS (all 18+ tests green).

- [ ] **Step 5: Commit changes**
```bash
git add backend/app/api/download.py backend/tests/test_api.py
git commit -m "feat(backend): add direct file download endpoint for browser streaming"
```

---

### Task 2: Backend CORS Update & Cloud Deployment Manifests

**Files:**
- Modify: `backend/app/main.py`
- Create: `Dockerfile`
- Create: `render.yaml`
- Create: `Procfile`

**Interfaces:**
- Produces: CORS support for `https://*.vercel.app`, environment variable `CORS_ORIGINS`, containerized backend Dockerfile, and Render cloud blueprint.

- [ ] **Step 1: Update CORS in `backend/app/main.py`**
Read `CORS_ORIGINS` from environment. Add `allow_origin_regex=r"^https://.*\.vercel\.app$"` and allow `*` when deployed in cloud.

- [ ] **Step 2: Create `Dockerfile`**
Base on `python:3.11-slim`, install `ffmpeg`, copy requirements, install dependencies, expose port 8000, start Uvicorn.

- [ ] **Step 3: Create `render.yaml` and `Procfile`**
Provide 1-click blueprint configuration for free web service deployment on Render.com and Railway.

- [ ] **Step 4: Verify pytest still passes**
Run: `pytest`
Expected: PASS.

- [ ] **Step 5: Commit changes**
```bash
git add backend/app/main.py Dockerfile render.yaml Procfile
git commit -m "feat(backend): add Vercel CORS support and cloud deployment manifests"
```

---

### Task 3: Root Vercel Deployment Configuration

**Files:**
- Create: `vercel.json`
- Create: `package.json` (at project root)

**Interfaces:**
- Produces: Zero-config Vercel build delegation into `frontend/`.

- [ ] **Step 1: Create `vercel.json`**
Configure Vercel framework `nextjs`, `buildCommand: "cd frontend && npm run build"`, `outputDirectory: "frontend/.next"`, and `installCommand: "cd frontend && npm install"`.

- [ ] **Step 2: Create root `package.json`**
Provide root `npm run build` and `npm run dev` scripts targeting `frontend/`.

- [ ] **Step 3: Commit changes**
```bash
git add vercel.json package.json
git commit -m "chore: add root Vercel configuration and workspace build scripts"
```

---

### Task 4: Frontend Dynamic API URL, Browser Download Trigger & Connection Badge

**Files:**
- Modify: `frontend/lib/api.ts`
- Modify: `frontend/components/Navbar.tsx`

**Interfaces:**
- Produces: `api.getDownloadFileUrl(downloadId)`, `api.triggerBrowserDownload(downloadId, filename)`, `api.getCustomApiUrl()`, `api.setCustomApiUrl(url)`.

- [ ] **Step 1: Enhance `frontend/lib/api.ts`**
  - Make `getApiBase()` dynamic: check `localStorage.getItem("custom_api_url")`, fallback to `process.env.NEXT_PUBLIC_API_URL` or `"http://127.0.0.1:8000/api"`.
  - Add `triggerBrowserDownload(downloadId: string, filename?: string)`.
  - Add `checkApiHealth(): Promise<boolean>`.

- [ ] **Step 2: Update `frontend/components/Navbar.tsx`**
Add a live Backend Connection status pill (🟢 Connected / 🔴 Offline) with click action to open URL configuration modal/settings.

- [ ] **Step 3: Verify frontend compiles**
Run: `npm --prefix frontend run build`
Expected: PASS.

- [ ] **Step 4: Commit changes**
```bash
git add frontend/lib/api.ts frontend/components/Navbar.tsx
git commit -m "feat(frontend): add dynamic backend URL resolution and connection badge"
```

---

### Task 5: Direct Download Actions in DownloadComplete, History & Settings

**Files:**
- Modify: `frontend/components/DownloadComplete.tsx`
- Modify: `frontend/app/history/page.tsx`
- Modify: `frontend/app/settings/page.tsx`

**Interfaces:**
- Produces: Direct browser download button on completion screen, auto-download option, download button per history item, custom Backend URL input in Settings.

- [ ] **Step 1: Update `frontend/components/DownloadComplete.tsx`**
  - Add prominent **"⬇️ ดาวน์โหลดลงเครื่อง (Save to Device)"** button triggering `api.triggerBrowserDownload(downloadId, filename)`.
  - Auto-trigger browser download immediately upon mount.
  - Render local "Open Folder" / "Open File" only if connected to localhost backend.

- [ ] **Step 2: Update `frontend/app/history/page.tsx`**
  - Add a **"⬇️ โหลดลงเครื่อง (Save to Device)"** action icon for each completed record in history.

- [ ] **Step 3: Update `frontend/app/settings/page.tsx`**
  - Add "Backend API URL" configuration card with "Test Connection" button, allowing users to point their Vercel site to any cloud backend or local IP.

- [ ] **Step 4: Verify frontend build**
Run: `npm --prefix frontend run build`
Expected: PASS with static pages generated.

- [ ] **Step 5: Commit changes**
```bash
git add frontend/components/DownloadComplete.tsx frontend/app/history/page.tsx frontend/app/settings/page.tsx
git commit -m "feat(frontend): implement direct browser downloads and backend settings"
```

---

### Task 6: Documentation & GitHub Push

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update `README.md`**
Add step-by-step guides for:
  1. Deploying Frontend to Vercel (1-click / GitHub import).
  2. Deploying Backend to Render.com (free 1-click Docker web service).
  3. Setting `NEXT_PUBLIC_API_URL`.
  4. Direct browser downloading.

- [ ] **Step 2: Full automated test suite verification**
Run: `pytest` and `npm --prefix frontend run build`.

- [ ] **Step 3: Commit and Push to GitHub**
```bash
git add README.md
git commit -m "docs: update README with Vercel and cloud deployment instructions"
git push origin main
```
