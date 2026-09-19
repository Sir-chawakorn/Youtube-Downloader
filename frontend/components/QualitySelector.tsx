"use client";

import React from "react";
import { Sparkles, SlidersHorizontal } from "lucide-react";

interface QualitySelectorProps {
  downloadType: "video" | "audio";
  quality: string;
  setQuality: (quality: string) => void;
  format: string;
  setFormat: (format: string) => void;
  availableResolutions: number[];
}

export default function QualitySelector({
  downloadType,
  quality,
  setQuality,
  format,
  setFormat,
  availableResolutions,
}: QualitySelectorProps) {
  // Video qualities: Best + only resolutions present in availableResolutions
  const videoQualityOptions = [
    { value: "best", label: "อัตโนมัติ / ดีที่สุด (Best Quality)", badge: "แนะนำ" },
    ...[2160, 1440, 1080, 720, 480, 360]
      .filter((res) => availableResolutions.includes(res))
      .map((res) => ({
        value: res.toString(),
        label: `${res}p ${res >= 2160 ? "(4K Ultra HD)" : res >= 1440 ? "(2K Quad HD)" : res >= 1080 ? "(Full HD)" : res >= 720 ? "(HD)" : "(SD)"}`,
        badge: res >= 1080 ? "ชัดสูง" : undefined,
      })),
  ];

  // Audio qualities (PRD #16)
  const audioQualityOptions = [
    { value: "best", label: "อัตโนมัติ / ต้นฉบับ (Best Quality)", badge: "แนะนำ" },
    { value: "320", label: "320 kbps (สูงสุด Ultra High)", badge: "ยอดนิยม" },
    { value: "256", label: "256 kbps (สูง High Quality)" },
    { value: "192", label: "192 kbps (มาตรฐาน Standard)" },
    { value: "128", label: "128 kbps (ประหยัดพื้นที่ Compact)" },
  ];

  const videoFormats = ["mp4", "webm", "mkv"];
  const audioFormats = ["mp3", "m4a", "opus", "wav"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Quality Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
          <span>คุณภาพ (Quality)</span>
        </label>

        <div className="relative">
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full appearance-none bg-slate-900/80 hover:bg-slate-900 text-slate-100 font-medium text-sm px-4 py-3 rounded-xl border border-white/10 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all cursor-pointer shadow-sm"
          >
            {downloadType === "video"
              ? videoQualityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                    {opt.label} {opt.badge ? `★ ${opt.badge}` : ""}
                  </option>
                ))
              : audioQualityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                    {opt.label} {opt.badge ? `★ ${opt.badge}` : ""}
                  </option>
                ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          นามสกุลไฟล์ (Format)
        </label>

        <div className="flex items-center gap-2">
          {(downloadType === "video" ? videoFormats : audioFormats).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setFormat(fmt)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                format.toLowerCase() === fmt.toLowerCase()
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-500/30"
                  : "bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-white/10 hover:border-white/20"
              }`}
            >
              .{fmt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
