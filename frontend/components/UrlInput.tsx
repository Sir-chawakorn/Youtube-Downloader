"use client";

import React, { useState, useEffect } from "react";
import { Search, Clipboard, X, Sparkles, Loader2, Link as LinkIcon } from "lucide-react";

interface UrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: (targetUrl?: string) => void;
  isAnalyzing: boolean;
  clipboardDetectionEnabled?: boolean;
}

export default function UrlInput({
  url,
  setUrl,
  onAnalyze,
  isAnalyzing,
  clipboardDetectionEnabled = false,
}: UrlInputProps) {
  const [detectedClipboardUrl, setDetectedClipboardUrl] = useState<string | null>(null);

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
            trimmed !== url
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
  }, [clipboardDetectionEnabled, url]);

  const handlePaste = async () => {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && url.trim() && !isAnalyzing) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="w-full space-y-3">
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
                setUrl(detectedClipboardUrl);
                onAnalyze(detectedClipboardUrl);
                setDetectedClipboardUrl(null);
              }}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-xs transition-colors shadow-sm"
            >
              วิเคราะห์
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

      {/* Main Input Box (PRD #8) */}
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
            onClick={handlePaste}
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
    </div>
  );
}
