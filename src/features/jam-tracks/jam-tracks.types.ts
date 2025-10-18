export interface JamTracksData {
  // Define the structure based on Fortnite API response
  [key: string]: any;
}

export interface JamTrackRequest {
  url: string;
}

export interface JamTrackResponse {
  success: boolean;
  data: any;
  timestamp: string;
}
