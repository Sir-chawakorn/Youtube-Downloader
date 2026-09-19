# Local YouTube Downloader Implementation Plan

> **For agentic workers:** Implementation plan tracking tasks step-by-step.

**Goal:** Build a complete, production-grade Local YouTube Downloader web/desktop application following all specifications in PRD.md.
**Architecture:** Python FastAPI local backend (`127.0.0.1:8000`) with yt-dlp + FFmpeg + SQLite engine; Next.js 14/15 App Router frontend with Tailwind CSS, Lucide icons, and real-time SSE progress streaming.
**Tech Stack:** Python 3.9+, FastAPI, yt-dlp, FFmpeg, SQLite, SSE, Next.js, React, Tailwind CSS, TypeScript.
**Spec:** `PRD.md`

## Tasks

- [ ] Task 1: Initialize Backend Structure and SQLite Database Engine
- [ ] Task 2: Implement Utility Modules (Filename Sanitizer, Path Checker, Error Translator)
- [ ] Task 3: Implement YouTube Metadata Service (yt-dlp wrapper)
- [ ] Task 4: Implement Download Service (Background Worker, Realtime SSE, Subprocess/yt-dlp, Cancellation, Temp Cleanup)
- [ ] Task 5: Implement Backend API Endpoints (Analyze, Download, Cancel, History, Settings, System)
- [ ] Task 6: Backend Automated Unit & Integration Tests
- [ ] Task 7: Scaffold Next.js Frontend with Tailwind CSS and Component Architecture
- [ ] Task 8: Implement Frontend State, API Client, and Theme Provider
- [ ] Task 9: Implement Downloader Components (UrlInput, VideoPreview, FormatSelector, QualitySelector, AdvancedOptions)
- [ ] Task 10: Implement Live Download Progress, Status Tracker, and Cancel/Retry UI
- [ ] Task 11: Implement Download History Page with Open File/Folder & Redownload
- [ ] Task 12: Implement Settings Page (Folders, Presets, Theme, Engine Health)
- [ ] Task 13: End-to-End Testing & Verification with Real YouTube URLs and Error Cases
- [ ] Task 14: Create Unified Launcher (`run.sh` / `start.py`) and Walkthrough Documentation
