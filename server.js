import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import ytdl from "ytdl-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

function cleanFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }
}

app.post("/api/process-youtube", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const id = ytdl.getURLVideoID(url);
    const tempDir = "temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const inputPath = path.join(tempDir, `${id}-input.mp3`);
    const outputPath = path.join(tempDir, `${id}-vocals.wav`);

    const audioStream = ytdl(url, {
      quality: "highestaudio",
      filter: "audioonly"
    });

    const writeStream = fs.createWriteStream(inputPath);
    audioStream.pipe(writeStream);

    writeStream.on("finish", () => {
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

    writeStream.on("error", () => {
      cleanFile(inputPath);
      res.status(500).json({ error: "Failed to download audio" });
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
// test redeploy

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
