"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Clipboard, 
  X, 
  Sparkles, 
  Loader2, 
  Link as LinkIcon, 
  Layers, 
  Play, 
  Trash2,
  CheckCircle2,
  ListPlus
} from "lucide-react";

export function extractYoutubeUrls(text: string): string[] {
  if (!text) return [];
  const lines = text.split(/[\r\n]+/);
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Split by whitespace in case multiple URLs are separated by space
    const tokens = trimmed.split(/\s+/);
    for (const token of tokens) {
      if (
        (token.includes("youtube.com/watch") ||
          token.includes("youtu.be/") ||
          token.includes("youtube.com/shorts/") ||
          token.includes("youtube.com/live/") ||
          token.includes("music.youtube.com/")) &&
        !seen.has(token)
      ) {
        urls.push(token);
        seen.add(token);
      }
    }
  }
  return urls;
}

interface UrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: (targetUrl?: string) => void;
  isAnalyzing: boolean;
  clipboardDetectionEnabled?: boolean;
  isMultiMode?: boolean;
  setIsMultiMode?: (enabled: boolean) => void;
  multiUrlsText?: string;
  setMultiUrlsText?: (text: string) => void;
  onStartBatch?: (urls: string[]) => void;
  isBatchDownloading?: boolean;
}

export default function UrlInput({
  url,
  setUrl,
  onAnalyze,
  isAnalyzing,
  clipboardDetectionEnabled = false,
  isMultiMode = false,
  setIsMultiMode,
  multiUrlsText = "",
  setMultiUrlsText,
  onStartBatch,
  isBatchDownloading = false,
}: UrlInputProps) {
  const [detectedClipboardUrl, setDetectedClipboardUrl] = useState<string | null>(null);
  const [localMultiMode, setLocalMultiMode] = useState(isMultiMode);
  const [localMultiText, setLocalMultiText] = useState(multiUrlsText);

  const activeMultiMode = setIsMultiMode ? isMultiMode : localMultiMode;
  const toggleMultiMode = (val: boolean) => {
    if (setIsMultiMode) {
      setIsMultiMode(val);
    } else {
      setLocalMultiMode(val);
    }
  };

  const activeMultiText = setMultiUrlsText ? multiUrlsText : localMultiText;
  const updateMultiText = (text: string) => {
    if (setMultiUrlsText) {
      setMultiUrlsText(text);
    } else {
      setLocalMultiText(text);
    }
  };

  const validUrls = extractYoutubeUrls(activeMultiText);

  // Check clipboard if enabled in settings (PRD #9)
  useEffect(() => {
    if (!clipboardDetectionEnabled) return;

    const checkClipboard = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          const trimmed = text.trim();
          if (
            (trimmed.includes("youtube.com/watch") ||
              trimmed.includes("youtu.be/") ||
              trimmed.includes("youtube.com/shorts/")) &&
            trimmed !== url &&
            !activeMultiText.includes(trimmed)
          ) {
            setDetectedClipboardUrl(trimmed);
          }
        }
      } catch {
        // Clipboard read permission might not be granted
      }
    };

    window.addEventListener("focus", checkClipboard);
    return () => window.removeEventListener("focus", checkClipboard);
  }, [clipboardDetectionEnabled, url, activeMultiText]);

  const handlePasteSingle = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const cleaned = text.trim();
        setUrl(cleaned);
        if (cleaned) {
          onAnalyze(cleaned);
        }
      }
    } catch (e) {
      console.warn("Clipboard paste access denied", e);
    }
  };

  const handlePasteMulti = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const cleaned = text.trim();
        if (cleaned) {
          const next = activeMultiText ? `${activeMultiText}\n${cleaned}` : cleaned;
          updateMultiText(next);
        }
      }
    } catch (e) {
      console.warn("Clipboard paste access denied", e);
    }
  };

  const handleInsertExamples = () => {
    const examples = [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
      "https://www.youtube.com/shorts/3i_b7vXn6Vw"
    ].join("\n");
    updateMultiText(examples);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && url.trim() && !isAnalyzing) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Mode Switcher & URL Counter Bar */}
      <div className="flex items-center justify-between gap-3 px-1">
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={activeMultiMode}
            onChange={(e) => toggleMultiMode(e.target.checked)}
            className="w-4 h-4 rounded text-red-600 bg-white/10 border-white/20 focus:ring-red-500 focus:ring-offset-0 transition cursor-pointer accent-red-600"
          />
          <span className="text-xs sm:text-sm font-semibold text-slate-300 group-hover:text-white transition-colors flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-red-400" />
            ดาวน์โหลดหลายลิงก์ (New Line / หลาย URL)
          </span>
        </label>

        {activeMultiMode ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                validUrls.length > 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span>{validUrls.length > 0 ? `พบ ${validUrls.length} ลิงก์` : "ยังไม่มีลิงก์"}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 hidden sm:inline">
            ติ๊กถูกเพื่อวางหลาย URL พร้อมกัน
          </span>
        )}
      </div>

      {/* Auto Detect Clipboard Banner (PRD #9) */}
      {detectedClipboardUrl && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/15 via-rose-500/10 to-transparent border border-red-500/30 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 overflow-hidden text-slate-200">
            <Sparkles className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-semibold text-red-400 shrink-0">ตรวจพบคลิปบอร์ด:</span>
            <span className="truncate opacity-80">{detectedClipboardUrl}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                if (activeMultiMode) {
                  const next = activeMultiText
                    ? `${activeMultiText}\n${detectedClipboardUrl}`
                    : detectedClipboardUrl;
                  updateMultiText(next);
                } else {
                  setUrl(detectedClipboardUrl);
                  onAnalyze(detectedClipboardUrl);
                }
                setDetectedClipboardUrl(null);
              }}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-xs transition-colors shadow-sm"
            >
              {activeMultiMode ? "เพิ่มลงรายการ" : "วิเคราะห์"}
            </button>
            <button
              onClick={() => setDetectedClipboardUrl(null)}
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Multi-URL Mode: Textarea Box */}
      {activeMultiMode ? (
        <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-white/15 focus-within:border-red-500/60 focus-within:ring-4 focus-within:ring-red-500/10 transition-all shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <ListPlus className="w-3.5 h-3.5 text-red-400" />
              วางลิงก์ YouTube แยก 1 บรรทัดต่อ 1 ลิงก์ (กด Enter ขึ้นบรรทัดใหม่)
            </span>
            {activeMultiText && (
              <button
                type="button"
                onClick={() => updateMultiText("")}
                className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                title="ล้างทั้งหมด"
              >
                <Trash2 className="w-3 h-3" />
                <span>ล้างข้อความ</span>
              </button>
            )}
          </div>

          <textarea
            rows={5}
            value={activeMultiText}
            onChange={(e) => updateMultiText(e.target.value)}
            placeholder={`https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://youtu.be/kJQP7kiw5Fk\nhttps://www.youtube.com/shorts/...`}
            className="w-full bg-black/25 rounded-xl p-3 text-xs sm:text-sm text-slate-100 font-mono placeholder:text-slate-500 outline-none border border-white/10 focus:border-red-500/50 resize-y min-h-[110px]"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteMulti}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-white/10 transition-colors"
              >
                <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                <span>วางจากคลิปบอร์ด</span>
              </button>

              <button
                type="button"
                onClick={handleInsertExamples}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-white/10 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ใส่ตัวอย่าง</span>
              </button>
            </div>

            {onStartBatch && (
              <button
                type="button"
                disabled={validUrls.length === 0 || isBatchDownloading}
                onClick={() => onStartBatch(validUrls)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                {isBatchDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังโหลดคิว...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>เริ่มดาวน์โหลดทั้งหมด ({validUrls.length} รายการ)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Single URL Mode: Standard Input Box */
        <div className="relative flex items-center glass-card rounded-2xl p-1.5 border border-white/15 focus-within:border-red-500/60 focus-within:ring-4 focus-within:ring-red-500/10 transition-all shadow-xl">
          <div className="pl-3.5 pr-2 text-slate-400 flex items-center">
            <LinkIcon className="w-5 h-5 text-red-500/80" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="วางลิงก์ YouTube ที่นี่... (watch, shorts, youtu.be)"
            className="w-full bg-transparent px-2 py-3 text-sm sm:text-base outline-none placeholder:text-slate-500 text-slate-100 font-medium"
          />

          {url && (
            <button
              onClick={() => setUrl("")}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="ล้างข้อความ"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 shrink-0 pr-1">
            <button
              onClick={handlePasteSingle}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-medium border border-white/10 transition-colors"
            >
              <Clipboard className="w-3.5 h-3.5 text-slate-400" />
              <span>วาง</span>
            </button>

            <button
              onClick={() => onAnalyze(url.trim())}
              disabled={!url.trim() || isAnalyzing}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังวิเคราะห์...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>วิเคราะห์</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
