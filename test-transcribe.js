import dotenv from "dotenv";
import { transcribeAudio } from "./src/utils/groq.js";

dotenv.config();

async function run() {
  console.log("Testing Groq Whisper Transcription Utility...");
  
  // Construct a minimal valid 1-second WAV buffer (silent) to test Groq's transcription endpoint
  const wavHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x24, 0x08, 0x00, 0x00, // File size - 8
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6d, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // Chunk size (16)
    0x01, 0x00,             // Compression code (1 = PCM)
    0x01, 0x00,             // Channels (1)
    0x44, 0xac, 0x00, 0x00, // Sample rate (44100)
    0x88, 0x58, 0x01, 0x00, // Bytes per sec
    0x02, 0x00,             // Block align
    0x10, 0x00,             // Bits per sample (16)
    0x64, 0x61, 0x74, 0x61, // "data"
    0x00, 0x08, 0x00, 0x00, // Chunk size
  ]);
  const silentData = Buffer.alloc(8000); // 8000 bytes of silence
  const dummyAudio = Buffer.concat([wavHeader, silentData]);

  try {
    const result = await transcribeAudio(dummyAudio, "test.wav", "audio/wav");
    console.log("\n==========================================");
    console.log("✓ SUCCESS: Groq API responds successfully!");
    console.log("Transcription result:", JSON.stringify(result));
    console.log("==========================================\n");
    process.exit(0);
  } catch (error) {
    console.error("\n==========================================");
    console.error("✗ ERROR: Groq transcription failed!");
    console.error("Message:", error.message);
    console.error("==========================================\n");
    process.exit(1);
  }
}

run();
