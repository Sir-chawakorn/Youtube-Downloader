# 🎬 YouTube Downloader (Web & Local)

แอปพลิเคชันดาวน์โหลดวิดีโอและไฟล์เสียงจาก YouTube ใช้งานได้ทั้งบนเว็บเบราว์เซอร์ (รองรับการ Deploy บน **Vercel**) และการรันแบบโลคอลบนเครื่อง (Local Desktop) พร้อมระบบดาวน์โหลดไฟล์ตรงลงสู่เครื่องผู้ใช้งาน (Direct Browser Download)

![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat&logo=vercel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15+-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat&logo=python&logoColor=white)
![yt--dlp](https://img.shields.io/badge/yt--dlp-Latest-FF0000?style=flat&logo=youtube&logoColor=white)

---

## ✨ คุณสมบัติเด่น (Features)

- 🚀 **ดาวน์โหลดง่ายผ่านเว็บ**: วางลิงก์ YouTube ระบบจะดึงพรีวิว (Thumbnail, Title, Channel, Duration) ให้อัตโนมัติ
- 💾 **ดาวน์โหลดลงเครื่องทันที (Save to Device)**: เมื่อประมวลผลเสร็จ เบราว์เซอร์จะเริ่มดาวน์โหลดไฟล์วิดีโอ/เสียงเข้าโฟลเดอร์ Downloads ในเครื่องผู้ใช้โดยตรง
- 🎥 **รองรับความละเอียดสูงสุด**: 360p, 720p, 1080p Full HD, 2K และ 4K (ตามต้นฉบับวิดีโอ)
- 🎵 **แยกไฟล์เสียง (Audio Extraction)**: แปลงเป็น MP3, M4A, WAV คุณภาพสูงพร้อมฝัง Metadata
- ⚡ **Real-time Progress Tracker**: แสดงแถบดาวน์โหลด ความเร็ว, เปอร์เซ็นต์ และเวลาที่เหลือแบบ Real-time ผ่าน Server-Sent Events (SSE)
- 🗂️ **ประวัติดาวน์โหลด (History)**: บันทึกรายการวิดีโอที่เคยดาวน์โหลด พร้อมปุ่มกดโหลดไฟล์ลงเครื่องซ้ำได้ตลอดเวลา
- ☁️ **พร้อม Deploy บน Vercel**: ตั้งค่า `vercel.json` สำหรับ Frontend และเตรียม `Dockerfile` / `render.yaml` สำหรับ Backend เรียบร้อยแล้ว
- 🔌 **Dynamic Backend Switching**: สามารถเปลี่ยนหรือทดสอบการเชื่อมต่อ URL ของ Backend ได้โดยตรงผ่านหน้า Settings ในเว็บ

---

## 🏗️ โครงสร้างสถาปัตยกรรม (Architecture)

```text
Youtube-Downloader/
├── vercel.json               # Vercel Deployment Configuration
├── Dockerfile                # Backend Container (Python + FFmpeg)
├── render.yaml               # 1-Click Render.com Deployment Blueprint
├── Procfile                  # Railway / Heroku process configuration
├── package.json              # Workspace root build scripts
│
├── frontend/                 # Next.js 15 App Router Frontend
│   ├── app/                  # Pages: Home (/), History (/history), Settings (/settings)
│   ├── components/           # UI Components (Navbar, UrlInput, VideoPreview, DownloadProgress, etc.)
│   ├── lib/                  # API client & dynamic backend resolver
│   └── types/                # TypeScript interfaces
│
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/              # API Endpoints (Analyze, Download, File Stream, History, Settings)
│   │   ├── models/           # Pydantic Schemas & Data Models
│   │   ├── services/         # yt-dlp wrapper, SSE Stream, SQLite Database
│   │   └── utils/            # Validators, Sanitizers, Error handlers
│   ├── data/                 # SQLite Database storage
│   ├── tests/                # Automated pytest test cases
│   ├── requirements.txt      # Python dependencies
│   └── run_backend.py        # Backend entrypoint
│
└── docs/                     # Specifications & Architecture documentation
```

---

## 🌐 วิธีนำไป Deploy บน Vercel + Cloud Backend

### ขั้นตอนที่ 1: Deploy Frontend บน Vercel
1. เข้าไปที่ [Vercel Dashboard](https://vercel.com/dashboard) แล้วคลิก **"Add New Project"**
2. เลือก Repository `Sir-chawakorn/Youtube-Downloader`
3. ในส่วน Build Settings: โปรเจกต์มี `vercel.json` กำหนดค่าไว้แล้ว สามารถกด **Deploy** ได้ทันที!
4. (ตัวเลือก) หากมี Backend บนคลาวด์แล้ว สามารถใส่ Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.onrender.com/api`

---

### ขั้นตอนที่ 2: Deploy Backend ฟรีบน Render.com (หรือ Railway / VPS)
เนื่องจาก YouTube Downloader ต้องใช้ `yt-dlp` และ `ffmpeg` ในการประมวลผลไฟล์ขนาดใหญ่ จึงต้องรัน Backend บนเซิร์ฟเวอร์:

1. สมัคร/เข้าสู่ระบบ [Render.com](https://render.com/)
2. คลิก **New +** -> เลือก **Web Service**
3. เชื่อมต่อกับ Repository `Sir-chawakorn/Youtube-Downloader`
4. ตั้งค่า Environment:
   - **Runtime:** `Docker` (Render จะตรวจพบ `Dockerfile` อัตโนมัติ)
   - **Instance Type:** `Free`
5. เพิ่ม Environment Variable:
   - `CORS_ALLOW_ALL` = `true`
6. กด **Create Web Service** แล้วคัดลอก URL ของ Backend เช่น: `https://youtube-backend.onrender.com`
7. นำ URL ที่ได้ไปใส่ใน **Settings** บนหน้าเว็บ Vercel ของคุณ หรือตั้งใน Environment Variable ของ Vercel

---

## 💻 วิธีการรันใช้งานบนเครื่อง Localhost (Development)

### 1. ความต้องการของระบบ (Prerequisites)
- **Python 3.9+**
- **Node.js 18+**
- **FFmpeg** (ติดตั้งผ่าน `brew install ffmpeg` บน macOS หรือ `winget install Gyan.FFmpeg` บน Windows)

### 2. รัน Backend (FastAPI)
```bash
# 1. สร้าง Virtual Environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. ติดตั้ง Dependencies
pip install -r backend/requirements.txt

# 3. เริ่มรัน Backend Server
python backend/run_backend.py
```
> Backend จะเริ่มทำงานที่ `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`)

### 3. รัน Frontend (Next.js)
เปิด Terminal อีกหน้าต่างหนึ่ง:
```bash
npm run dev
# หรือ cd frontend && npm run dev
```
> เข้าใช้งานโปรแกรมผ่านเบราว์เซอร์ที่: **`http://localhost:3000`**

---

## 🧪 การรันชุดทดสอบ (Automated Tests)

```bash
# ทดสอบ Backend (18 tests)
source venv/bin/activate
pytest

# ตรวจสอบการ Build ของ Frontend
npm run build
```

---

## ⚖️ ข้อกำหนดการใช้งาน (Legal Disclaimer)

เครื่องมือนี้จัดทำขึ้นเพื่อการศึกษาและการใช้งานส่วนตัว (Personal Use Only) โปรดใช้สำหรับดาวน์โหลดเนื้อหาที่คุณเป็นเจ้าของ ได้รับอนุญาต หรือเป็นเนื้อหาประเภท Creative Commons / สาธารณสมบัติ (Public Domain) เท่านั้น การใช้งานต้องเป็นไปตามเงื่อนไขการให้บริการของ YouTube และกฎหมายลิขสิทธิ์ที่เกี่ยวข้อง

---

## 📄 ใบอนุญาต (License)

MIT License © 2026 Sir-chawakorn
