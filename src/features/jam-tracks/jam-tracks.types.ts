/**
 * Jam Tracks Types
 *
 * This module defines TypeScript interfaces and types for the Fortnite jam tracks
 * feature. It includes data structures for jam tracks data, requests, and responses.
 *
 * @fileoverview Type definitions for Fortnite Jam Tracks Scraper API
 */

/**
 * Jam Tracks Data Interface
 *
 * Represents the complete jam tracks data structure returned by Fortnite's API.
 * Contains information about available jam tracks and their metadata.
 *
 * @interface JamTracksData
 */
export interface JamTracksData {
  /** Dynamic structure based on Fortnite API response */
  [key: string]: any;
}

/**
 * Jam Track Request Interface
 *
 * Represents a request to process a jam track URL.
 * Used for POST requests to process qsep:// URLs.
 *
 * @interface JamTrackRequest
 */
export interface JamTrackRequest {
  /** The qsep:// URL to process */
  url: string;
}

/**
 * Jam Track Response Interface
 *
 * Represents the response from processing a jam track request.
 * Contains success status, data, and timestamp information.
 *
 * @interface JamTrackResponse
 */
export interface JamTrackResponse {
  /** Whether the request was successful */
  success: boolean;
  /** The processed jam track data */
  data: any;
  /** ISO timestamp of the response */
  timestamp: string;
}
