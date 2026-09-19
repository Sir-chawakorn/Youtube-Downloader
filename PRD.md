# PRD.md
# Local YouTube Downloader

**Version:** 1.0  
**Project Type:** Local Desktop / Local Web Application  
**Status:** Ready for Development

---

# 1. Project Overview

สร้างโปรแกรมสำหรับดาวน์โหลดวิดีโอจาก YouTube ลงในเครื่องของผู้ใช้งานอย่างง่าย

ผู้ใช้เพียง:

1. เปิดโปรแกรม
2. วาง YouTube URL
3. โปรแกรมดึงข้อมูลวิดีโอ
4. เลือกรูปแบบไฟล์และคุณภาพ
5. กด Download
6. ไฟล์ถูกบันทึกลงเครื่อง

เป้าหมายหลักคือทำให้ประสบการณ์ใช้งานง่ายกว่าการใช้ Command Line เช่น `yt-dlp` โดยตรง

ตัวโปรแกรมทำงานบนเครื่องผู้ใช้เป็นหลัก และไม่จำเป็นต้อง Upload วิดีโอผ่าน Server ภายนอก

---

# 2. Problem Statement

ปัจจุบันการดาวน์โหลดวิดีโอด้วยเครื่องมืออย่าง `yt-dlp` มีประสิทธิภาพสูง แต่ผู้ใช้ทั่วไปต้อง:

- เปิด Terminal
- จำคำสั่ง
- Copy URL
- เลือก format ผ่าน command
- จัดการ FFmpeg
- หาไฟล์ที่ดาวน์โหลดเอง
- แก้ปัญหา error จาก command line

จึงต้องการสร้าง UI ที่ครอบกระบวนการเหล่านี้ทั้งหมดให้ผู้ใช้สามารถดาวน์โหลดได้จากหน้าจอเดียว

---

# 3. Product Goal

สร้าง Local YouTube Downloader ที่:

- ใช้งานง่าย
- ดาวน์โหลดเร็ว
- รองรับคุณภาพสูง
- รองรับ Video / Audio
- แสดง Progress แบบ Real-time
- ดาวน์โหลดลงเครื่องโดยตรง
- เลือก Folder ได้
- มี Download History
- รองรับหลาย URL
- จัดการ Error ได้ดี
- ไม่ต้องใช้ Command Line

---

# 4. Target Users

## Primary User

ผู้ใช้ทั่วไปที่ต้องการดาวน์โหลดวิดีโอที่ตนมีสิทธิ์ดาวน์โหลด เช่น

- วิดีโอของตัวเอง
- วิดีโอที่ได้รับอนุญาต
- Public-domain / Creative Commons content
- เนื้อหาที่เจ้าของอนุญาตให้ดาวน์โหลด

## Secondary User

- Content Creator
- Video Editor
- นักการตลาด
- นักเรียน / นักศึกษา
- Developer
- เจ้าของ Channel
- ผู้ทำ Archive ของ Content ที่ตนเองเป็นเจ้าของ

---

# 5. Legal / Usage Notice

โปรแกรมเป็นเครื่องมือสำหรับดาวน์โหลดเนื้อหาที่ผู้ใช้มีสิทธิ์ดาวน์โหลดเท่านั้น

โปรแกรมควรแสดงข้อความใน About / First Launch:

> โปรดใช้โปรแกรมนี้เฉพาะกับวิดีโอที่คุณเป็นเจ้าของ ได้รับอนุญาต หรือมีสิทธิ์ดาวน์โหลด การใช้งานต้องเป็นไปตามลิขสิทธิ์และข้อกำหนดของแพลตฟอร์มต้นทาง

ระบบไม่ควรมีฟังก์ชันสำหรับหลีกเลี่ยง DRM หรือระบบควบคุมสิทธิ์การเข้าถึง

---

# 6. Core User Flow

