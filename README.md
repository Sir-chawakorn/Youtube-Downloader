# 🎬 Local YouTube Downloader

แอปพลิเคชันดาวน์โหลดวิดีโอและเสียงจาก YouTube แบบโลคอลบนเครื่อง (Local Desktop / Web Application) ออกแบบมาให้ใช้งานง่าย รวดเร็ว ปลอดภัย และไม่ต้องพึ่งพาเซิร์ฟเวอร์ภายนอก

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15+-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![yt--dlp](https://img.shields.io/badge/yt--dlp-Latest-FF0000?style=flat&logo=youtube&logoColor=white)

---

## ✨ คุณสมบัติเด่น (Features)

- 🚀 **ดาวน์โหลดง่ายในคลิกเดียว**: เพียงวางลิงก์ YouTube ระบบจะดึงข้อมูลพรีวิว (Thumbnail, Title, Channel, Duration) ให้อัตโนมัติ
- 🎥 **รองรับความละเอียดสูงสุด**: รองรับตั้งแต่ 360p, 720p, 1080p Full HD ไปจนถึง 2K และ 4K (ขึ้นอยู่กับวิดีโอต้นทาง)
- 🎵 **แยกไฟล์เสียง (Audio Extraction)**: แปลงเป็น MP3, M4A, WAV คุณภาพสูงพร้อมฝัง Metadata
- ⚡ **Real-time Progress Tracker**: แสดงแถบดาวน์โหลด ความเร็ว (Speed), ขนาดไฟล์, เปอร์เซ็นต์ และเวลาที่เหลือ (ETA) แบบ Real-time ผ่าน Server-Sent Events (SSE)
- 🗂️ **ประวัติดาวน์โหลด (Download History)**: บันทึกประวัติด้วย SQLite พร้อมปุ่มเปิดโฟลเดอร์ไฟล์หรือเปิดเล่นได้ทันที
- ⚙️ **การตั้งค่าที่ยืดหยุ่น (Settings)**: เลือกโฟลเดอร์ปลายทางที่ต้องการบันทึก, ตั้งค่า Resolution เริ่มต้น, และปรับแต่งระบบได้ตามใจชอบ
- 🎨 **Modern Dark & Light UI**: หน้าตาเรียบหรูสไตล์ Minimal Glassmorphism รองรับการแสดงผลทั้งหน้าจอคอมพิวเตอร์และแท็บเล็ต

---

## 🏗️ โครงสร้างสถาปัตยกรรม (Architecture)

```text
Youtube-Downloader/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/              # API Endpoints (Analyze, Download, History, Settings)
│   │   ├── models/           # Pydantic Schemas & Data Models
│   │   ├── services/         # yt-dlp wrapper, SSE Manager, SQLite Database
│   │   └── utils/            # Validators, Sanitizers, Error handlers
│   ├── data/                 # SQLite Database (app.db)
│   ├── tests/                # Automated Tests (pytest)
│   ├── requirements.txt      # Python dependencies
│   └── run_backend.py        # Backend server entrypoint
│
├── frontend/                 # Next.js App Router Frontend
│   ├── app/                  # App routes (Home, History, Settings)
│   ├── components/           # UI Components (UrlInput, VideoPreview, FormatSelector, etc.)
│   ├── lib/                  # API client & helpers
│   └── types/                # TypeScript type definitions
│
├── docs/                     # Specifications & Implementation plans
├── PRD.md                    # Product Requirements Document
└── pytest.ini                # Pytest configuration
```

---

## 🚀 วิธีการติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
- **Python 3.9+**
- **Node.js 18+** และ **npm**
- **FFmpeg** (แนะนำติดตั้งไว้ในระบบเพื่อให้แปลงไฟล์ได้ทุกรูปแบบ):
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt update && sudo apt install ffmpeg`
  - Windows: ติดตั้งผ่าน `winget install Gyan.FFmpeg` หรือดาวน์โหลดจาก ffmpeg.org

---

### 2. ติดตั้งและรัน Backend

```bash
# 1. เข้าสู่โฟลเดอร์โปรเจกต์
cd Youtube-Downloader

# 2. สร้างและเปิดใช้งาน Virtual Environment
python3 -m venv venv
source venv/bin/activate  # บน Windows: venv\Scripts\activate

# 3. ติดตั้ง Dependencies
pip install -r backend/requirements.txt

# 4. เริ่มรัน Backend Server (FastAPI)
python backend/run_backend.py
# หรือรันผ่าน uvicorn: uvicorn app.main:app --app-dir backend --port 8000 --reload
```
> Backend จะเริ่มทำงานที่ `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`)

---

### 3. ติดตั้งและรัน Frontend

เปิด Terminal อีกหน้าต่างหนึ่ง:

```bash
# 1. เข้าสู่โฟลเดอร์ frontend
cd frontend

# 2. ติดตั้ง Dependencies
npm install

# 3. รัน Development Server
npm run dev
```
> เข้าใช้งานโปรแกรมผ่านเบราว์เซอร์ที่: **`http://localhost:3000`**

---

## 🧪 การทดสอบระบบ (Running Tests)

โปรเจกต์มีชุดการทดสอบแบบ Automated Tests สำหรับฝั่ง Backend:

```bash
source venv/bin/activate
pytest
```

---

## ⚖️ ข้อกำหนดการใช้งาน (Legal Disclaimer)

เครื่องมือนี้จัดทำขึ้นเพื่อการศึกษาและการใช้งานส่วนตัว (Personal Use Only) โปรดใช้สำหรับดาวน์โหลดเนื้อหาที่คุณเป็นเจ้าของ ได้รับอนุญาต หรือเป็นเนื้อหาประเภท Creative Commons / สาธารณสมบัติ (Public Domain) เท่านั้น การใช้งานต้องเป็นไปตามเงื่อนไขการให้บริการของ YouTube และกฎหมายลิขสิทธิ์ที่เกี่ยวข้อง

---

## 📄 ใบอนุญาต (License)

MIT License © 2026 Sir-chawakorn
