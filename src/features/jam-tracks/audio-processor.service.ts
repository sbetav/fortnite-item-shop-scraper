import { DOMParser } from "xmldom";
import axios from "axios";
import { APP_CONFIG } from "../../config/app.config";
import {
  PlaylistInfo,
  AudioSegment,
  AudioBuffer,
} from "../../shared/types/api.types";

export class AudioProcessorService {
  /**
   * Parse XML playlist and extract segment URLs
   */
  public parsePlaylistXML(xmlContent: string, baseUrl: string): PlaylistInfo {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

      // Extract BaseURL if not provided
      const baseUrlElement = xmlDoc.getElementsByTagName("BaseURL")[0];
      const actualBaseUrl = baseUrlElement
        ? baseUrlElement.textContent || baseUrl
        : baseUrl;

      // Find SegmentTemplate
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

      // Calculate total duration and number of segments
      const segmentDuration = duration / timescale; // duration of each segment in seconds
      const totalDuration = segmentDuration; // This is the duration of each segment, not total

      // Get the actual total duration from the MPD
      const mediaPresentationDuration = xmlDoc
        .getElementsByTagName("MPD")[0]
        ?.getAttribute("mediaPresentationDuration");
      let actualTotalDuration = totalDuration; // fallback

      if (mediaPresentationDuration) {
        // Parse PT30.464S format
        const match = mediaPresentationDuration.match(/PT(\d+(?:\.\d+)?)S/);
        if (match) {
          actualTotalDuration = parseFloat(match[1]);
        }
      }

      const totalSegments = Math.ceil(actualTotalDuration / segmentDuration);

      console.log(`Segment duration: ${segmentDuration}s`);
      console.log(`Total duration: ${actualTotalDuration}s`);
      console.log(`Calculated segments: ${totalSegments}`);

      // Generate segment URLs
      const segments: AudioSegment[] = [];

      // Add initialization segment
      if (initialization) {
        const initUrl = initialization.replace("$RepresentationID$", "0");
        segments.push({
          type: "init",
          url: actualBaseUrl + initUrl,
          number: 0,
        });
      }

      // Add media segments
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

      console.log(`Generated ${segments.length} segments:`);
      segments.forEach((seg) => {
        console.log(`  ${seg.type} ${seg.number}: ${seg.url}`);
      });

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
   * Fetch all audio segments and combine them
   */
  public async fetchAudioSegments(segments: AudioSegment[]): Promise<Buffer> {
    try {
      console.log(`Fetching ${segments.length} audio segments...`);
      const audioBuffers: AudioBuffer[] = [];
      const failedSegments: number[] = [];

      for (const segment of segments) {
        try {
          console.log(
            `Fetching segment ${segment.number} (${segment.type}): ${segment.url}`
          );
          const response = await axios.get(segment.url, {
            responseType: "arraybuffer",
            timeout: APP_CONFIG.AUDIO_SEGMENT_TIMEOUT,
          });

          audioBuffers.push({
            data: Buffer.from(response.data),
            number: segment.number,
            type: segment.type,
          });

          console.log(
            `Successfully fetched segment ${
              segment.number
            } (${Buffer.byteLength(response.data)} bytes)`
          );
        } catch (error: any) {
          console.error(
            `Error fetching segment ${segment.number}:`,
            error.message
          );
          failedSegments.push(segment.number);
          // Continue with other segments even if one fails
        }
      }

      console.log(
        `Successfully fetched ${audioBuffers.length}/${segments.length} segments`
      );
      if (failedSegments.length > 0) {
        console.log(`Failed segments: ${failedSegments.join(", ")}`);
      }

      // Sort buffers by segment number to maintain correct order
      audioBuffers.sort((a, b) => a.number - b.number);

      // Combine all buffers
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

      console.log(
        `Combined audio: ${combinedBuffer.length} bytes from ${audioBuffers.length} segments`
      );
      return combinedBuffer;
    } catch (error) {
      console.error("Error fetching audio segments:", error);
      throw error;
    }
  }
}
