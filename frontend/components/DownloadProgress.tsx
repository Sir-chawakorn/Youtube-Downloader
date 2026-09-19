"use client";

import React from "react";
import { 
  Loader2, 
  XCircle, 
  ArrowDownCircle, 
  Gauge, 
  Clock, 
  HardDrive,
  FileCheck,
  Layers
} from "lucide-react";
import { ProgressEvent } from "@/types/download";
import { formatBytes } from "@/lib/utils";

interface DownloadProgressProps {
  progress: ProgressEvent;
  onCancel: () => void;
  isCancelling: boolean;
}

export default function DownloadProgress({
  progress,
  onCancel,
  isCancelling,
}: DownloadProgressProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case "queued":
        return "กำลังจัดคิว...";
      case "analyzing":
        return "กำลังดึงสตรีมและเตรียมความพร้อม...";
      case "downloading":
        return "กำลังดาวน์โหลดไฟล์...";
      case "processing":
        return "กำลังประมวลผลข้อมูล...";
      case "merging":
        return "กำลังรวมภาพและเสียงด้วย FFmpeg...";
      case "converting":
        return "กำลังแปลงรูปแบบไฟล์เสียง...";
      case "completed":
        return "ดาวน์โหลดเสร็จสิ้น!";
      case "cancelled":
        return "ยกเลิกการดาวน์โหลดแล้ว";
      case "failed":
        return "เกิดข้อผิดพลาดในการดาวน์โหลด";
      default:
        return "กำลังดำเนินการ...";
    }
  };

  const pct = Math.min(100, Math.max(0, progress.progress || 0));

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-red-500/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
      {/* Header with status badge & cancel button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
            {progress.status === "completed" ? (
              <FileCheck className="w-4 h-4" />
            ) : progress.status === "merging" ? (
              <Layers className="w-4 h-4 animate-pulse" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{getStatusText(progress.status)}</span>
              <span className="text-xs font-mono text-red-400 font-semibold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                {pct.toFixed(1)}%
              </span>
            </h3>
            {progress.filename && (
              <p className="text-xs text-slate-400 font-mono truncate max-w-md">
                {progress.filename}
              </p>
            )}
          </div>
        </div>

        {/* Cancel Button (PRD #29) */}
        {progress.status !== "completed" && progress.status !== "failed" && progress.status !== "cancelled" && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isCancelling}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-red-200 border border-red-500/30 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 active:scale-95"
          >
            {isCancelling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span>{isCancelling ? "กำลังยกเลิก..." : "ยกเลิก"}</span>
          </button>
        )}
      </div>

      {/* Progress Bar with glowing gradient */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-300 shadow-md shadow-red-500/50 relative"
            style={{ width: `${pct}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats Grid: Size, Speed, ETA (PRD #25) */}
      <div className="grid grid-cols-3 gap-3 pt-2 text-xs border-t border-white/5">
        {/* Size */}
        <div className="flex items-center gap-2 text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
          <HardDrive className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">ขนาดไฟล์</p>
            <p className="font-mono text-slate-200 truncate font-medium">
              {formatBytes(progress.downloaded_bytes)}
              {progress.total_bytes ? ` / ${formatBytes(progress.total_bytes)}` : ""}
            </p>
          </div>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2 text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
          <Gauge className="w-4 h-4 text-red-400 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">ความเร็ว</p>
            <p className="font-mono text-slate-200 truncate font-medium">
              {progress.speed_string || "0 KB/s"}
            </p>
          </div>
        </div>

        {/* ETA */}
        <div className="flex items-center gap-2 text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">เวลาที่เหลือ (ETA)</p>
            <p className="font-mono text-slate-200 truncate font-medium">
              {progress.eta_string || "--:--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
