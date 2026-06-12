import { ApiError } from "./api-error.js";
import { logger } from "../config/logger.js";

/**
 * Transcribes audio buffer using Groq's whisper-large-v3 model.
 * Features automatic key rotation and fallback if a key encounters rate limits or errors.
 * 
 * @param {Buffer} fileBuffer - Audio file buffer
 * @param {string} originalName - Original filename (e.g. recording.webm)
 * @param {string} mimeType - Audio mime type (e.g. audio/webm)
 * @returns {Promise<{text: string}>} Transcription result
 */
export async function transcribeAudio(fileBuffer, originalName, mimeType) {
  // Get and parse Groq keys
  const keysString = process.env.GROQ_API_KEYS || "";
  const keys = keysString
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  if (keys.length === 0) {
    throw new ApiError(500, "Groq API keys not configured in environment");
  }

  let lastError = null;

  // Try each key sequentially
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    logger.info(`Attempting audio transcription using Groq Key Index ${i}`);

    try {
      // Create FormData using Node native API
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append("file", blob, originalName || "audio.webm");
      formData.append("model", "whisper-large-v3");

      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        logger.warn(
          { status: response.status, error: data },
          `Groq transcription failed with key index ${i}`
        );
        lastError = data?.error?.message || `HTTP ${response.status} from Groq`;
        continue; // Try next key
      }

      logger.info(`Groq transcription successful with key index ${i}`);
      return data;
    } catch (err) {
      logger.error(
        { err: err.message },
        `Network error during Groq transcription with key index ${i}`
      );
      lastError = err.message;
    }
  }

  // If we reach here, all keys failed
  throw new ApiError(
    502,
    `Failed to transcribe audio after trying all ${keys.length} Groq API keys. Last error: ${lastError}`
  );
}