```text
เปิด Application
      ↓
วาง YouTube URL
      ↓
กด Analyze
      ↓
ระบบตรวจ URL
      ↓
ระบบโหลด Metadata
      ↓
แสดง Thumbnail / Title / Channel / Duration
      ↓
เลือก Format
      ↓
เลือก Quality
      ↓
เลือก Save Folder
      ↓
กด Download
      ↓
แสดง Progress
      ↓
Merge Video + Audio (ถ้าจำเป็น)
      ↓
Download Completed
      ↓
Open File / Open Folder
```

---

# 7. Main Screen

หน้าหลักควรเรียบง่ายและมี Input หลักเพียงจุดเดียว

## Header

แสดง:

```text
YouTube Downloader
Download videos directly to your computer
```

---

# 8. URL Input

องค์ประกอบ:

```text
[ Paste YouTube URL here...                    ]

[ Paste ]    [ Analyze ]
```

รองรับ URL ตัวอย่าง:

```text
https://www.youtube.com/watch?v=xxxx
https://youtu.be/xxxx
https://youtube.com/shorts/xxxx
```

ระบบควร Trim whitespace อัตโนมัติ

---

# 9. Auto Detect Clipboard

Optional Feature

เมื่อ User Copy URL YouTube และเปิด Application

ระบบสามารถตรวจ Clipboard และแสดง:

```text
YouTube link detected

https://youtu.be/xxxxxxxx

[ Analyze ]
```

ต้องมี Settings:

```text
Detect YouTube links from clipboard
ON / OFF
```

Default:

```text
OFF
```

เพื่อป้องกันการอ่านข้อความ Clipboard โดยไม่จำเป็น

---

# 10. Video Analysis

เมื่อกด Analyze

Backend ใช้ `yt-dlp` เพื่อดึง Metadata

ข้อมูลที่ต้องดึง:

```text
Video ID
Title
Description
Thumbnail
Channel Name
Channel URL
Duration
Upload Date
View Count
Available Formats
Available Audio Formats
Available Video Formats
Subtitles
```

---

# 11. Video Information Card

หลัง Analyze สำเร็จ

แสดง:

```text
┌───────────────────────────────────┐

[ Thumbnail ]

Video Title

Channel Name

Duration: 12:45

Available up to: 2160p

└───────────────────────────────────┘
```

---

# 12. Download Type

ให้เลือก:

```text
Video
Audio Only
```

UI:

```text
Download as

(●) Video
( ) Audio Only
```

---

# 13. Video Quality

กรณีเลือก Video

แสดง Resolution ที่มีจริงจาก YouTube

ตัวอย่าง:

```text
Quality

Auto / Best
2160p 4K
1440p
1080p
720p
480p
360p
```

ห้ามแสดง Resolution ที่วิดีโอนั้นไม่มี

---

# 14. Recommended Default

Default:

```text
Quality: Best
Format: MP4
```

เพื่อให้ User ทั่วไปไม่ต้องตั้งค่าอะไร

---

# 15. Video Format

รองรับ:

```text
MP4
WEBM
MKV
```

Default:

```text
MP4
```

กรณี Video และ Audio ต้อง Merge

ใช้:

```text
FFmpeg
```

---

# 16. Audio Download

เมื่อเลือก:

```text
Audio Only
```

ให้สามารถเลือก:

```text
MP3
M4A
OPUS
WAV
```

Audio Quality:

```text
Best
320 kbps
256 kbps
192 kbps
128 kbps
```

Default:

```text
MP3
Best
```

---

# 17. Advanced Settings

ซ่อนอยู่หลังปุ่ม:

```text
Advanced Settings
```

เมื่อเปิดแสดง:

```text
Video Codec
Audio Codec
FPS
Container
Subtitle
Metadata
Thumbnail
Filename Template
```

---

# 18. Subtitle Support

ให้ User เลือก:

```text
Download subtitles
```

Options:

```text
None
English
Thai
Original Language
All Available
```

และ:

```text
Embed subtitle into video
```

---

# 19. Thumbnail

Option:

```text
Save thumbnail
```

และ:

```text
Embed thumbnail into audio file
```

---

# 20. Metadata

Option:

```text
Embed metadata
```

เช่น:

