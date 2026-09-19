"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Download, 
  Sparkles, 
  AlertCircle, 
  ShieldAlert, 
  RefreshCw,
  Layers,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  ExternalLink,
  Film,
  Music,
  Sliders
} from "lucide-react";
import UrlInput, { extractYoutubeUrls } from "@/components/UrlInput";
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

interface BatchQueueItem {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string;
  status: "pending" | "analyzing" | "downloading" | "completed" | "failed";
  progress: number;
  speed?: string;
  eta?: string;
  downloadId?: string;
  filename?: string;
  errorMessage?: string;
}

export default function DownloaderPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [alreadyDownloaded, setAlreadyDownloaded] = useState(false);
  const [existingRecord, setExistingRecord] = useState<DownloadRecord | undefined>();

  // Multi-URL (Batch) states
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [multiUrlsText, setMultiUrlsText] = useState("");
  const [batchQueue, setBatchQueue] = useState<BatchQueueItem[]>([]);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const cancelBatchRef = useRef(false);

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

  // Active single download states
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

  // Handle Single Analyze
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

  // Start Realtime SSE Listener for Single Download
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
          // Trigger browser download directly to client machine
          api.triggerBrowserDownload(downloadId, data.filename);
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

  // Handle Single Start Download
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

  // Reset page
  const handleReset = () => {
    setUrl("");
    setMetadata(null);
    setProgress(null);
    setCurrentDownloadId(null);
    setIsDownloading(false);
    setIsCancelling(false);
  };

  // Handle Start Batch Download
  const handleStartBatch = async (urls: string[]) => {
    if (!urls || urls.length === 0 || isBatchDownloading) return;

    cancelBatchRef.current = false;
    setIsBatchDownloading(true);

    const initialQueue: BatchQueueItem[] = urls.map((u, index) => ({
      id: `batch-${Date.now()}-${index}`,
      url: u,
      status: "pending",
      progress: 0,
    }));
    setBatchQueue(initialQueue);

    setToast({
      type: "success",
      text: `เริ่มประมวลผลคิว ${urls.length} รายการตามลำดับ...`,
    });

    for (let i = 0; i < initialQueue.length; i++) {
      if (cancelBatchRef.current) {
        setToast({
          type: "error",
          text: "ยกเลิกคิวดาวน์โหลดที่เหลือเรียบร้อยแล้ว",
        });
        break;
      }

      const item = initialQueue[i];

      // Update status to analyzing
      setBatchQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: "analyzing" } : q))
      );

      let itemTitle = item.url;
      let itemThumbnail: string | undefined;

      try {
        const analyzeRes = await api.analyzeUrl(item.url);
        itemTitle = analyzeRes.metadata.title;
        itemThumbnail = analyzeRes.metadata.thumbnail;
        setBatchQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, title: itemTitle, thumbnail: itemThumbnail } : q
          )
        );
      } catch (err: any) {
        console.warn("Analyze warning in batch item:", err);
      }

      if (cancelBatchRef.current) break;

      // Update status to downloading
      setBatchQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: "downloading" } : q))
      );

      try {
        const req: DownloadRequest = {
          url: item.url,
          type: downloadType,
          quality,
          format,
          save_path: savePath || undefined,
          filename_template: filenameTemplate || undefined,
          embed_metadata: embedMetadata,
          embed_thumbnail: embedThumbnail,
        };

        const downloadRes = await api.startDownload(req);
        const downloadId = downloadRes.download_id;

        setBatchQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, downloadId } : q))
        );

        // Await completion via SSE Promise
        await new Promise<void>((resolve) => {
          const eventsUrl = api.getDownloadEventsUrl(downloadId);
          const es = new EventSource(eventsUrl);

          es.addEventListener("progress", (e) => {
            try {
              const data: ProgressEvent = JSON.parse(e.data);
              setBatchQueue((prev) =>
                prev.map((q, idx) =>
                  idx === i
                    ? {
                        ...q,
                        progress: data.progress,
                        speed: data.speed_string,
                        eta: data.eta_string,
                        filename: data.filename || q.filename,
                      }
                    : q
                )
              );

              if (data.status === "completed") {
                setBatchQueue((prev) =>
                  prev.map((q, idx) =>
                    idx === i
                      ? {
                          ...q,
                          status: "completed",
                          progress: 100,
                          filename: data.filename || q.filename,
                        }
                      : q
                  )
                );
                // Trigger client browser download directly into downloads folder!
                api.triggerBrowserDownload(downloadId, data.filename);
                es.close();
                resolve();
              } else if (data.status === "failed") {
                setBatchQueue((prev) =>
                  prev.map((q, idx) =>
                    idx === i
                      ? {
                          ...q,
                          status: "failed",
                          errorMessage: data.error_message || "การดาวน์โหลดล้มเหลว",
                        }
                      : q
                  )
                );
                es.close();
                resolve();
              }
            } catch (parseErr) {
              console.error(parseErr);
            }
          });

          es.onerror = () => {
            setTimeout(async () => {
              try {
                const rec = await api.getDownloadRecord(downloadId);
                if (rec && rec.status === "completed") {
                  setBatchQueue((prev) =>
                    prev.map((q, idx) =>
                      idx === i ? { ...q, status: "completed", progress: 100 } : q
                    )
                  );
                  api.triggerBrowserDownload(downloadId, rec.file_path.split("/").pop());
                } else if (rec && rec.status === "failed") {
                  setBatchQueue((prev) =>
                    prev.map((q, idx) =>
                      idx === i
                        ? { ...q, status: "failed", errorMessage: rec.error_message }
                        : q
                    )
                  );
                }
              } catch {}
              es.close();
              resolve();
            }, 1200);
          };
        });
      } catch (dlErr: any) {
        setBatchQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  status: "failed",
                  errorMessage: dlErr.message || "เกิดข้อผิดพลาดในการดาวน์โหลด",
                }
              : q
          )
        );
      }
    }

    setIsBatchDownloading(false);
    setToast({
      type: "success",
      text: "ดำเนินการคิวดาวน์โหลดทั้งหมดเสร็จสิ้นแล้ว!",
    });
  };

  const handleCancelBatch = () => {
    cancelBatchRef.current = true;
    setIsBatchDownloading(false);
  };

  const completedBatchCount = batchQueue.filter((i) => i.status === "completed").length;

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

      {/* URL Input Component (Single & Multi-URL) */}
      <UrlInput
        url={url}
        setUrl={setUrl}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        clipboardDetectionEnabled={settings?.clipboard_detection}
        isMultiMode={isMultiMode}
        setIsMultiMode={setIsMultiMode}
        multiUrlsText={multiUrlsText}
        setMultiUrlsText={setMultiUrlsText}
        onStartBatch={handleStartBatch}
        isBatchDownloading={isBatchDownloading}
      />

      {/* Multi-URL Mode: Batch Options & Queue Section */}
      {isMultiMode && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Batch Download Settings Card */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <Sliders className="w-4 h-4 text-red-400" />
              <span>ตั้งค่ารูปแบบดาวน์โหลดสำหรับทุกรายการ (Batch Options)</span>
            </div>

            {/* Video vs Audio Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDownloadType("video")}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  downloadType === "video"
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30 border border-red-500"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                <Film className="w-4 h-4" />
                <span>วิดีโอ (MP4)</span>
              </button>

              <button
                type="button"
                onClick={() => setDownloadType("audio")}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  downloadType === "audio"
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30 border border-red-500"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                <Music className="w-4 h-4" />
                <span>เสียงเท่านั้น (MP3)</span>
              </button>
            </div>

            {/* Quality Selector */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 mr-2 font-medium">คุณภาพ:</span>
              {(downloadType === "video"
                ? ["best", "1080", "720", "480"]
                : ["best", "320", "192", "128"]
              ).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    quality === q
                      ? "bg-white/20 text-white border border-red-500/50 shadow-sm"
                      : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  }`}
                >
                  {q === "best"
                    ? "สูงสุด (Best)"
                    : downloadType === "video"
                    ? `${q}p`
                    : `${q} kbps`}
                </button>
              ))}
            </div>
          </div>

          {/* Batch Queue List */}
          {batchQueue.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-slate-100 text-sm sm:text-base">
                    คิวดาวน์โหลด ({completedBatchCount}/{batchQueue.length} เสร็จสิ้น)
                  </span>
                </div>
                {isBatchDownloading && (
                  <button
                    type="button"
                    onClick={handleCancelBatch}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/40 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>หยุดคิวที่เหลือ</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {batchQueue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                        {idx + 1}
                      </span>
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title || "Video"}
                          className="w-16 h-10 object-cover rounded-lg shrink-0 border border-white/10"
                        />
                      ) : (
                        <div className="w-16 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 text-slate-500">
                          <Film className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {item.title || item.url}
                        </p>
                        <p className="text-xs text-slate-400 truncate opacity-70">
                          {item.url}
                        </p>
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      {item.status === "pending" && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                          <Clock className="w-3 h-3" />
                          <span>รอคิว</span>
                        </span>
                      )}
                      {item.status === "analyzing" && (
                        <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>กำลังวิเคราะห์...</span>
                        </span>
                      )}
                      {item.status === "downloading" && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/30">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>กำลังโหลด {Math.round(item.progress)}%</span>
                          </span>
                          {item.speed && (
                            <span className="text-[10px] text-slate-400">
                              {item.speed} {item.eta ? `• ${item.eta}` : ""}
                            </span>
                          )}
                        </div>
                      )}
                      {item.status === "completed" && (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>สำเร็จ</span>
                          </span>
                          {item.downloadId && (
                            <button
                              type="button"
                              onClick={() =>
                                api.triggerBrowserDownload(item.downloadId!, item.filename)
                              }
                              className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg transition-colors"
                              title="ดาวน์โหลดไฟล์อีกครั้ง"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                      {item.status === "failed" && (
                        <span
                          className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30"
                          title={item.errorMessage}
                        >
                          <XCircle className="w-3 h-3" />
                          <span>ล้มเหลว</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Single Mode: Video Preview & Download Options Card */}
      {!isMultiMode && metadata && (
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

      {/* Single Mode: Realtime Download Progress (PRD #25) */}
      {!isMultiMode && isDownloading && progress && progress.status !== "completed" && (
        <DownloadProgress
          progress={progress}
          onCancel={handleCancelDownload}
          isCancelling={isCancelling}
        />
      )}

      {/* Single Mode: Failed state with Retry button (PRD #30) */}
      {!isMultiMode && progress && progress.status === "failed" && !isDownloading && (
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

      {/* Single Mode: Download Complete Card (PRD #28) */}
      {!isMultiMode && progress && progress.status === "completed" && currentDownloadId && (
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
