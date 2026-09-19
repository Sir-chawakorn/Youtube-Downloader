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

- [x] **Step 1: Write the failing tests in `backend/tests/test_api.py`**
- [x] **Step 2: Run pytest to verify the tests fail**
- [x] **Step 3: Implement `GET /api/download/{download_id}/file` in `backend/app/api/download.py`**
- [x] **Step 4: Run pytest to verify all tests pass**
- [x] **Step 5: Commit changes**

---

### Task 2: Backend CORS Update & Cloud Deployment Manifests

**Files:**
- Modify: `backend/app/main.py`
- Create: `Dockerfile`
- Create: `render.yaml`
- Create: `Procfile`

**Interfaces:**
- Produces: CORS support for `https://*.vercel.app`, environment variable `CORS_ORIGINS`, containerized backend Dockerfile, and Render cloud blueprint.

- [x] **Step 1: Update CORS in `backend/app/main.py`**
- [x] **Step 2: Create `Dockerfile`**
- [x] **Step 3: Create `render.yaml` and `Procfile`**
- [x] **Step 4: Verify pytest still passes**
- [x] **Step 5: Commit changes**

---

### Task 3: Root Vercel Deployment Configuration

**Files:**
- Create: `vercel.json`
- Create: `package.json` (at project root)

**Interfaces:**
- Produces: Zero-config Vercel build delegation into `frontend/`.

- [x] **Step 1: Create `vercel.json`**
- [x] **Step 2: Create root `package.json`**
- [x] **Step 3: Commit changes**

---

### Task 4: Frontend Dynamic API URL, Browser Download Trigger & Connection Badge

**Files:**
- Modify: `frontend/lib/api.ts`
- Modify: `frontend/components/Navbar.tsx`

**Interfaces:**
- Produces: `api.getDownloadFileUrl(downloadId)`, `api.triggerBrowserDownload(downloadId, filename)`, `api.getCustomApiUrl()`, `api.setCustomApiUrl(url)`.

- [x] **Step 1: Enhance `frontend/lib/api.ts`**
- [x] **Step 2: Update `frontend/components/Navbar.tsx`**
- [x] **Step 3: Verify frontend compiles**
- [x] **Step 4: Commit changes**

---

### Task 5: Direct Download Actions in DownloadComplete, History & Settings

**Files:**
- Modify: `frontend/components/DownloadComplete.tsx`
- Modify: `frontend/app/history/page.tsx`
- Modify: `frontend/app/settings/page.tsx`

**Interfaces:**
- Produces: Direct browser download button on completion screen, auto-download option, download button per history item, custom Backend URL input in Settings.

- [x] **Step 1: Update `frontend/components/DownloadComplete.tsx`**
- [x] **Step 2: Update `frontend/app/history/page.tsx`**
- [x] **Step 3: Update `frontend/app/settings/page.tsx`**
- [x] **Step 4: Verify frontend build**
- [x] **Step 5: Commit changes**

---

### Task 6: Documentation & GitHub Push

**Files:**
- Modify: `README.md`

- [x] **Step 1: Update `README.md`**
- [x] **Step 2: Full automated test suite verification**
- [x] **Step 3: Commit and Push to GitHub**
