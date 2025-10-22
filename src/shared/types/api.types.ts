/**
 * Shared API Types
 *
 * This module contains common TypeScript interfaces and types used across
 * the Fortnite Item Shop Scraper API. It includes response formats, audio
 * processing types, and shared data structures.
 *
 * @fileoverview Shared type definitions for Fortnite Item Shop Scraper API
 */

/**
 * Generic API Response Interface
 *
 * Standard response format for all API endpoints.
 * Provides consistent structure for success and error responses.
 *
 * @template T - The type of data being returned
 */
export interface ApiResponse<T = any> {
  /** Whether the request was successful */
  success: boolean;
  /** The response data (only present on success) */
  data?: T;
  /** Error message (only present on failure) */
  error?: string;
  /** ISO timestamp of the response */
  timestamp: string;
}

/**
 * Jam Track Request Interface (Legacy)
 *
 * Legacy interface for jam track requests.
 * @deprecated Use the interface from jam-tracks.types.ts instead
 */
export interface JamTrackRequest {
  /** The qsep:// URL to process */
  url: string;
  /** Whether to fetch audio data */
  fetchAudio?: boolean;
}

/**
 * Jam Track Response Interface (Legacy)
 *
 * Legacy interface for jam track responses.
 * @deprecated Use the interface from jam-tracks.types.ts instead
 */
export interface JamTrackResponse {
  /** Whether the request was successful */
  success: boolean;
  /** The original qsep:// URL */
  originalUrl: string;
  /** The converted https:// URL */
  cleanUrl: string;
  /** The processed data */
  data: any;
  /** Content type of the response */
  contentType: string;
  /** Whether audio was fetched */
  fetchAudio: boolean;
  /** ISO timestamp of the response */
  timestamp: string;
}

/**
 * Audio Segment Interface
 *
 * Represents a single audio segment in a playlist.
 * Used for processing audio streams and downloads.
 */
export interface AudioSegment {
  /** Type of segment (initialization or media) */
  type: "init" | "media";
  /** URL of the audio segment */
  url: string;
  /** Segment number in the playlist */
  number: number;
}

/**
 * Playlist Information Interface
 *
 * Contains metadata about an audio playlist including
 * duration, segment information, and URLs.
 */
export interface PlaylistInfo {
  /** Base URL for all segments */
  baseUrl: string;
  /** Total duration of the audio in seconds */
  totalDuration: number;
  /** Duration of each segment in seconds */
  segmentDuration: number;
  /** Total number of segments */
  totalSegments: number;
  /** Array of audio segments */
  segments: AudioSegment[];
}

/**
 * Audio Buffer Interface
 *
 * Represents a processed audio buffer with metadata.
 * Used for combining multiple audio segments.
 */
export interface AudioBuffer {
  /** The audio data as a Buffer */
  data: Buffer;
  /** Segment number */
  number: number;
  /** Type of audio content */
  type: string;
}