```text
Title
Artist / Channel
Upload Date
Description
Thumbnail
```

---

# 21. Save Location

แสดง:

```text
Save to

/Users/username/Downloads/YouTube

[ Browse ]
```

User สามารถเลือก Folder ได้

ระบบต้องจำ Folder ล่าสุด

---

# 22. Filename Template

Default:

```text
%(title)s.%(ext)s
```

Advanced Options:

```text
Title
Title + Channel
Title + Video ID
Upload Date + Title
Custom
```

ตัวอย่าง:

```text
%(upload_date)s - %(title)s.%(ext)s
```

---

# 23. Safe Filename

ก่อน Save ต้อง sanitize filename

จัดการตัวอักษร:

```text
/
\
:
*
?
"
<
>
|
```

และชื่อไฟล์ที่ OS ไม่รองรับ

---

# 24. Download Button

ปุ่มหลัก:

```text
Download
```

ปุ่มควร Disabled หาก:

- URL ยังไม่ได้ Analyze
- ไม่มี Download Format
- Folder ไม่สามารถเขียนได้

---

# 25. Download Progress

ขณะ Download แสดง:

```text
Downloading...

██████████████░░░░░░ 68%

68.2 MB / 100 MB

Speed: 12.5 MB/s

ETA: 00:04
```

ข้อมูล:

```text
percentage
downloaded_bytes
total_bytes
speed
ETA
current status
```

---

# 26. Download States

ระบบต้องรองรับ State:

```text
queued
analyzing
downloading
processing
merging
converting
completed
failed
cancelled
```

---

# 27. Download Status UI

ตัวอย่าง:

```text
Downloading video...
```

จากนั้น:

```text
Downloading audio...
```

จากนั้น:

```text
Merging video and audio...
```

จากนั้น:

```text
Completed
```

เพื่อไม่ให้ User คิดว่าโปรแกรมค้าง

---

# 28. Download Complete

เมื่อสำเร็จ:

```text
Download Complete

video-name.mp4

[ Open File ]

[ Open Folder ]

[ Download Another ]
```

---

# 29. Cancel Download

ระหว่างดาวน์โหลด:

```text
[ Cancel ]
```

เมื่อ User กด

ระบบต้อง:

1. หยุด Process
2. Terminate yt-dlp
3. ลบ temporary files ถ้าปลอดภัย
4. เปลี่ยน State เป็น cancelled

---

# 30. Retry

ถ้า Download Failed

แสดง:

```text
Download failed

Reason:
Connection interrupted

[ Retry ]

[ Details ]
```

Retry ใช้ Settings เดิมทั้งหมด

---

# 31. Error Handling

ต้องแปลง Error Technical ให้คนทั่วไปเข้าใจ

ตัวอย่าง

แทนที่จะแสดง:

```text
ERROR: Requested format is not available
```

ให้แสดง:

```text
คุณภาพที่เลือกไม่สามารถดาวน์โหลดได้

กรุณาเลือก Auto / Best หรือเลือกคุณภาพอื่น
```

---

# 32. Common Errors

รองรับอย่างน้อย:

```text
Invalid URL
Video unavailable
Video deleted
Private video
Login required
Age restricted
Geo restricted
Network error
Timeout
Disk full
Permission denied
FFmpeg not installed
yt-dlp error
Format unavailable
Playlist unavailable
```

---

# 33. Download History

มี Tab:

```text
Downloads
```

แสดง:

```text
Thumbnail
Title
Format
Quality
File Size
Download Date
Status
File Path
```

---

# 34. History Actions

แต่ละรายการมี:

```text
Open File
Open Folder
Copy URL
Download Again
Remove From History
```

หมายเหตุ:

```text
Remove From History
```

ต้องไม่ลบไฟล์จริง

---

# 35. Multiple Downloads

Version หลัง MVP รองรับ Queue

User วาง URL หลาย URL:

```text
URL 1
URL 2
URL 3
URL 4
```

ระบบสร้าง Download Queue

---

# 36. Queue

ตัวอย่าง:

