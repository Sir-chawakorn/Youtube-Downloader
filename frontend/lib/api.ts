import { VideoMetadata, AnalyzeResponse, DownloadRecord } from "@/types/video";
import { DownloadRequest, AppSettings, SystemStatus, CommonFolder } from "@/types/download";

export const DEFAULT_TUNNEL_API = "https://alias-admit-applicable-paper.trycloudflare.com/api";

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("yt_downloader_custom_api");
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, "");
    }

    // If running in browser on HTTPS (such as on Vercel), never call unencrypted http://127.0.0.1
    if (window.location.protocol === "https:") {
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envUrl && envUrl.startsWith("https://")) {
        return envUrl.replace(/\/+$/, "");
      }
      return DEFAULT_TUNNEL_API;
    }
  }
  return (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
}

export function setCustomApiUrl(url: string) {
  if (typeof window !== "undefined") {
    let clean = url.trim().replace(/\/+$/, "");
    if (!clean.endsWith("/api")) {
      clean = `${clean}/api`;
    }
    localStorage.setItem("yt_downloader_custom_api", clean);
  }
}

export function getCustomApiUrl(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("yt_downloader_custom_api");
  }
  return null;
}

export function resetCustomApiUrl() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("yt_downloader_custom_api");
  }
}

export function isLocalBackend(): boolean {
  const base = getApiBase();
  return base.includes("127.0.0.1") || base.includes("localhost");
}

export function getDownloadFileUrl(downloadId: string): string {
  return `${getApiBase()}/download/${downloadId}/file`;
}

export function triggerBrowserDownload(downloadId: string, filename?: string) {
  if (typeof window === "undefined") return;
  const fileUrl = getDownloadFileUrl(downloadId);
  const a = document.createElement("a");
  a.href = fileUrl;
  if (filename) {
    a.download = filename;
  }
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${getApiBase()}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorDetail = "เกิดข้อผิดพลาดในการเชื่อมต่อ";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `HTTP Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  getApiBase,
  setCustomApiUrl,
  getCustomApiUrl,
  resetCustomApiUrl,
  isLocalBackend,
  getDownloadFileUrl,
  triggerBrowserDownload,

  async checkHealth(): Promise<boolean> {
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/health`, { method: "GET", signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  async analyzeUrl(url: string): Promise<AnalyzeResponse> {
    return fetchJson<AnalyzeResponse>("/analyze", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  },

  async startDownload(request: DownloadRequest): Promise<{ download_id: string; status: string }> {
    return fetchJson<{ download_id: string; status: string }>("/download", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async cancelDownload(downloadId: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/download/${downloadId}/cancel`, {
      method: "POST",
    });
  },

  async retryDownload(downloadId: string): Promise<{ download_id: string; status: string }> {
    return fetchJson<{ download_id: string; status: string }>(`/download/${downloadId}/retry`, {
      method: "POST",
    });
  },

  getDownloadEventsUrl(downloadId: string): string {
    return `${getApiBase()}/download/${downloadId}/events`;
  },

  async getHistory(): Promise<DownloadRecord[]> {
    return fetchJson<DownloadRecord[]>("/history");
  },

  async deleteHistoryItem(downloadId: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/history/${downloadId}`, {
      method: "DELETE",
    });
  },

  async clearHistory(): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>("/history", {
      method: "DELETE",
    });
  },

  async openFile(downloadId: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/history/${downloadId}/open-file`, {
      method: "POST",
    });
  },

  async openFolder(downloadId: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/history/${downloadId}/open-folder`, {
      method: "POST",
    });
  },

  async getSettings(): Promise<AppSettings> {
    return fetchJson<AppSettings>("/settings");
  },

  async updateSettings(settings: AppSettings): Promise<AppSettings> {
    return fetchJson<AppSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  async getSystemStatus(): Promise<SystemStatus> {
    return fetchJson<SystemStatus>("/system/status");
  },

  async getCommonFolders(): Promise<{ folders: CommonFolder[] }> {
    return fetchJson<{ folders: CommonFolder[] }>("/system/common-folders");
  },

  async pickFolder(): Promise<{ success: boolean; path: string }> {
    return fetchJson<{ success: boolean; path: string }>("/system/pick-folder", {
      method: "POST",
    });
  },
};
