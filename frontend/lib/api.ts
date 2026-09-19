import { VideoMetadata, AnalyzeResponse, DownloadRecord } from "@/types/video";
import { DownloadRequest, AppSettings, SystemStatus, CommonFolder } from "@/types/download";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
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
    return `${API_BASE}/download/${downloadId}/events`;
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
