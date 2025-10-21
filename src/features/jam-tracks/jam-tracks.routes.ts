import { Router, Request, Response } from "express";
import axios from "axios";
import { JamTracksService } from "./jam-tracks.service";
import { ApiResponse } from "../../shared/types/api.types";

const router = Router();
const jamTracksService = new JamTracksService();

/**
 * Jam tracks endpoint
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    console.log("Received request for jam tracks data");
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
 * Jam track URL processing endpoint
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    // Validate input
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
 * Stream jam track audio endpoint (for large files)
 */
router.post("/stream", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || !url.startsWith("qsep://")) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const { playlistInfo } = await jamTracksService.streamJamTrack(url);

    // Set streaming headers
    res.setHeader("Content-Type", "audio/mp4");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    // Stream segments as they're fetched
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
    console.error("Error in /api/jam-track/stream:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Direct jam track audio download endpoint
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

    // Set headers for audio download
    res.setHeader("Content-Type", "audio/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="audio.mp4"');
    res.setHeader("Content-Length", audioBuffer.length);

    // Send the audio buffer directly
    return res.send(audioBuffer);
  } catch (error: any) {
    console.error("Error in /api/jam-track/audio:", error);
    const response: ApiResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(response);
  }
});

export default router;
