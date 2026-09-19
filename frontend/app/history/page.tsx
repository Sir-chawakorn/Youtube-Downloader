"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Play, 
  FolderOpen, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  ExternalLink, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  FileVideo,
  FileAudio,
  HardDriveDownload
} from "lucide-react";
import { api, isLocalBackend } from "@/lib/api";
import { DownloadRecord } from "@/types/video";
import { formatBytes, formatDate } from "@/lib/utils";
import Toast, { ToastMessage } from "@/components/Toast";

export default function HistoryPage() {
  const [history, setHistory] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const records = await api.getHistory();
      setHistory(records);
    } catch (err: any) {
      console.error("Failed to load history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleOpenFile = async (id: string) => {
    try {
      await api.openFile(id);
    } catch (err: any) {
      setToast({
        type: "error",
        text: err.message || "ไม่สามารถเปิดไฟล์ได้ ไฟล์อาจถูกลบหรือย้าย",
      });
    }
  };

  const handleOpenFolder = async (id: string) => {
    try {
      await api.openFolder(id);
    } catch (err: any) {
      setToast({
        type: "error",
        text: err.message || "ไม่สามารถเปิดโฟลเดอร์ได้",
      });
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setToast({
      type: "success",
      text: "คัดลอก URL เรียบร้อยแล้ว",
    });
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      setToast({
        type: "success",
        text: "ลบออกจากประวัติแล้ว (ไฟล์ในเครื่องยังคงอยู่)",
      });
    } catch (err: any) {
      setToast({
        type: "error",
        text: err.message || "ลบประวัติไม่สำเร็จ",
      });
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("คุณต้องการล้างประวัติการดาวน์โหลดทั้งหมดใช่หรือไม่? (ไฟล์ในเครื่องจะไม่ถูกลบ)")) {
      return;
    }

    try {
      await api.clearHistory();
      setHistory([]);
      setToast({
        type: "success",
        text: "ล้างประวัติการดาวน์โหลดเรียบร้อยแล้ว",
      });
    } catch (err: any) {
      setToast({
        type: "error",
        text: err.message || "ล้างประวัติไม่สำเร็จ",
      });
    }
  };

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.channel.toLowerCase().includes(q) ||
      item.format.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
            <span>ประวัติการดาวน์โหลด</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
              {history.length} รายการ
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            ดูรายการวิดีโอและไฟล์เสียงที่เคยดาวน์โหลด เปิดไฟล์ หรือเปิดโฟลเดอร์ปลายทาง
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ล้างประวัติทั้งหมด</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาตามชื่อวิดีโอ หรือชื่อช่อง..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-red-500"
          />
        </div>
      )}

      {/* Content List */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">กำลังโหลดประวัติ...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-slate-500">
            <Download className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-200">
              {searchQuery ? "ไม่พบผลการค้นหา" : "ยังไม่มีประวัติการดาวน์โหลด"}
            </h3>
            <p className="text-xs text-slate-400">
              {searchQuery ? "ลองพิมพ์คำค้นหาอื่น" : "เมื่อคุณดาวน์โหลดวิดีโอ รายการจะถูกบันทึกไว้ที่นี่"}
            </p>
          </div>
          {!searchQuery && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>เริ่มดาวน์โหลดวิดีโอ</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isAudio = ["mp3", "m4a", "opus", "wav"].includes(item.format.toLowerCase());
            return (
              <div
                key={item.id}
                className="glass-card glass-card-hover rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Thumbnail & Title */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        {isAudio ? <FileAudio className="w-6 h-6" /> : <FileVideo className="w-6 h-6" />}
                      </div>
                    )}
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white uppercase">
                      .{item.format}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-sm font-bold text-slate-100 truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      {item.channel && <span className="font-medium text-slate-300">{item.channel}</span>}
                      {item.file_size && <span>{formatBytes(item.file_size)}</span>}
                      {item.quality && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-semibold">
                          {item.quality === "best" ? "Best" : `${item.quality}p`}
                        </span>
                      )}
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    {item.file_path && (
                      <p className="text-[11px] font-mono text-slate-500 truncate" title={item.file_path}>
                        {item.file_path}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons (PRD #34) */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  {item.status === "completed" && (
                    <>
                      <button
                        onClick={() => {
                          api.triggerBrowserDownload(item.id, `${item.title}.${item.format}`);
                          setToast({
                            type: "success",
                            text: `เริ่มดาวน์โหลด "${item.title}" ลงเครื่องแล้ว`,
                          });
                        }}
                        className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 transition-colors"
                        title="ดาวน์โหลดลงเครื่อง (Download to Device)"
                      >
                        <HardDriveDownload className="w-4 h-4 text-emerald-400" />
                      </button>

                      {isLocalBackend() && (
                        <>
                          <button
                            onClick={() => handleOpenFile(item.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors"
                            title="เปิดไฟล์ (Open File)"
                          >
                            <Play className="w-4 h-4 text-emerald-400" />
                          </button>
                          <button
                            onClick={() => handleOpenFolder(item.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors"
                            title="เปิดโฟลเดอร์ (Open Folder)"
                          >
                            <FolderOpen className="w-4 h-4 text-amber-400" />
                          </button>
                        </>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => handleCopyUrl(item.id, item.url)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors"
                    title="คัดลอก URL (Copy URL)"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <Link
                    href={`/?url=${encodeURIComponent(item.url)}`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors"
                    title="ดาวน์โหลดอีกครั้ง (Download Again)"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                  </Link>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
                    title="ลบออกจากประวัติ (Remove from History)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