```text
Download Queue

1. Video A    Downloading 73%
2. Video B    Waiting
3. Video C    Waiting
4. Video D    Waiting
```

---

# 37. Parallel Download

Settings:

```text
Concurrent downloads

1
2
3
4
```

Default:

```text
2
```

แต่ MVP สามารถเริ่มจาก:

```text
1 download at a time
```

ก่อนเพื่อความเสถียร

---

# 38. Playlist Support

Phase 2

ถ้า URL เป็น Playlist

แสดง:

```text
Playlist detected

42 videos
```

จากนั้นแสดงรายการพร้อม Checkbox

```text
[x] Video 1
[x] Video 2
[x] Video 3
[ ] Video 4
```

และปุ่ม:

```text
Select All
Clear All
Download Selected
```

---

# 39. Shorts Support

รองรับ:

```text
youtube.com/shorts/VIDEO_ID
```

ให้ทำงานเหมือน Video ปกติ

---

# 40. YouTube Live

ถ้าเป็น Live ที่จบแล้ว:

สามารถดาวน์โหลดได้ตามความสามารถของ downloader engine

ถ้ายัง Live:

MVP แสดง:

```text
Live stream downloading is not supported yet.
```

Live recording สามารถเป็น Phase หลัง

---

# 41. Cookies

Advanced Feature

รองรับ Cookie สำหรับ Content ที่ User มีสิทธิ์เข้าถึงด้วย Account ของตัวเอง

วิธีที่ควรออกแบบ:

```text
Use browser cookies
```

User เลือก:

```text
Chrome
Edge
Firefox
Safari
```

ไม่ควร Upload cookie ไป Server

Cookie ต้องถูกใช้เฉพาะ Local Process เท่านั้น

---

# 42. Technology Stack

Recommended architecture:

```text
Frontend
↓
Next.js / React
↓
Local Backend
↓
Python FastAPI
↓
yt-dlp
↓
FFmpeg
↓
Local File System
```

Alternative หากต้องการ App ติดตั้งจริง:

```text
Tauri
+
React / Next.js
+
Python sidecar
```

หรือ:

```text
Electron
+
React
+
Node.js
+
yt-dlp
```

---

# 43. Recommended MVP Stack

แนะนำ:

```text
Frontend:
Next.js
TypeScript
Tailwind CSS

Backend:
Python
FastAPI

Download Engine:
yt-dlp

Media Processing:
FFmpeg

Database:
SQLite

Realtime:
Server-Sent Events หรือ WebSocket

Runtime:
localhost
```

---

# 44. Why Local Backend

ไม่ควรให้ Server กลาง Download Video แล้วส่งกลับ User เพราะจะ:

- ใช้ Bandwidth Server จำนวนมาก
- เปลือง Storage
- เพิ่มค่า Server
- Download ช้าลง
- มี Privacy issue
- ต้องดูแล Temporary File
- เพิ่ม Legal / operational complexity

Architecture ที่ต้องการคือ:

```text
YouTube
   ↓
User Computer
   ↓
Local Storage
```

ไม่ใช่:

```text
YouTube
   ↓
Our Server
   ↓
User
```

---

# 45. Backend Structure

ตัวอย่าง:

```text
backend/

app/
  main.py

  api/
    analyze.py
    download.py
    history.py
    settings.py

  services/
    youtube_service.py
    download_service.py
    ffmpeg_service.py
    metadata_service.py

  models/
    download.py
    video.py
    settings.py

  utils/
    filename.py
    filesystem.py
    validators.py

data/
  app.db

downloads/

requirements.txt
```

---

# 46. Frontend Structure

```text
frontend/

app/
  page.tsx
  downloads/
  settings/

components/
  UrlInput.tsx
  VideoPreview.tsx
  FormatSelector.tsx
  QualitySelector.tsx
  DownloadButton.tsx
  DownloadProgress.tsx
  DownloadQueue.tsx
  DownloadHistory.tsx
  SettingsDialog.tsx

lib/
  api.ts
  download.ts

types/
  video.ts
  download.ts
```

---

# 47. API — Analyze URL

Endpoint:

