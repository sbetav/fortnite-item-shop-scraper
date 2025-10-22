/**
 * Jam Tracks Service
 *
 * This service handles all operations related to scraping Fortnite jam tracks data
 * and processing jam track URLs. It provides methods for fetching jam tracks data,
 * processing qsep:// URLs, and handling audio streaming and downloading.
 *
 * @fileoverview Service for Fortnite Jam Tracks data scraping and processing
 */

import { BrowserService } from "../../shared/browser/browser.service";
import { AudioProcessorService } from "./audio-processor.service";
import { APP_CONFIG, API_ENDPOINTS } from "../../config/app.config";
import {
  JamTracksData,
  JamTrackRequest,
  JamTrackResponse,
} from "./jam-tracks.types";
import { PlaylistInfo } from "../../shared/types/api.types";

/**
 * Jam Tracks Service Class
 *
 * Handles all jam tracks related operations including:
 * - Scraping jam tracks data from Fortnite's API
 * - Processing qsep:// URLs to extract audio data
 * - Streaming and downloading jam track audio
 * - Audio segment processing and playlist parsing
 */
export class JamTracksService {
  /** Browser service instance for web scraping operations */
  private browserService: BrowserService;
  /** Audio processor service for handling audio data */
  private audioProcessor: AudioProcessorService;

  /**
   * Initialize the Jam Tracks Service
   *
   * Creates a new instance and initializes the browser and audio processor services.
   */
  constructor() {
    this.browserService = BrowserService.getInstance();
    this.audioProcessor = new AudioProcessorService();
  }

