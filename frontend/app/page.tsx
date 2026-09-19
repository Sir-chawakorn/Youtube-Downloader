"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, Sparkles, AlertCircle, ShieldAlert, RefreshCw } from "lucide-react";
import UrlInput from "@/components/UrlInput";
import VideoPreview from "@/components/VideoPreview";
import FormatSelector from "@/components/FormatSelector";
import QualitySelector from "@/components/QualitySelector";
import AdvancedOptions from "@/components/AdvancedOptions";
import DownloadProgress from "@/components/DownloadProgress";
import DownloadComplete from "@/components/DownloadComplete";
import Toast, { ToastMessage } from "@/components/Toast";
import { api } from "@/lib/api";
import { VideoMetadata, DownloadRecord } from "@/types/video";
import { DownloadRequest, ProgressEvent, AppSettings } from "@/types/download";

export default function DownloaderPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [alreadyDownloaded, setAlreadyDownloaded] = useState(false);
  const [existingRecord, setExistingRecord] = useState<DownloadRecord | undefined>();

  // Download settings states
  const [downloadType, setDownloadType] = useState<"video" | "audio">("video");
  const [quality, setQuality] = useState("best");
  const [format, setFormat] = useState("mp4");
  const [savePath, setSavePath] = useState("");
  const [subtitleLang, setSubtitleLang] = useState("none");
  const [embedSubtitle, setEmbedSubtitle] = useState(false);
  const [embedMetadata, setEmbedMetadata] = useState(true);
  const [embedThumbnail, setEmbedThumbnail] = useState(false);
  const [filenameTemplate, setFilenameTemplate] = useState("%(title)s.%(ext)s");

  // Global settings
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Active download states
  const [currentDownloadId, setCurrentDownloadId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Load app settings on startup
  useEffect(() => {
    api.getSettings()
      .then((data) => {
        setSettings(data);
        setSavePath(data.default_folder);
        setQuality(data.default_video_quality);
        setFormat(data.default_video_format);
        setEmbedMetadata(data.embed_metadata);
        setEmbedThumbnail(data.embed_thumbnail);
        setFilenameTemplate(data.filename_template);
      })
      .catch((err) => console.warn("Failed to load settings:", err));
  }, []);

  // Sync format default when switching between video and audio
  useEffect(() => {
    if (downloadType === "audio") {
      setFormat(settings?.default_audio_format || "mp3");
      setQuality(settings?.default_audio_quality || "best");
    } else {
      setFormat(settings?.default_video_format || "mp4");
      setQuality(settings?.default_video_quality || "best");
    }
  }, [downloadType, settings]);

  // Clean up SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Handle Analyze
  const handleAnalyze = async (targetUrl?: string) => {
    const rawUrl = targetUrl || url;
    if (!rawUrl || !rawUrl.trim()) return;

    setIsAnalyzing(true);
    setProgress(null);
    try {
      const res = await api.analyzeUrl(rawUrl.trim());
      setMetadata(res.metadata);
      setAlreadyDownloaded(res.already_downloaded);
      setExistingRecord(res.existing_record);
      setToast({
        type: "success",
        text: `วิเคราะห์ข้อมูลสำเร็จ: "${res.metadata.title}"`,
      });
    } catch (err: any) {
      setToast({
        type: "error",
        text: err.message || "ไม่สามารถวิเคราะห์ URL ได้ กรุณาตรวจสอบลิงก์อีกครั้ง",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Start Realtime SSE Listener
  const listenToDownloadEvents = (downloadId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventsUrl = api.getDownloadEventsUrl(downloadId);
    const es = new EventSource(eventsUrl);
    eventSourceRef.current = es;

    es.addEventListener("progress", (e) => {
      try {
        const data: ProgressEvent = JSON.parse(e.data);
        setProgress(data);

        if (data.status === "completed") {
          setIsDownloading(false);
          es.close();
          setToast({
            type: "success",
            text: `ดาวน์โหลดเรียบร้อย: ${data.filename || "วิดีโอถูกบันทึกแล้ว"}`,
          });
        } else if (data.status === "failed") {
          setIsDownloading(false);
          es.close();
          setToast({
            type: "error",
            text: data.error_message || "การดาวน์โหลดล้มเหลว",
          });
        } else if (data.status === "cancelled") {
          setIsDownloading(false);
          setIsCancelling(false);
          es.close();
          setToast({
            type: "error",
            text: "ยกเลิกการดาวน์โหลดเรียบร้อยแล้ว",
          });
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    });

    es.addEventListener("heartbeat", (e) => {
      try {
        const data: ProgressEvent = JSON.parse(e.data);
        setProgress(data);
      } catch {}
    });

    es.onerror = () => {
      // EventSource reconnects automatically
    };
  };

  // Handle Start Download
  const handleStartDownload = async () => {
    if (!metadata || isDownloading) return;

    setIsDownloading(true);
    setIsCancelling(false);

    const req: DownloadRequest = {
      url: metadata.url,
      type: downloadType,
      quality,
      format,
      save_path: savePath || undefined,
      filename_template: filenameTemplate || undefined,
      subtitle_lang: downloadType === "video" ? subtitleLang : undefined,
      embed_subtitle: downloadType === "video" && embedSubtitle,
      embed_metadata: embedMetadata,
      embed_thumbnail: embedThumbnail,
    };

    try {
      const res = await api.startDownload(req);
      setCurrentDownloadId(res.download_id);
      listenToDownloadEvents(res.download_id);
    } catch (err: any) {
      setIsDownloading(false);
      setToast({
        type: "error",
        text: err.message || "ไม่สามารถเริ่มการดาวน์โหลดได้",
      });
    }
  };

  // Handle Cancel
  const handleCancelDownload = async () => {
    if (!currentDownloadId || isCancelling) return;
    setIsCancelling(true);
    try {
      await api.cancelDownload(currentDownloadId);
    } catch (err: any) {
      setIsCancelling(false);
      setToast({
        type: "error",
        text: err.message || "ไม่สามารถยกเลิกการดาวน์โหลดได้",
      });
    }
  };

  // Handle Retry
  const handleRetry = async () => {
    if (!currentDownloadId) return;
    setIsDownloading(true);
    setIsCancelling(false);
    try {
      const res = await api.retryDownload(currentDownloadId);
      setCurrentDownloadId(res.download_id);
      listenToDownloadEvents(res.download_id);
    } catch (err: any) {
      setIsDownloading(false);
      setToast({
        type: "error",
        text: err.message || "ไม่สามารถลองใหม่ได้",
      });
    }
  };

  // Reset page to download another
  const handleReset = () => {
    setUrl("");
    setMetadata(null);
    setProgress(null);
    setCurrentDownloadId(null);
    setIsDownloading(false);
    setIsCancelling(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header (PRD #7) */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 flex items-center justify-center gap-2">
          <span>YouTube</span>
          <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
            Downloader
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
          ดาวน์โหลดวิดีโอและไฟล์เสียงความละเอียดสูงจาก YouTube ลงในเครื่องของคุณโดยตรงอย่างปลอดภัย
        </p>
      </div>

      {/* Legal & Usage Notice Banner (PRD #5) */}
      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <span>
          โปรดใช้โปรแกรมนี้เฉพาะกับวิดีโอที่คุณเป็นเจ้าของ ได้รับอนุญาต หรือมีสิทธิ์ดาวน์โหลด การใช้งานต้องเป็นไปตามลิขสิทธิ์และข้อกำหนดของแพลตฟอร์มต้นทาง
        </span>
      </div>

      {/* URL Input Box (PRD #8) */}
      <UrlInput
        url={url}
        setUrl={setUrl}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        clipboardDetectionEnabled={settings?.clipboard_detection}
      />

      {/* Video Preview & Download Options Card */}
      {metadata && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Metadata Card (PRD #11) */}
          <VideoPreview
            metadata={metadata}
            alreadyDownloaded={alreadyDownloaded}
            existingRecord={existingRecord}
            onDownloadAgain={() => setAlreadyDownloaded(false)}
          />

          {/* Download Options (PRD #12, #13, #15, #16) */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 border border-white/10 space-y-5 shadow-xl">
            {/* Format Selector: Video vs Audio Only */}
            <FormatSelector
              downloadType={downloadType}
              setDownloadType={setDownloadType}
            />

            {/* Quality and Format Selector */}
            <QualitySelector
              downloadType={downloadType}
              quality={quality}
              setQuality={setQuality}
              format={format}
              setFormat={setFormat}
              availableResolutions={metadata.available_resolutions}
            />

            {/* Advanced Options Accordion */}
            <AdvancedOptions
              savePath={savePath}
              setSavePath={setSavePath}
              subtitleLang={subtitleLang}
              setSubtitleLang={setSubtitleLang}
              embedSubtitle={embedSubtitle}
              setEmbedSubtitle={setEmbedSubtitle}
              embedMetadata={embedMetadata}
              setEmbedMetadata={setEmbedMetadata}
              embedThumbnail={embedThumbnail}
              setEmbedThumbnail={setEmbedThumbnail}
              filenameTemplate={filenameTemplate}
              setFilenameTemplate={setFilenameTemplate}
              availableSubtitles={metadata.subtitles}
              downloadType={downloadType}
            />

            {/* Main Download Button (PRD #24) */}
            {!isDownloading && (!progress || progress.status !== "completed") && (
              <button
                type="button"
                onClick={handleStartDownload}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-xl shadow-red-600/30 transition-all hover:shadow-red-600/50 active:scale-[0.99]"
              >
                <Download className="w-5 h-5" />
                <span>
                  ดาวน์โหลด ({downloadType === "video" ? `${quality === "best" ? "Best" : quality + "p"} .${format}` : `${quality === "best" ? "Best" : quality + "k"} .${format}`})
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Realtime Download Progress (PRD #25) */}
      {isDownloading && progress && progress.status !== "completed" && (
        <DownloadProgress
          progress={progress}
          onCancel={handleCancelDownload}
          isCancelling={isCancelling}
        />
      )}

      {/* Failed state with Retry button (PRD #30) */}
      {progress && progress.status === "failed" && !isDownloading && (
        <div className="glass-card rounded-2xl p-5 border border-red-500/40 bg-red-500/10 text-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-100">การดาวน์โหลดล้มเหลว (Download Failed)</p>
              <p className="text-xs text-red-300">{progress.error_message}</p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shrink-0 shadow-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>ลองใหม่อีกครั้ง (Retry)</span>
          </button>
        </div>
      )}

      {/* Download Complete Card (PRD #28) */}
      {progress && progress.status === "completed" && currentDownloadId && (
        <DownloadComplete
          downloadId={currentDownloadId}
          filename={progress.filename || "media-file"}
          filePath={progress.file_path || savePath}
          onReset={handleReset}
        />
      )}

      {/* Global Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
