"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  Play, 
  FolderOpen, 
  PlusCircle, 
  Download,
  Check,
  HardDriveDownload
} from "lucide-react";
import { api, isLocalBackend } from "@/lib/api";

interface DownloadCompleteProps {
  downloadId: string;
  filename: string;
  filePath: string;
  onReset: () => void;
}

export default function DownloadComplete({
  downloadId,
  filename,
  filePath,
  onReset,
}: DownloadCompleteProps) {
  const [downloaded, setDownloaded] = useState(false);
  const isLocal = isLocalBackend();

  useEffect(() => {
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ef4444", "#f97316", "#10b981", "#3b82f6", "#a855f7"],
      });
    } catch {}

    // Automatically trigger browser download to client device
    const timer = setTimeout(() => {
      handleDownloadToDevice();
    }, 600);

    return () => clearTimeout(timer);
  }, [downloadId]);

  const handleDownloadToDevice = () => {
    try {
      api.triggerBrowserDownload(downloadId, filename);
      setDownloaded(true);
    } catch (err: any) {
      console.error("Browser download failed:", err);
    }
  };

  const handleOpenFile = async () => {
    try {
      await api.openFile(downloadId);
    } catch (err: any) {
      alert(err.message || "ไม่สามารถเปิดไฟล์ได้");
    }
  };

  const handleOpenFolder = async () => {
    try {
      await api.openFolder(downloadId);
    } catch (err: any) {
      alert(err.message || "ไม่สามารถเปิดโฟลเดอร์ได้");
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-emerald-500/30 bg-emerald-500/5 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-1.5 max-w-xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
          ดาวน์โหลดสำเร็จ! (Download Ready)
        </h3>
        <p className="text-sm font-semibold text-emerald-400 truncate">
          {filename}
        </p>
        <p className="text-xs text-slate-400">
          ระบบเริ่มดาวน์โหลดไฟล์ลงในเครื่องของคุณแล้ว หากไม่เริ่มอัตโนมัติ กรุณากดปุ่มสีเขียวด้านล่าง
        </p>
      </div>

      {/* Primary Action Button: Download to Device */}
      <div className="max-w-md mx-auto pt-2">
        <button
          onClick={handleDownloadToDevice}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-600/30 transition-all hover:shadow-emerald-600/50 active:scale-[0.99]"
        >
          {downloaded ? <Check className="w-5 h-5" /> : <HardDriveDownload className="w-5 h-5" />}
          <span>{downloaded ? "ดาวน์โหลดลงเครื่องอีกครั้ง (Download Again)" : "⬇️ ดาวน์โหลดลงเครื่อง (Save to Device)"}</span>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {isLocal && (
          <>
            <button
              onClick={handleOpenFile}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5" />
              <span>เปิดไฟล์ในเครื่อง</span>
            </button>

            <button
              onClick={handleOpenFolder}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-all active:scale-95"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>เปิดโฟลเดอร์</span>
            </button>
          </>
        )}

        <button
          onClick={onReset}
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-all active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>ดาวน์โหลดวิดีโออื่น (Download Another)</span>
        </button>
      </div>
    </div>
  );
}
