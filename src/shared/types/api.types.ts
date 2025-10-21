export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface JamTrackRequest {
  url: string;
  fetchAudio?: boolean;
}

export interface JamTrackResponse {
  success: boolean;
  originalUrl: string;
  cleanUrl: string;
  data: any;
  contentType: string;
  fetchAudio: boolean;
  timestamp: string;
}

export interface AudioSegment {
  type: "init" | "media";
  url: string;
  number: number;
}

export interface PlaylistInfo {
  baseUrl: string;
  totalDuration: number;
  segmentDuration: number;
  totalSegments: number;
  segments: AudioSegment[];
}

export interface AudioBuffer {
  data: Buffer;
  number: number;
  type: string;
}
