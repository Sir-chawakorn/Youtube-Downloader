"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Download, 
  History, 
  Settings, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  Moon, 
  Sun,
  Play
} from "lucide-react";
import { api } from "@/lib/api";
import { SystemStatus } from "@/types/download";

export default function Navbar() {
  const pathname = usePathname();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Check system status
    api.getSystemStatus()
      .then(setStatus)
      .catch(() => setStatus(null));

    // Theme check
    const saved = localStorage.getItem("app_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      if (saved === "light") {
        document.documentElement.classList.add("light");
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("app_theme", next);
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/10 px-4 lg:px-8 py-3.5 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-500/25 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight">
              <span>Local</span>
              <span className="text-red-500">YouTube</span>
              <span>Downloader</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Download directly to your computer</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === "/"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด</span>
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === "/history"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติ</span>
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === "/settings"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>ตั้งค่า</span>
          </Link>
        </nav>

        {/* Right Info: FFmpeg & Disk Space & Theme */}
        <div className="hidden md:flex items-center gap-3">
          {status && (
            <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <div className="flex items-center gap-1.5">
                {status.ffmpeg_installed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">FFmpeg พร้อม</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400 font-medium">ไม่มี FFmpeg</span>
                  </>
                )}
              </div>
              <div className="w-px h-3 bg-white/20" />
              <div className="flex items-center gap-1.5 text-slate-400">
                <HardDrive className="w-3.5 h-3.5" />
                <span>พื้นที่ว่าง {status.disk_free_gb} GB</span>
              </div>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title={theme === "dark" ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