  /**
   * Common Scraping Function for Fortnite Data
   *
   * A reusable method that handles the common pattern of scraping data from
   * Fortnite's API endpoints. It uses the browser service to make requests
   * and parse JSON responses.
   *
   * @param url - The Fortnite API endpoint URL to scrape
   * @returns Promise<any> - The parsed JSON data from the API
   * @throws Error if the request fails or data cannot be parsed
   */
  private async scrapeFortniteData(url: string): Promise<any> {
    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: APP_CONFIG.BROWSER_TIMEOUT,
      });

      const data = await response!.json();

      await page.close();
      return data;
    } catch (error) {
      await page.close();
      console.error(`Error scraping data from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Scrape Jam Tracks Data
   *
   * Fetches the complete jam tracks data from Fortnite's API.
   * This includes all available jam tracks and their metadata.
   *
   * @returns Promise<JamTracksData> - Complete jam tracks data
   * @throws Error if the request fails or data cannot be parsed
   */
  public async scrapeJamTracks(): Promise<JamTracksData> {
    return await this.scrapeFortniteData(API_ENDPOINTS.JAM_TRACKS());
  }

  /**
   * Process Jam Track URL
   *
   * Processes a qsep:// URL to extract jam track data and audio information.
   * This method handles the conversion from qsep:// to https://, fetches the data,
   * and processes any audio playlist information.
   *
   * @param request - Jam track request containing the qsep:// URL
   * @returns Promise<JamTrackResponse> - Processed jam track data with audio information
   * @throws Error if the URL is invalid or processing fails
   */
  public async processJamTrack(
    request: JamTrackRequest
  ): Promise<JamTrackResponse> {
    const { url } = request;

    // Validate input
    if (!url) {
      throw new Error("URL is required in request body");
    }

    // Check if URL starts with qsep://
    if (!url.startsWith("qsep://")) {
      throw new Error("URL must start with 'qsep://'");
    }

    const cleanUrl = "https://" + url.replace("qsep://", "");
    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
      const response = await page.goto(cleanUrl, {
        waitUntil: "domcontentloaded",
        timeout: APP_CONFIG.BROWSER_TIMEOUT,
      });

      const contentType = response!.headers()["content-type"] || "";
      let data: any;

      if (contentType.includes("application/json")) {
        data = await response!.json();
        if (data.playlist) {
          try {
            const decodedPlaylist = Buffer.from(
              data.playlist,
              "base64"
            ).toString("utf-8");

            try {
              const playlistInfo = this.audioProcessor.parsePlaylistXML(
                decodedPlaylist,
                data.metadata?.baseUrls?.[0] || ""
              );

              const audioBuffer = await this.audioProcessor.fetchAudioSegments(
                playlistInfo.segments
              );
              data.audioBuffer = audioBuffer.toString("base64");
              data.audioSize = audioBuffer.length;
            } catch (error: any) {
              console.error("Error processing audio:", error);
              data.audioError = error.message;
            }
          } catch (error: any) {
            console.error("Error decoding base64 playlist:", error);
            data.playlistDecodeError = error.message;
          }
        }
      } else {
        data = await response!.text();
      }

      const cleanedData: any = {};
      if (data.audioBuffer) {
        cleanedData.audioBuffer = data.audioBuffer;
      }
      if (data.audioSize) {
        cleanedData.audioSize = data.audioSize;
      }
      if (data.audioError) {
        cleanedData.audioError = data.audioError;
      }
      if (data.playlistDecodeError) {
        cleanedData.playlistDecodeError = data.playlistDecodeError;
      }

      await page.close();
      return {
        success: true,
        data: cleanedData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      await page.close();
      console.error("Error making request to qsep URL:", error);
      throw error;
    }
  }

  /**
   * Stream Jam Track Audio
   *
   * Processes a qsep:// URL and returns playlist information for streaming.
   * This method is used for large audio files that need to be streamed rather than
   * downloaded completely.
   *
   * @param url - The qsep:// URL to process
   * @returns Promise<{ playlistInfo: PlaylistInfo }> - Playlist information for streaming
   * @throws Error if the URL is invalid or no audio data is found
   */
  public async streamJamTrack(
    url: string
  ): Promise<{ playlistInfo: PlaylistInfo }> {
    if (!url || !url.startsWith("qsep://")) {
      throw new Error("Invalid URL");
    }

    const cleanUrl = "https://" + url.replace("qsep://", "");
    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
      const response = await page.goto(cleanUrl, {
        waitUntil: "domcontentloaded",
        timeout: APP_CONFIG.BROWSER_TIMEOUT,
      });
      const data = await response!.json();

      if (data.playlist) {
        const decodedPlaylist = Buffer.from(data.playlist, "base64").toString(
          "utf-8"
        );
        const playlistInfo = this.audioProcessor.parsePlaylistXML(
          decodedPlaylist,
          data.metadata?.baseUrls?.[0] || ""
        );

        return { playlistInfo };
      }

      throw new Error("No audio data found");
    } finally {
      await page.close();
    }
  }

  /**
   * Download Jam Track Audio Directly
   *
   * Processes a qsep:// URL and downloads the complete audio file as a Buffer.
   * This method fetches all audio segments and combines them into a single buffer.
   *
   * @param url - The qsep:// URL to process
   * @returns Promise<Buffer> - Complete audio file as a Buffer
   * @throws Error if the URL is invalid or no audio data is found
   */
  public async downloadJamTrackAudio(url: string): Promise<Buffer> {
    if (!url) {
      throw new Error("URL is required in request body");
    }

    if (!url.startsWith("qsep://")) {
      throw new Error("URL must start with 'qsep://'");
    }

    const cleanUrl = "https://" + url.replace("qsep://", "");
    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
      const response = await page.goto(cleanUrl, {
        waitUntil: "domcontentloaded",
        timeout: APP_CONFIG.BROWSER_TIMEOUT,
      });

      const contentType = response!.headers()["content-type"] || "";
      let data: any;

      if (contentType.includes("application/json")) {
        data = await response!.json();

        if (data.playlist) {
          const decodedPlaylist = Buffer.from(data.playlist, "base64").toString(
            "utf-8"
          );
          const playlistInfo = this.audioProcessor.parsePlaylistXML(
            decodedPlaylist,
            data.metadata?.baseUrls?.[0] || ""
          );
          const audioBuffer = await this.audioProcessor.fetchAudioSegments(
            playlistInfo.segments
          );

          return audioBuffer;
        }
      }

      throw new Error("No audio data found");
    } catch (error) {
      await page.close();
      throw error;
    }
  }
}
