export interface SubtitleTrack {
  lang: string;
  name: string;
  ext: string;
}

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  channel: string;
  channel_url?: string;
  duration: number;
  duration_string: string;
  thumbnail: string;
  description?: string;
  upload_date?: string;
  view_count?: number;
  max_resolution: number;
  available_resolutions: number[];
  available_video_formats: string[];
  available_audio_formats: string[];
  subtitles: SubtitleTrack[];
  is_live: boolean;
}

export interface AnalyzeResponse {
  metadata: VideoMetadata;
  already_downloaded: boolean;
  existing_record?: DownloadRecord;
}

export interface DownloadRecord {
  id: string;
  video_id: string;
  url: string;
  title: string;
  channel: string;
  thumbnail: string;
  format: string;
  quality: string;
  file_path: string;
  file_size?: number;
  status: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}
