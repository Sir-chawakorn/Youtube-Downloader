export interface DownloadRequest {
  url: string;
  type: "video" | "audio";
  quality: string;
  format: string;
  save_path?: string;
  filename_template?: string;
  subtitle_lang?: string;
  embed_subtitle?: boolean;
  embed_thumbnail?: boolean;
  embed_metadata?: boolean;
}

export interface ProgressEvent {
  download_id: string;
  status: string; // queued, analyzing, downloading, processing, merging, converting, completed, failed, cancelled
  progress: number; // 0.0 to 100.0
  speed?: number;
  speed_string?: string;
  eta?: number;
  eta_string?: string;
  downloaded_bytes?: number;
  total_bytes?: number;
  file_path?: string;
  filename?: string;
  error_message?: string;
}

export interface AppSettings {
  default_folder: string;
  default_video_quality: string;
  default_video_format: string;
  default_audio_quality: string;
  default_audio_format: string;
  concurrent_downloads: number;
  embed_metadata: boolean;
  embed_thumbnail: boolean;
  clipboard_detection: boolean;
  filename_template: string;
  ffmpeg_path: string;
  ytdlp_path: string;
  theme: string;
}

export interface SystemStatus {
  ytdlp_installed: boolean;
  ytdlp_version: string;
  ffmpeg_installed: boolean;
  ffmpeg_path: string;
  ffmpeg_version: string;
  download_folder: string;
  download_folder_writable: boolean;
  disk_free_bytes: number;
  disk_free_gb: number;
  os_name: string;
}

export interface CommonFolder {
  name: string;
  path: string;
}
