import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function cleanFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }
}

app.post("/api/process-youtube", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const tempDir = "temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const id = Date.now().toString();
    const inputPath = path.join(tempDir, `${id}-input.mp3`);
    const outputPath = path.join(tempDir, `${id}-vocals.wav`);

    // -----------------------------
    // 1) تحميل الصوت باستخدام yt-dlp
    // -----------------------------
    const ytdlp = spawn("yt-dlp", [
      "-f", "bestaudio",
      "-o", inputPath,
      url
    ]);

    ytdlp.on("close", (code) => {
      if (code !== 0) {
        cleanFile(inputPath);
        return res.status(500).json({ error: "Failed to download audio" });
      }

      // -----------------------------
      // 2) تشغيل سكربت Python لعزل الصوت
      // -----------------------------
      const py = spawn("python", [
        "process_audio.py",
        inputPath,
        outputPath
      ]);

      py.on("close", (code) => {
        if (code !== 0) {
          cleanFile(inputPath);
          cleanFile(outputPath);
          return res.status(500).json({ error: "Audio processing failed" });
        }

        res.json({
          audioUrl: `/stream-audio/${id}`
        });
      });
    });

  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/stream-audio/:id", (req, res) => {
  const { id } = req.params;
  const filePath = path.join("temp", `${id}-vocals.wav`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Not found");
  }

  res.setHeader("Content-Type", "audio/wav");
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
