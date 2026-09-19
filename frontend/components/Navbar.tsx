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
  Radio,
  Server
} from "lucide-react";
import { api, isLocalBackend } from "@/lib/api";
import { SystemStatus } from "@/types/download";

export default function Navbar() {
  const pathname = usePathname();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Check system status
    api.getSystemStatus()
      .then((data) => {
        setStatus(data);
        setIsConnected(true);
      })
      .catch(() => {
        setStatus(null);
        setIsConnected(false);
      });

    // Theme check
    const saved = localStorage.getItem("app_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      if (saved === "light") {
        document.documentElement.classList.add("light");
      }
    }
  }, [pathname]);

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
              <span>YouTube</span>
              <span className="text-red-500">Downloader</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Web</span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">ดาวน์โหลดวิดีโอ & เสียงลงเครื่องได้ทันที</p>
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

        {/* Right Info: Backend Status & Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status Indicator */}
          {isConnected === true ? (
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-medium hidden sm:inline">Backend พร้อมใช้งาน</span>
              {status?.ffmpeg_installed && (
                <span className="text-slate-400 hidden lg:inline text-[11px]">• FFmpeg OK</span>
              )}
            </div>
          ) : isConnected === false ? (
            <Link
              href="/settings"
              className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 sm:px-3 py-1.5 rounded-lg border border-rose-500/30 transition-colors"
              title="ไม่พบ Backend คลิกเพื่อตั้งค่า URL"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="font-semibold">ออฟไลน์ (ตั้งค่า URL)</span>
            </Link>
          ) : null}

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
