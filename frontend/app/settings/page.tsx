"use client";

import React, { useState, useEffect } from "react";
import { 
  Folder, 
  FolderOpen, 
  Sliders, 
  Sparkles, 
  Save, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Cpu,
  RefreshCw,
  RotateCcw
} from "lucide-react";
import { api } from "@/lib/api";
import { AppSettings, SystemStatus, CommonFolder } from "@/types/download";
import Toast, { ToastMessage } from "@/components/Toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [commonFolders, setCommonFolders] = useState<CommonFolder[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const loadData = async () => {
    try {
      const [s, sys, cf] = await Promise.all([
        api.getSettings(),
        api.getSystemStatus(),
        api.getCommonFolders(),
      ]);
      setSettings(s);
      setSystemStatus(sys);
      setCommonFolders(cf.folders);
    } catch (err: any) {
      setToast({
        type: "error",
        text: err.message || "ไม่สามารถโหลดการตั้งค่าได้",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePickFolder = async () => {
    try {
      const res = await api.pickFolder();
      if (res.success && res.path && settings) {
        setSettings({ ...settings, default_folder: res.path });
      }
    } catch {
      // Ignored
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setToast({
        type: "success",
        text: "บันทึกการตั้งค่าเรียบร้อยแล้ว",
      });
    } catch (err: any) {
      setToast({
        type: "error",
        text: err.message || "บันทึกการตั้งค่าไม่สำเร็จ",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      default_video_quality: "best",
      default_video_format: "mp4",
      default_audio_quality: "best",
      default_audio_format: "mp3",
      embed_metadata: true,
      embed_thumbnail: false,
      clipboard_detection: false,
      filename_template: "%(title)s.%(ext)s",
    });
    setToast({
      type: "success",
      text: "รีเซ็ตเป็นค่าเริ่มต้นแล้ว (อย่าลืมกดบันทึก)",
    });
  };

  if (!settings) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">กำลังโหลดการตั้งค่า...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            ตั้งค่าโปรแกรม (Settings)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            ปรับแต่งค่าเริ่มต้นสำหรับโฟลเดอร์ คุณภาพวิดีโอ/เสียง และฟังก์ชันการทำงาน
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-600/30 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Settings Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Default Folder */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-red-400" />
              <span>โฟลเดอร์บันทึกไฟล์เริ่มต้น</span>
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={settings.default_folder}
                onChange={(e) => setSettings({ ...settings, default_folder: e.target.value })}
                className="flex-1 bg-slate-900/80 px-3.5 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm font-mono text-slate-200 outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handlePickFolder}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-semibold border border-white/10 transition-colors shrink-0"
              >
                <FolderOpen className="w-4 h-4 text-red-400" />
                <span>เลือก</span>
              </button>
            </div>

            {/* Common folders */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500">ทางลัด:</span>
              {commonFolders.map((f) => (
                <button
                  key={f.path}
                  type="button"
                  onClick={() => setSettings({ ...settings, default_folder: f.path })}
                  className={`px-2 py-0.5 rounded-lg text-xs border transition-colors ${
                    settings.default_folder === f.path
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : "bg-white/5 text-slate-400 hover:text-slate-200 border-white/5"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Defaults Video & Audio */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-400" />
              <span>ค่าเริ่มต้นคุณภาพและฟอร์แมต</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Video Quality */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">คุณภาพวิดีโอเริ่มต้น</label>
                <select
                  value={settings.default_video_quality}
                  onChange={(e) => setSettings({ ...settings, default_video_quality: e.target.value })}
                  className="w-full bg-slate-900/80 px-3 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-200 outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="best">ดีที่สุด (Best Quality)</option>
                  <option value="2160">4K (2160p)</option>
                  <option value="1440">2K (1440p)</option>
                  <option value="1080">Full HD (1080p)</option>
                  <option value="720">HD (720p)</option>
                  <option value="480">SD (480p)</option>
                </select>
              </div>

              {/* Video Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">นามสกุลวิดีโอเริ่มต้น</label>
                <select
                  value={settings.default_video_format}
                  onChange={(e) => setSettings({ ...settings, default_video_format: e.target.value })}
                  className="w-full bg-slate-900/80 px-3 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-200 outline-none focus:border-red-500 cursor-pointer uppercase"
                >
                  <option value="mp4">MP4</option>
                  <option value="webm">WEBM</option>
                  <option value="mkv">MKV</option>
                </select>
              </div>

              {/* Audio Quality */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">คุณภาพเสียงเริ่มต้น</label>
                <select
                  value={settings.default_audio_quality}
                  onChange={(e) => setSettings({ ...settings, default_audio_quality: e.target.value })}
                  className="w-full bg-slate-900/80 px-3 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-200 outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="best">ดีที่สุด (Best)</option>
                  <option value="320">320 kbps</option>
                  <option value="256">256 kbps</option>
                  <option value="192">192 kbps</option>
                  <option value="128">128 kbps</option>
                </select>
              </div>

              {/* Audio Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">นามสกุลเสียงเริ่มต้น</label>
                <select
                  value={settings.default_audio_format}
                  onChange={(e) => setSettings({ ...settings, default_audio_format: e.target.value })}
                  className="w-full bg-slate-900/80 px-3 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-200 outline-none focus:border-red-500 cursor-pointer uppercase"
                >
                  <option value="mp3">MP3</option>
                  <option value="m4a">M4A</option>
                  <option value="opus">OPUS</option>
                  <option value="wav">WAV</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Features */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>ตัวเลือกเสริม</span>
            </h2>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-200">
                    ตรวจจับลิงก์ YouTube จากคลิปบอร์ดอัตโนมัติ (Clipboard Detection)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    แสดงแบนเนอร์แจ้งเตือนทันทีเมื่อตรวจพบคลิปบอร์ดที่เป็นลิงก์ YouTube
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.clipboard_detection}
                  onChange={(e) => setSettings({ ...settings, clipboard_detection: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-white/20"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-200">
                    ฝังข้อมูล Metadata อัตโนมัติ (Embed Metadata)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ฝังชื่อวิดีโอ, ชื่อช่อง, วันที่ และคำอธิบายลงในไฟล์มีเดีย
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.embed_metadata}
                  onChange={(e) => setSettings({ ...settings, embed_metadata: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-white/20"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-200">
                    ฝังภาพหน้าปก Thumbnail อัตโนมัติ (Embed Thumbnail)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ใส่รูปหน้าปกเข้าไปในไฟล์เสียงหรือวิดีโอ
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.embed_thumbnail}
                  onChange={(e) => setSettings({ ...settings, embed_thumbnail: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-white/20"
                />
              </label>
            </div>
          </div>
        </div>

        {/* System & Engine Status Right Column */}
        <div className="space-y-6">
          {/* Health Card */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-red-400" />
              <span>สถานะเครื่องมือ (Engine Status)</span>
            </h2>

            {systemStatus ? (
              <div className="space-y-3 text-xs">
                {/* FFmpeg */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">FFmpeg Engine:</span>
                    {systemStatus.ffmpeg_installed ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> พร้อมใช้งาน
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> ไม่พบ
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {systemStatus.ffmpeg_path}
                  </p>
                </div>

                {/* yt-dlp */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">yt-dlp Core:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> v{systemStatus.ytdlp_version}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    โปรแกรมดาวน์โหลดเวอร์ชันล่าสุด
                  </p>
                </div>

                {/* Disk Space */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">พื้นที่ฮาร์ดดิสก์ว่าง:</span>
                    <span className="text-slate-200 font-bold font-mono">
                      {systemStatus.disk_free_gb} GB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    ระบบปฏิบัติการ: {systemStatus.os_name}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">กำลังตรวจสอบสถานะ...</p>
            )}

            <button
              type="button"
              onClick={handleResetDefaults}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่าเริ่มต้นทั้งหมด</span>
            </button>
          </div>

          {/* Privacy Note (PRD #75) */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span>🔒 ความเป็นส่วนตัวระดับสูงสุด (Local-First)</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              โปรแกรมทำงานแบบ Local-First บนเครื่องของคุณ 100% ไม่มีการส่งข้อมูล URL, ประวัติการดาวน์โหลด หรือไฟล์ใดๆ ไปยังเซิร์ฟเวอร์ภายนอก
            </p>
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
