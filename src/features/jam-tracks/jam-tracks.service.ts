import { BrowserService } from "../../shared/browser/browser.service";
import { AudioProcessorService } from "./audio-processor.service";
import { APP_CONFIG, API_ENDPOINTS } from "../../config/app.config";
import {
    JamTracksData,
    JamTrackRequest,
    JamTrackResponse,
} from "./jam-tracks.types";
import { PlaylistInfo } from "../../shared/types/api.types";

export class JamTracksService {
  private browserService: BrowserService;
  private audioProcessor: AudioProcessorService;

  constructor() {
    this.browserService = BrowserService.getInstance();
    this.audioProcessor = new AudioProcessorService();
  }

  /**
   * Common scraping function for Fortnite data
   */
  private async scrapeFortniteData(url: string): Promise<any> {
    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
      console.log(`Fetching fresh data...`);

      // Direct API request - this is the most efficient approach
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: APP_CONFIG.BROWSER_TIMEOUT,
      });

      const data = await response!.json();

      await page.close();
      return data;
    } catch (error) {
      await page.close();
      console.error(`Error scraping data:`, error);
      throw error;
    }
  }

  /**
   * Scrape jam tracks data
   */
  public async scrapeJamTracks(): Promise<JamTracksData> {
    return await this.scrapeFortniteData(API_ENDPOINTS.JAM_TRACKS);
  }

  /**
   * Process jam track URL
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

    // Remove qsep:// prefix and add https:// protocol
    const cleanUrl = "https://" + url.replace("qsep://", "");
    console.log(`Processing qsep URL: ${url}`);
    console.log(`Clean URL: ${cleanUrl}`);

    // Make GET request to the clean URL
    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
      console.log(`Making GET request to: ${cleanUrl}`);
      const response = await page.goto(cleanUrl, {
        waitUntil: "domcontentloaded",
        timeout: APP_CONFIG.BROWSER_TIMEOUT,
      });

      // Get response content
      const contentType = response!.headers()["content-type"] || "";
      let data: any;

      if (contentType.includes("application/json")) {
        data = await response!.json();

        // Process audio if playlist exists
        if (data.playlist) {
          try {
            const decodedPlaylist = Buffer.from(
              data.playlist,
              "base64"
            ).toString("utf-8");

            // Parse playlist and fetch audio
            try {
              console.log("Parsing playlist XML...");
              const playlistInfo = this.audioProcessor.parsePlaylistXML(
                decodedPlaylist,
                data.metadata?.baseUrls?.[0] || ""
              );

              console.log("Fetching audio segments...");
              const audioBuffer = await this.audioProcessor.fetchAudioSegments(
                playlistInfo.segments
              );
              data.audioBuffer = audioBuffer.toString("base64");
              data.audioSize = audioBuffer.length;

              console.log(`Audio fetched: ${audioBuffer.length} bytes`);
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

      // Clean up the response data - remove unnecessary fields
      const cleanedData: any = {};

      // Only keep essential fields
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

      // Console log the cleaned response
      console.log("Response from qsep URL:");
      console.log(JSON.stringify(cleanedData, null, 2));

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
   * Stream jam track audio
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
   * Download jam track audio directly
   */
  public async downloadJamTrackAudio(url: string): Promise<Buffer> {
    if (!url) {
      throw new Error("URL is required in request body");
    }

    if (!url.startsWith("qsep://")) {
      throw new Error("URL must start with 'qsep://'");
    }

    // Process the qsep URL with audio fetching
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
