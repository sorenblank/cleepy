/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

// const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

interface ClipRequest {
  url: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  videoTitle?: string;
}

function secondsToHMS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toFixed(3).padStart(6, "0")}`;
}

function createJobId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);

    let stderr = "";
    process.stderr.on("data", (data) => {
      stderr += data.toString();
      console.error(`${command} stderr:`, data.toString());
    });

    process.stdout.on("data", (data) => {
      console.log(`${command} stdout:`, data.toString());
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`${command} exited with code ${code}. Error: ${stderr}`)
        );
      }
    });

    process.on("error", (error) => {
      reject(new Error(`Failed to start ${command}: ${error.message}`));
    });
  });
}

// Get the path to the local yt-dlp binary
function getYtDlpPath(): string {
  return path.join(
    process.cwd(),
    "src",
    "app",
    "api",
    "clip-video",
    "bin",
    "yt-dlp"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: ClipRequest = await request.json();
    const { url, startTime, endTime, videoTitle } = body;

    if (!url || typeof startTime !== "number" || typeof endTime !== "number") {
      return NextResponse.json(
        { error: "URL, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "startTime must be less than endTime" },
        { status: 400 }
      );
    }

    const jobId = createJobId();
    const tempDir = path.join(process.cwd(), "temp");

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const outputPath = path.join(tempDir, `clip-${jobId}.mp4`);

    // Convert seconds to HH:MM:SS.mmm format for yt-dlp
    const startTimeFormatted = secondsToHMS(startTime);
    const endTimeFormatted = secondsToHMS(endTime);
    const section = `*${startTimeFormatted}-${endTimeFormatted}`;

    console.log(`Processing clip: ${section} from ${url}`);

    // yt-dlp command arguments
    const ytDlpArgs = [
      url,
      "-f",
      "bv[ext=mp4][height<=?1080]+ba[ext=m4a]/best[ext=mp4][height<=?1080]",
      "--download-sections",
      section,
      "-o",
      outputPath,
      "--merge-output-format",
      "mp4",
      "--no-check-certificates",
      "--no-warnings",
      "--add-header",
      "referer:youtube.com",
      "--add-header",
      "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    ];

    // Check if local yt-dlp is available
    const ytDlpPath = getYtDlpPath();
    try {
      await access(ytDlpPath);
      await runCommand(ytDlpPath, ["--version"]);
    } catch (_error) {
      console.error("Local yt-dlp not found:", _error);
      return NextResponse.json(
        {
          error:
            "Video processing service unavailable. Local yt-dlp binary not found.",
          details:
            "yt-dlp binary should be located at src/app/api/clip-video/bin/yt-dlp",
        },
        { status: 503 }
      );
    }

    // Download and clip the video
    try {
      await runCommand(ytDlpPath, ytDlpArgs);
    } catch (error) {
      console.error("yt-dlp failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { error: "Failed to download and clip video", details: errorMessage },
        { status: 500 }
      );
    }

    // Check if file was created
    try {
      await access(outputPath);
    } catch (error) {
      return NextResponse.json(
        { error: "Clipped video file was not created" },
        { status: 500 }
      );
    }

    // Get file stats
    const stats = fs.statSync(outputPath);

    // Read the file for response
    const fileBuffer = fs.readFileSync(outputPath);

    // Clean up the temporary file
    try {
      await unlink(outputPath);
    } catch (_error) {
      console.warn("Failed to cleanup temp file:", _error);
    }

    // Generate filename for download
    const sanitizedTitle =
      videoTitle?.replace(/[^a-zA-Z0-9\-_\s]/g, "") || "clip";
    const filename = `${sanitizedTitle}_${Math.floor(startTime)}s-${Math.floor(
      endTime
    )}s.mp4`;

    // Return the video file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": stats.size.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Clipping error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Check if local yt-dlp is available
    const ytDlpPath = getYtDlpPath();
    await access(ytDlpPath);
    await runCommand(ytDlpPath, ["--version"]);
    return NextResponse.json({ status: "healthy", ytdlp: "available" });
  } catch (error) {
    return NextResponse.json({
      status: "degraded",
      ytdlp: "unavailable",
      message: "Local yt-dlp binary is required for video processing",
    });
  }
}