```http
POST /api/analyze
```

Request:

```json
{
  "url": "https://youtube.com/watch?v=VIDEO_ID"
}
```

Response:

```json
{
  "id": "VIDEO_ID",
  "title": "Example Video",
  "channel": "Example Channel",
  "duration": 624,
  "thumbnail": "https://...",
  "formats": [],
  "subtitles": [],
  "max_resolution": 2160
}
```

---

# 48. API — Start Download

```http
POST /api/download
```

Request:

```json
{
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "type": "video",
  "quality": "1080",
  "format": "mp4",
  "save_path": "/Users/example/Downloads/YouTube",
  "subtitle": false,
  "embed_metadata": true
}
```

Response:

```json
{
  "download_id": "uuid",
  "status": "queued"
}
```

---

# 49. Download Progress API

สามารถใช้:

```text
SSE
```

ตัวอย่าง:

```http
GET /api/download/{download_id}/events
```

Event:

```json
{
  "status": "downloading",
  "progress": 68.3,
  "speed": 12582912,
  "eta": 4,
  "downloaded_bytes": 68157440,
  "total_bytes": 100663296
}
```

---

# 50. Cancel API

```http
POST /api/download/{download_id}/cancel
```

---

# 51. History API

```http
GET /api/history
```

---

# 52. Settings API

```http
GET /api/settings

PUT /api/settings
```

Settings:

```json
{
  "default_folder": "",
  "default_quality": "best",
  "default_video_format": "mp4",
  "default_audio_format": "mp3",
  "embed_metadata": true,
  "clipboard_detection": false
}
```

---

# 53. Database

ใช้ SQLite

Table:

```text
downloads
```

Fields:

```text
id
video_id
url
title
channel
thumbnail
format
quality
file_path
file_size
status
created_at
completed_at
error_message
```

---

# 54. Settings Table

```text
settings

key
value
updated_at
```

หรือเก็บ Local JSON ก็ได้สำหรับ MVP

---

# 55. yt-dlp Integration

Backend ต้องเรียก `yt-dlp` ผ่าน Python API หรือ subprocess

แนะนำให้แยก Service:

```text
YoutubeService
```

สำหรับ Analyze

และ:

```text
DownloadService
```

สำหรับ Download

เพื่อไม่ให้ Logic ผูกกับ UI

---

# 56. FFmpeg Integration

ใช้ FFmpeg สำหรับ:

```text
Merge Video + Audio
Convert Audio
Embed Subtitle
Embed Thumbnail
Embed Metadata
Container Conversion
```

App ต้องตรวจ FFmpeg ตอน Startup

---

# 57. Dependency Check

เมื่อเปิด App:

ตรวจ:

```text
yt-dlp
FFmpeg
Python Runtime
Write Permission
```

ถ้ามี Dependency ขาด

แสดงข้อความชัดเจน

---

# 58. Auto Install Dependencies

ถ้า Packaging เป็น Desktop Application

ควร bundle:

```text
yt-dlp
FFmpeg
```

มากับ App

เพื่อ User ไม่ต้อง Install เอง

---

# 59. yt-dlp Updates

YouTube เปลี่ยนระบบบ่อย

ดังนั้น Download Engine ต้องสามารถ Update ได้

Settings:

```text
Check for downloader engine updates
```

App สามารถตรวจ Version และแจ้ง:

```text
A downloader engine update is available.
```

---

# 60. Security Requirements

Local Backend ต้อง Bind:

```text
127.0.0.1
```

ไม่ควร Bind:

```text
0.0.0.0
```

Default

เพื่อไม่เปิด API ให้เครื่องอื่นใน Network เรียกใช้

---

# 61. URL Validation

Backend ต้องตรวจ URL

Allow domain เช่น:

```text
youtube.com
www.youtube.com
m.youtube.com
youtu.be
```

ไม่ควรนำ URL ใดๆ ไป execute เป็น shell command โดยตรง

---

# 62. Command Injection Prevention

ห้ามสร้าง command ด้วยการ concatenate string แบบ:

