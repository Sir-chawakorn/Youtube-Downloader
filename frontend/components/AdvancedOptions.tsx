"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Folder, 
  FolderOpen, 
  Subtitles, 
  Tag, 
  Image as ImageIcon,
  FileText,
  Check
} from "lucide-react";
import { SubtitleTrack } from "@/types/video";
import { CommonFolder } from "@/types/download";
import { api } from "@/lib/api";

interface AdvancedOptionsProps {
  savePath: string;
  setSavePath: (path: string) => void;
  subtitleLang: string;
  setSubtitleLang: (lang: string) => void;
  embedSubtitle: boolean;
  setEmbedSubtitle: (val: boolean) => void;
  embedMetadata: boolean;
  setEmbedMetadata: (val: boolean) => void;
  embedThumbnail: boolean;
  setEmbedThumbnail: (val: boolean) => void;
  filenameTemplate: string;
  setFilenameTemplate: (tpl: string) => void;
  availableSubtitles: SubtitleTrack[];
  downloadType: "video" | "audio";
}

export default function AdvancedOptions({
  savePath,
  setSavePath,
  subtitleLang,
  setSubtitleLang,
  embedSubtitle,
  setEmbedSubtitle,
  embedMetadata,
  setEmbedMetadata,
  embedThumbnail,
  setEmbedThumbnail,
  filenameTemplate,
  setFilenameTemplate,
  availableSubtitles,
  downloadType,
}: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [commonFolders, setCommonFolders] = useState<CommonFolder[]>([]);

  useEffect(() => {
    api.getCommonFolders()
      .then((res) => setCommonFolders(res.folders))
      .catch(() => {});
  }, []);

  const handlePickFolder = async () => {
    try {
      const res = await api.pickFolder();
      if (res.success && res.path) {
        setSavePath(res.path);
      }
    } catch {
      // Fallback
    }
  };

  const templates = [
    { label: "ชื่อวิดีโอ (Default)", value: "%(title)s.%(ext)s" },
    { label: "ชื่อวิดีโอ - ชื่อช่อง", value: "%(title)s - %(channel)s.%(ext)s" },
    { label: "ชื่อวิดีโอ [ID]", value: "%(title)s [%(id)s].%(ext)s" },
    { label: "วันที่อัปโหลด - ชื่อวิดีโอ", value: "%(upload_date)s - %(title)s.%(ext)s" },
  ];

  return (
    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>ตั้งค่าขั้นสูง (Advanced Options)</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </span>
        <span className="text-xs text-slate-500 font-normal">
          โฟลเดอร์บันทึก, ซับไตเติล, รูปหน้าปก, เมตาดาต้า
        </span>
      </button>

      {isOpen && (
        <div className="p-5 pt-2 border-t border-white/5 space-y-5 animate-in fade-in duration-200">
          {/* Save Location (PRD #21) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-red-400" />
              <span>โฟลเดอร์บันทึกไฟล์ (Save Location)</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={savePath}
                onChange={(e) => setSavePath(e.target.value)}
                placeholder="/Users/username/Downloads/YouTube"
                className="flex-1 bg-slate-900/80 px-3.5 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm font-mono text-slate-200 outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handlePickFolder}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-semibold border border-white/10 transition-colors shrink-0"
              >
                <FolderOpen className="w-4 h-4 text-red-400" />
                <span>เลือกโฟลเดอร์</span>
              </button>
            </div>

            {/* Quick folder suggestions */}
            {commonFolders.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500">ปลายทางด่วน:</span>
                {commonFolders.map((f) => (
                  <button
                    key={f.path}
                    type="button"
                    onClick={() => setSavePath(f.path)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      savePath === f.path
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : "bg-white/5 text-slate-400 hover:text-slate-200 border-white/5"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subtitles & Embedding (PRD #18) */}
          {downloadType === "video" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Subtitles className="w-3.5 h-3.5 text-red-400" />
                <span>คำบรรยาย / ซับไตเติล (Subtitles)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={subtitleLang}
                  onChange={(e) => setSubtitleLang(e.target.value)}
                  className="w-full bg-slate-900/80 px-3 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-200 outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="none">ไม่ดาวน์โหลดคำบรรยาย (None)</option>
                  <option value="th">ภาษาไทย (Thai)</option>
                  <option value="en">English (อังกฤษ)</option>
                  <option value="all">ดาวน์โหลดทุกภาษา (All Available)</option>
                  {availableSubtitles.map((sub) => (
                    <option key={sub.lang} value={sub.lang}>
                      {sub.name} ({sub.lang})
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-white/10 cursor-pointer text-xs sm:text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={embedSubtitle}
                    onChange={(e) => setEmbedSubtitle(e.target.checked)}
                    disabled={subtitleLang === "none"}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-white/20"
                  />
                  <span>ฝังซับไตเติลลงในวิดีโอ (Embed into video)</span>
                </label>
              </div>
            </div>
          )}

          {/* Metadata & Thumbnail Embedding (PRD #19, #20) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-white/10 cursor-pointer text-xs sm:text-sm text-slate-300">
              <input
                type="checkbox"
                checked={embedMetadata}
                onChange={(e) => setEmbedMetadata(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-white/20"
              />
              <Tag className="w-4 h-4 text-red-400" />
              <span>ฝังข้อมูล Metadata (ชื่อ, ช่อง, วันที่)</span>
            </label>

            <label className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-white/10 cursor-pointer text-xs sm:text-sm text-slate-300">
              <input
                type="checkbox"
                checked={embedThumbnail}
                onChange={(e) => setEmbedThumbnail(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-white/20"
              />
              <ImageIcon className="w-4 h-4 text-red-400" />
              <span>ฝังรูปภาพหน้าปก (Cover Art Thumbnail)</span>
            </label>
          </div>

          {/* Filename Template (PRD #22) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span>รูปแบบการตั้งชื่อไฟล์ (Filename Template)</span>
            </label>

            <select
              value={filenameTemplate}
              onChange={(e) => setFilenameTemplate(e.target.value)}
              className="w-full bg-slate-900/80 px-3 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-200 outline-none focus:border-red-500 cursor-pointer"
            >
              {templates.map((tpl) => (
                <option key={tpl.value} value={tpl.value}>
                  {tpl.label} &rarr; {tpl.value}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
