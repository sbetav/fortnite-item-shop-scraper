/**
 * Audio Processor Service
 *
 * This service handles the processing of audio data from jam tracks.
 * It parses XML playlists, fetches audio segments, and combines them
 * into complete audio files. Used for jam track audio processing.
 *
 * @fileoverview Audio processing service for Fortnite Jam Tracks
 */

import { DOMParser } from "xmldom";
import axios from "axios";
import { APP_CONFIG } from "../../config/app.config";
import {
  PlaylistInfo,
  AudioSegment,
  AudioBuffer,
} from "../../shared/types/api.types";

/**
 * Audio Processor Service Class
 *
 * Handles all audio processing operations including:
 * - XML playlist parsing
 * - Audio segment fetching
 * - Audio buffer combination
 */
export class AudioProcessorService {
  /**
   * Parse XML Playlist and Extract Segment URLs
   *
   * Parses an XML playlist (MPD format) and extracts audio segment information.
   * This method handles the complex XML structure to identify audio segments
   * and their metadata for subsequent fetching.
   *
   * @param xmlContent - The XML playlist content as a string
   * @param baseUrl - Base URL for constructing segment URLs
   * @returns PlaylistInfo - Parsed playlist information with segment URLs
   * @throws Error if XML parsing fails or required elements are missing
   */
  public parsePlaylistXML(xmlContent: string, baseUrl: string): PlaylistInfo {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

      const baseUrlElement = xmlDoc.getElementsByTagName("BaseURL")[0];
      const actualBaseUrl = baseUrlElement
        ? baseUrlElement.textContent || baseUrl
        : baseUrl;
      const segmentTemplate = xmlDoc.getElementsByTagName("SegmentTemplate")[0];
      if (!segmentTemplate) {
        throw new Error("No SegmentTemplate found in playlist");
      }

      const duration = parseInt(
        segmentTemplate.getAttribute("duration") || "0"
      );
      const timescale = parseInt(
        segmentTemplate.getAttribute("timescale") || "1"
      );
      const initialization =
        segmentTemplate.getAttribute("initialization") || "";
      const media = segmentTemplate.getAttribute("media") || "";
      const startNumber = parseInt(
        segmentTemplate.getAttribute("startNumber") || "1"
      );

      const segmentDuration = duration / timescale;
      const totalDuration = segmentDuration;
      const mediaPresentationDuration = xmlDoc
        .getElementsByTagName("MPD")[0]
        ?.getAttribute("mediaPresentationDuration");
      let actualTotalDuration = totalDuration;

      if (mediaPresentationDuration) {
        const match = mediaPresentationDuration.match(/PT(\d+(?:\.\d+)?)S/);
        if (match) {
          actualTotalDuration = parseFloat(match[1]);
        }
      }

      const totalSegments = Math.ceil(actualTotalDuration / segmentDuration);
      const segments: AudioSegment[] = [];
      if (initialization) {
        const initUrl = initialization.replace("$RepresentationID$", "0");
        segments.push({
          type: "init",
          url: actualBaseUrl + initUrl,
          number: 0,
        });
      }

      for (let i = startNumber; i < startNumber + totalSegments; i++) {
        const segmentUrl = media
          .replace("$RepresentationID$", "0")
          .replace("$Number$", i.toString());
        segments.push({
          type: "media",
          url: actualBaseUrl + segmentUrl,
          number: i,
        });
      }

      return {
        baseUrl: actualBaseUrl,
        totalDuration,
        segmentDuration,
        totalSegments,
        segments,
      };
    } catch (error) {
      console.error("Error parsing playlist XML:", error);
      throw error;
    }
  }

  /**
   * Fetch All Audio Segments and Combine Them
   *
   * Downloads all audio segments from the provided segment URLs and combines
   * them into a single audio buffer. Handles errors gracefully and continues
   * with available segments even if some fail to download.
   *
   * @param segments - Array of audio segments to fetch
   * @returns Promise<Buffer> - Combined audio buffer containing all segments
   * @throws Error if no segments can be fetched successfully
   */
  public async fetchAudioSegments(segments: AudioSegment[]): Promise<Buffer> {
    try {
      const audioBuffers: AudioBuffer[] = [];
      const failedSegments: number[] = [];

      for (const segment of segments) {
        try {
          const response = await axios.get(segment.url, {
            responseType: "arraybuffer",
            timeout: APP_CONFIG.AUDIO_SEGMENT_TIMEOUT,
          });

          audioBuffers.push({
            data: Buffer.from(response.data),
            number: segment.number,
            type: segment.type,
          });
        } catch (error: any) {
          console.error(
            `Error fetching segment ${segment.number}:`,
            error.message
          );
          failedSegments.push(segment.number);
        }
      }

      audioBuffers.sort((a, b) => a.number - b.number);

      const totalLength = audioBuffers.reduce(
        (sum, buffer) => sum + buffer.data.length,
        0
      );
      const combinedBuffer = Buffer.alloc(totalLength);

      let offset = 0;
      for (const buffer of audioBuffers) {
        buffer.data.copy(combinedBuffer, offset);
        offset += buffer.data.length;
      }

      return combinedBuffer;
    } catch (error) {
      console.error("Error fetching audio segments:", error);
      throw error;
    }
  }
}