```text
yt-dlp + USER_INPUT
```

ถ้าใช้ subprocess ต้องส่ง arguments แบบ array และไม่ใช้:

```text
shell=True
```

กับ User Input

---

# 63. Path Security

ตรวจสอบ:

```text
Directory exists
Directory writable
Enough disk space
```

ก่อนดาวน์โหลด

---

# 64. Temporary Files

ใช้ Temporary Directory สำหรับ intermediate files

เช่น:

```text
.app-data/temp/{download_id}/
```

เมื่อ Download สำเร็จ:

```text
cleanup temp files
```

เมื่อ App crash:

ตรวจ orphan temp files ตอน startup และเสนอ cleanup

---

# 65. Disk Space

ก่อน Download ถ้ารู้ Estimated Size

ตรวจ:

```text
Available disk space
```

ถ้าพื้นที่ไม่พอ:

```text
Not enough disk space.

Required: ~3.2 GB
Available: 1.1 GB
```

---

# 66. UX Principles

Interface ต้อง:

- เข้าใจง่าย
- ไม่รก
- Primary action ชัดเจน
- Advanced Options ซ่อนไว้
- Error เป็นภาษาคน
- ไม่แสดง technical logs เป็นค่าเริ่มต้น
- Progress ต้อง Update แบบ Real-time

---

# 67. UI Layout

Desktop:

```text
┌─────────────────────────────────────────────┐
│ YouTube Downloader                          │
│                                             │
│ [ Paste YouTube URL..................... ] │
│                             [ Analyze ]      │
│                                             │
│ ┌────────────┐ Video Title                  │
│ │ Thumbnail  │ Channel                      │
│ │            │ 10:42                        │
│ └────────────┘                              │
│                                             │
│ Download as                                 │
│ [ Video ] [ Audio ]                         │
│                                             │
│ Quality                                     │
│ [ Best ▼ ]                                  │
│                                             │
│ Format                                      │
│ [ MP4 ▼ ]                                   │
│                                             │
│ Save to                                     │
│ ~/Downloads/YouTube          [ Browse ]     │
│                                             │
│          [ Download ]                       │
│                                             │
│ ████████████████░░░ 82%                     │
│ 12.4 MB/s · ETA 4 sec                       │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 68. Responsive Design

Primary target:

```text
Desktop
```

Minimum width:

```text
800px
```

แต่ UI ควร Responsive เพื่อให้เปิดผ่าน Browser ขนาดเล็กได้

---

# 69. Theme

รองรับ:

```text
Light
Dark
System
```

Default:

```text
System
```

---

# 70. Settings Page

Sections:

```text
Downloads
Video
Audio
Appearance
Advanced
About
```

---

# 71. Download Settings

```text
Default Download Folder
Default Video Quality
Default Video Format
Default Audio Format
Concurrent Downloads
Filename Template
```

---

# 72. Advanced Settings

```text
FFmpeg path

yt-dlp path

Cookies source

Network timeout

Retry count

Proxy

Debug logging
```

Proxy เป็น Advanced Optional Feature

---

# 73. Logs

เก็บ Local Log:

```text
logs/app.log
```

ไม่เก็บ:

```text
browser cookies
passwords
authentication tokens
```

ใน Plain Text

---

# 74. Debug Mode

Settings:

```text
Developer Mode
```

เมื่อเปิดให้แสดง:

```text
yt-dlp output
FFmpeg output
API errors
Download events
```

เหมาะสำหรับแก้ปัญหา

---

# 75. Privacy

หลักการ:

```text
Local First
```

ข้อมูลเหล่านี้ไม่ควรถูกส่งออกจากเครื่อง:

```text
Download History
Cookies
File Paths
Video URLs
User Settings
```

เว้นแต่ User เปิด Telemetry เองในอนาคต

MVP:

```text
No telemetry
```

---

# 76. Performance

เป้าหมาย:

Analyze URL:

```text
< 5 seconds
```

ในสภาวะ Network ปกติ

Progress update:

```text
อย่างน้อยทุก 1 second
```

UI ต้องไม่ freeze ระหว่าง Download

---

# 77. Download Engine Threading

Download Process ต้องไม่ Block Main UI

ใช้:

```text
background process
async task
worker thread
```

ตาม architecture ที่เลือก

---

# 78. Persistence

ถ้าปิด UI แต่ Backend ยังทำงาน

สามารถเลือก:

Phase 1:

```text
Close App = Stop downloads
```

Phase 2:

```text
Minimize to tray
Continue downloads
```

---

# 79. System Tray

Phase 2

สามารถ:

```text
Open App
Show Downloads
Pause All
Exit
```

---

# 80. Notifications

หลัง Download สำเร็จ

Desktop notification:

```text
Download Complete

