"use client";

import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface ToastMessage {
  type: "error" | "success";
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
          toast.type === "error"
            ? "bg-red-950/90 border-red-500/40 text-red-200"
            : "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
        }`}
      >
        {toast.type === "error" ? (
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
          {toast.text}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
