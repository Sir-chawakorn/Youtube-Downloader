"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  Play, 
  FolderOpen, 
  PlusCircle, 
  ExternalLink 
} from "lucide-react";
import { api } from "@/lib/api";

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
  useEffect(() => {
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ef4444", "#f97316", "#10b981", "#3b82f6", "#a855f7"],
      });
    } catch {
      // Ignored if confetti fails
    }
  }, []);

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
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-emerald-500/30 bg-emerald-500/5 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-1.5 max-w-xl mx-auto">
        <h3 className="text-xl font-bold text-slate-100">
          ดาวน์โหลดเสร็จสมบูรณ์! (Download Complete)
        </h3>
        <p className="text-sm font-semibold text-emerald-400 truncate">
          {filename}
        </p>
        <p className="text-xs font-mono text-slate-400 truncate">
          {filePath}
        </p>
      </div>

      {/* Action Buttons (PRD #28) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={handleOpenFile}
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
        >
          <Play className="w-4 h-4" />
          <span>เปิดไฟล์ (Open File)</span>
        </button>

        <button
          onClick={handleOpenFolder}
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white rounded-xl text-sm font-semibold border border-white/10 transition-all active:scale-95"
        >
          <FolderOpen className="w-4 h-4" />
          <span>เปิดโฟลเดอร์ (Open Folder)</span>
        </button>

        <button
          onClick={onReset}
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-semibold border border-white/10 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ดาวน์โหลดวิดีโออื่น (Download Another)</span>
        </button>
      </div>
    </div>
  );
}