Video Name
```

กด Notification แล้วเปิด Folder

---

# 81. Keyboard Shortcuts

Optional:

```text
Ctrl/Cmd + V
Paste URL

Ctrl/Cmd + Enter
Analyze

Ctrl/Cmd + D
Download

Ctrl/Cmd + ,
Settings
```

---

# 82. MVP Scope

Version 1 ต้องมี:

- Paste YouTube URL
- Analyze URL
- Thumbnail
- Video title
- Channel
- Duration
- Video download
- Audio download
- Quality selection
- MP4 support
- MP3 support
- Best quality option
- Folder selection
- Progress bar
- Speed
- ETA
- Cancel
- Error handling
- Open File
- Open Folder
- Download History
- Local SQLite
- FFmpeg integration
- yt-dlp integration

---

# 83. Not Required For MVP

ยังไม่จำเป็น:

- Playlist
- Queue หลายไฟล์
- Concurrent download
- Live stream recording
- Channel download
- Scheduling
- Cloud sync
- User accounts
- Remote server
- Mobile app
- Browser extension

---

# 84. Phase 2

เพิ่ม:

```text
Playlist Download
Queue
Multiple Downloads
Subtitle Download
Thumbnail
Metadata
Browser Cookies
System Tray
Desktop Notification
Advanced Filename Template
```

---

# 85. Phase 3

เพิ่ม:

```text
Channel Download
Download selected playlist videos
Download scheduling
Duplicate detection
Smart folder rules
Search history
Preset profiles
```

---

# 86. Download Presets

Phase 2

ตัวอย่าง:

```text
Best Quality

1080p MP4

720p MP4

Audio MP3

Audio Original
```

User สามารถสร้าง Preset เอง

---

# 87. Duplicate Detection

ตรวจจาก:

```text
video_id
```

ถ้าเคย Download แล้ว:

```text
This video was downloaded before.

[ Open Existing ]

[ Download Again ]
```

---

# 88. Startup Behaviour

เมื่อเปิดโปรแกรม:

```text
1. Initialize local backend
2. Check database
3. Check downloader engine
4. Check FFmpeg
5. Cleanup stale temporary files
6. Load user settings
7. Open application
```

---

# 89. Acceptance Criteria

MVP ถือว่าสำเร็จเมื่อ:

### AC01

User สามารถวาง URL YouTube และกด Analyze ได้

### AC02

ระบบแสดง:

```text
Title
Thumbnail
Channel
Duration
```

ถูกต้อง

### AC03

ระบบแสดง Video Quality ที่สามารถดาวน์โหลดได้จริง

### AC04

User เลือก 1080p และดาวน์โหลดได้

### AC05

ถ้า 1080p Video และ Audio แยก Stream ระบบ Merge ให้อัตโนมัติ

### AC06

ไฟล์สุดท้ายเปิดเล่นได้

### AC07

User สามารถเลือก Download Folder ได้

### AC08

Progress เปลี่ยนแบบ Real-time

### AC09

แสดง Speed และ ETA

### AC10

User Cancel Download ได้

### AC11

User Download Audio เป็น MP3 ได้

### AC12

หลัง Download สำเร็จสามารถกด Open Folder ได้

### AC13

History ถูกบันทึกหลัง Download

### AC14

Restart App แล้วยังเห็น History เดิม

### AC15

Error จาก yt-dlp ถูกแปลงเป็นข้อความที่เข้าใจง่าย

---

# 90. Test Cases

## Test 01

Input:

```text
Valid YouTube URL
```

Expected:

```text
Video metadata displayed
```

---

## Test 02

Input:

```text
Invalid URL
```

Expected:

```text
Invalid YouTube URL
```

---

## Test 03

Input:

```text
Deleted video
```

Expected:

```text
Video is unavailable.
```

---

## Test 04

Download:

```text
1080p MP4
```

Expected:

```text
Playable MP4 file
```

---

## Test 05

Download:

```text
MP3
```

Expected:

```text
Playable MP3 file
```

---

## Test 06

Network disconnected during download

Expected:

```text
Download failed
Retry button available
```

---

## Test 07

Disk full

Expected:

```text
Clear disk space warning
```

---

## Test 08

Cancel Download

Expected:

```text
Process terminated
State = cancelled
UI usable immediately
```

---

# 91. Definition of Done

Feature ถือว่า Done เมื่อ:

- Function ทำงานจริง
- มี Error Handling
- ไม่มี UI freeze
- ผ่าน Test Case
- ไม่มี uncaught exception
- ไม่ทิ้ง temporary file โดยไม่จำเป็น
- UI แสดง status ถูกต้อง
- Error message เข้าใจง่าย

---

# 92. Suggested Development Order

สร้างตามลำดับนี้:

```text
STEP 1
Create frontend UI

