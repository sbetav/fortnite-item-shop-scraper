/**
 * Jam Tracks Routes
 *
 * This module defines all HTTP routes for the jam tracks feature.
 * It handles requests for jam tracks data, URL processing, audio streaming,
 * and direct audio downloads. All routes require API key authentication and
 * are subject to rate limiting.
 *
 * @fileoverview Express routes for Fortnite Jam Tracks Scraper API
 */

import { Router, Request, Response } from "express";
import axios from "axios";
import { JamTracksService } from "./jam-tracks.service";
import { ApiResponse } from "../../shared/types/api.types";

const router = Router();
const jamTracksService = new JamTracksService();

/**
 * GET /api/jam-tracks
 *
 * Fetches the complete Fortnite jam tracks data from the official API.
 *
 * Response:
 * - 200: Success with jam tracks data
 * - 500: Server error
 *
 * Rate Limit: 20 requests per 15 minutes
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const data = await jamTracksService.scrapeJamTracks();

    const response: ApiResponse = {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    };

    return res.json(response);
  } catch (error: any) {
    console.error("Error in /api/jam-tracks:", error);
    const response: ApiResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(response);
  }
});

/**
 * POST /api/jam-tracks
 *
 * Processes a qsep:// URL and returns jam track data with audio information.
 * This endpoint handles the conversion and processing of jam track URLs.
 *
 * Request Body:
 * - url (required): The qsep:// URL to process
 *
 * Response:
 * - 200: Success with processed jam track data
 * - 400: Bad request (missing URL)
 * - 500: Server error
 *
 * Rate Limit: 20 requests per 15 minutes
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    // Validate required input
    if (!url) {
      const response: ApiResponse = {
        success: false,
        error: "URL is required in request body",
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    const result = await jamTracksService.processJamTrack({ url });
    return res.json(result);
  } catch (error: any) {
    console.error("Error in /api/jam-tracks:", error);
    const response: ApiResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(response);
  }
});

/**
 * POST /api/jam-tracks/stream
 *
 * Streams jam track audio in real-time for large files.
 * This endpoint processes a qsep:// URL and streams the audio segments
 * as they are fetched, making it suitable for large audio files.
 *
 * Request Body:
 * - url (required): The qsep:// URL to stream
 *
 * Response:
 * - 200: Audio stream (Content-Type: audio/mp4)
 * - 400: Bad request (invalid URL)
 * - 500: Server error
 *
 * Rate Limit: 20 requests per 15 minutes
 */
router.post("/stream", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || !url.startsWith("qsep://")) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const { playlistInfo } = await jamTracksService.streamJamTrack(url);

    res.setHeader("Content-Type", "audio/mp4");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    for (const segment of playlistInfo.segments) {
      try {
        const segmentResponse = await axios.get(segment.url, {
          responseType: "stream",
        });
        segmentResponse.data.pipe(res, { end: false });
        await new Promise((resolve) => segmentResponse.data.on("end", resolve));
      } catch (error: any) {
        console.error(
          `Error streaming segment ${segment.number}:`,
          error.message
        );
      }
    }

    return res.end();
  } catch (error: any) {
    console.error("Error in /api/jam-tracks/stream:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/jam-tracks/audio
 *
 * Downloads jam track audio directly as a complete file.
 * This endpoint processes a qsep:// URL and downloads all audio segments,
 * combining them into a single audio file for download.
 *
 * Request Body:
 * - url (required): The qsep:// URL to download
 *
 * Response:
 * - 200: Audio file download (Content-Type: audio/mp4)
 * - 400: Bad request (missing or invalid URL)
 * - 500: Server error
 *
 * Rate Limit: 20 requests per 15 minutes
 */
router.post("/audio", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      const response: ApiResponse = {
        success: false,
        error: "URL is required in request body",
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    if (!url.startsWith("qsep://")) {
      const response: ApiResponse = {
        success: false,
        error: "URL must start with 'qsep://'",
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    const audioBuffer = await jamTracksService.downloadJamTrackAudio(url);

    res.setHeader("Content-Type", "audio/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="audio.mp4"');
    res.setHeader("Content-Length", audioBuffer.length);
    return res.send(audioBuffer);
  } catch (error: any) {
    console.error("Error in /api/jam-tracks/audio:", error);
    const response: ApiResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(response);
  }
});

export default router;
