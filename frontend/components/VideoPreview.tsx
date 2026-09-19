"use client";

import React from "react";
import Image from "next/image";
import { VideoMetadata, DownloadRecord } from "@/types/video";
import { 
  Play, 
  Clock, 
  User, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  FolderOpen, 
  AlertTriangle,
  ExternalLink 
} from "lucide-react";
import { api } from "@/lib/api";

interface VideoPreviewProps {
  metadata: VideoMetadata;
  alreadyDownloaded?: boolean;
  existingRecord?: DownloadRecord;
  onDownloadAgain?: () => void;
}

export default function VideoPreview({
  metadata,
  alreadyDownloaded,
  existingRecord,
}: VideoPreviewProps) {
  const handleOpenExisting = async () => {
    if (existingRecord) {
      try {
        await api.openFile(existingRecord.id);
      } catch (err: any) {
        alert(err.message || "ไม่สามารถเปิดไฟล์ได้");
      }
    }
  };

  const handleOpenFolder = async () => {
    if (existingRecord) {
      try {
        await api.openFolder(existingRecord.id);
      } catch (err: any) {
        alert(err.message || "ไม่สามารถเปิดโฟลเดอร์ได้");
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Duplicate Warning Banner (PRD #87) */}
      {alreadyDownloaded && existingRecord && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">วิดีโอนี้เคยดาวน์โหลดไปแล้ว</p>
              <p className="text-amber-200/80 text-xs">
                บันทึกไว้ที่: <span className="font-mono">{existingRecord.file_path}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleOpenExisting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>เปิดดูไฟล์เดิม</span>
            </button>
            <button
              onClick={handleOpenFolder}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-xs font-medium transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>เปิดโฟลเดอร์</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Video Information Card (PRD #11) */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col md:flex-row gap-5 items-start">
        {/* Thumbnail with overlay duration & quality badge */}
        <div className="relative w-full md:w-72 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0 shadow-lg border border-white/10 group">
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <Play className="w-12 h-12" />
            </div>
          )}

          {/* Duration Badge */}
          {metadata.duration_string && (
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1 border border-white/10">
              <Clock className="w-3 h-3 text-slate-300" />
              <span>{metadata.duration_string}</span>
            </div>
          )}

          {/* Resolution Badge */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold shadow-md">
            {metadata.max_resolution >= 2160 ? "4K 2160p" : metadata.max_resolution >= 1440 ? "2K 1440p" : metadata.max_resolution >= 1080 ? "1080p FHD" : `${metadata.max_resolution}p`}
          </div>
        </div>

        {/* Video Info Details */}
        <div className="flex-1 space-y-2.5 w-full">
          <h2 className="text-base sm:text-lg font-bold text-slate-100 line-clamp-2 leading-snug">
            {metadata.title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-400">
            {/* Channel */}
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <User className="w-4 h-4 text-red-400" />
              {metadata.channel_url ? (
                <a
                  href={metadata.channel_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  <span>{metadata.channel}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              ) : (
                <span>{metadata.channel}</span>
              )}
            </div>

            {/* Views */}
            {metadata.view_count !== undefined && metadata.view_count !== null && (
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{metadata.view_count.toLocaleString()} ครั้ง</span>
              </div>
            )}

            {/* Upload Date */}
            {metadata.upload_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {metadata.upload_date.slice(0, 4)}-{metadata.upload_date.slice(4, 6)}-{metadata.upload_date.slice(6, 8)}
                </span>
              </div>
            )}
          </div>

          {/* Short Description */}
          {metadata.description && (
            <p className="text-xs text-slate-400 line-clamp-2 pt-1 border-t border-white/5">
              {metadata.description}
            </p>
          )}

          {/* Available resolutions pill badges */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1">ความละเอียด:</span>
            {metadata.available_resolutions.map((res) => (
              <span
                key={res}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300"
              >
                {res >= 2160 ? "4K" : `${res}p`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