STEP 2
Create FastAPI local backend

STEP 3
Integrate yt-dlp analyze

STEP 4
Display video metadata

STEP 5
Integrate basic video download

STEP 6
Add FFmpeg

STEP 7
Add quality selector

STEP 8
Add real-time download progress

STEP 9
Add audio download

STEP 10
Add folder selector

STEP 11
Add cancel / retry

STEP 12
Add SQLite history

STEP 13
Add settings

STEP 14
Improve error handling

STEP 15
Package as desktop application
```

---

# 93. AI Coding Agent Instructions

เมื่อใช้ Claude Code / Codex / AI Coding Agent สร้างโปรเจกต์นี้:

1. อ่าน `PRD.md` ทั้งหมดก่อนเขียน Code
2. เริ่มจาก MVP เท่านั้น
3. ห้ามเพิ่ม Feature นอก Scope จนกว่า MVP จะทำงาน
4. แยก Frontend / Backend / Download Engine ชัดเจน
5. ห้ามให้ Main UI Thread ทำ Download โดยตรง
6. ทุก Download ต้องมี Unique ID
7. ทุก Process ต้อง Cancel ได้
8. ทุก Error ต้อง Handle
9. ห้ามใช้ `shell=True` กับ User Input
10. ห้าม Hardcode Download Folder
11. Config ต้องเก็บ Local
12. Download History ต้อง Persist
13. ก่อนแก้ Architecture ใหญ่ต้องอ่าน PRD ใหม่
14. Code ต้องแบ่งเป็น Module ไม่สร้างไฟล์ขนาดใหญ่ไฟล์เดียว
15. หลังจบแต่ละ Feature ต้องทดสอบก่อนทำ Feature ถัดไป

---

# 94. Final Product Vision

เป้าหมายสุดท้ายคือทำให้การดาวน์โหลดวิดีโอที่ผู้ใช้มีสิทธิ์ดาวน์โหลดง่ายประมาณ:

```text
Paste
↓
Choose
↓
Download
```

ผู้ใช้ไม่จำเป็นต้องรู้จัก:

```text
yt-dlp
FFmpeg
Codec
Command Line
Video Stream
Audio Stream
```

แต่ผู้ใช้ระดับ Advanced ยังสามารถเปิด Advanced Settings เพื่อควบคุมรายละเอียดเพิ่มเติมได้

ผลิตภัณฑ์ควรให้ความรู้สึกว่าเป็น:

> "GUI ที่เรียบง่ายและเป็นมิตร ครอบความสามารถของ yt-dlp และ FFmpeg สำหรับการใช้งานบนเครื่องของตัวเอง"