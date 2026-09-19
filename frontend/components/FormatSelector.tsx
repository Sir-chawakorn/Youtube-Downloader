"use client";

import React from "react";
import { Video, Music2 } from "lucide-react";

interface FormatSelectorProps {
  downloadType: "video" | "audio";
  setDownloadType: (type: "video" | "audio") => void;
}

export default function FormatSelector({
  downloadType,
  setDownloadType,
}: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
        รูปแบบการดาวน์โหลด (Download Type)
      </label>
      <div className="grid grid-cols-2 gap-3">
        {/* Video Option */}
        <button
          type="button"
          onClick={() => setDownloadType("video")}
          className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border font-semibold text-sm transition-all ${
            downloadType === "video"
              ? "bg-red-500/15 border-red-500 text-red-400 shadow-md shadow-red-500/10 ring-2 ring-red-500/20"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
          }`}
        >
          <Video className="w-5 h-5" />
          <span>วิดีโอ (Video)</span>
        </button>

        {/* Audio Only Option */}
        <button
          type="button"
          onClick={() => setDownloadType("audio")}
          className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border font-semibold text-sm transition-all ${
            downloadType === "audio"
              ? "bg-red-500/15 border-red-500 text-red-400 shadow-md shadow-red-500/10 ring-2 ring-red-500/20"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
          }`}
        >
          <Music2 className="w-5 h-5" />
          <span>เฉพาะเสียง (Audio Only)</span>
        </button>
      </div>
    </div>
  );
}
