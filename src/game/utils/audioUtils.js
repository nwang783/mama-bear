/**
 * Audio utilities for Gemini Live API voice chat
 * Handles getUserMedia, resampling to 16kHz mono PCM, base64 encoding, and WAV playback
 */

/**
 * Request microphone permission and return a MediaStream
 */
export async function getMicrophoneStream() {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.error('Microphone access denied:', err);
    throw new Error('Microphone permission denied. Please allow microphone access.');
  }
}

/**
 * Capture audio from a MediaStream and resample to 16kHz mono PCM
 * Returns base64-encoded PCM data suitable for Gemini Live API
 */
export async function captureAndResampleAudio(stream, durationMs = 5000) {
  // Backwards compatible helper that starts + auto-stops after duration
  const rec = await startPcmCapture(stream);
  await new Promise(r => setTimeout(r, durationMs));
  return rec.stop();
}

/**
 * Start a 16kHz mono PCM capture that you can stop on demand.
 * Returns an object: { stop(): Promise<string base64>, getDurationMs(): number }
 */
export async function startPcmCapture(stream, { bufferSize = 1024, onLevel, onChunk } = {}) {
  const startedAt = performance.now();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioCtx(); // browser decides sample rate
  const inputSampleRate = audioContext.sampleRate;
  const source = audioContext.createMediaStreamSource(stream);

  // ScriptProcessor (simple for hackathon; AudioWorklet recommended in production)
  const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

  const chunks = [];
  let recording = true;

  processor.onaudioprocess = (e) => {
    if (!recording) return;
    const inputData = e.inputBuffer.getChannelData(0);

    // Simple level meter callback
    if (onLevel) {
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
      const rms = Math.sqrt(sum / inputData.length);
      onLevel(rms);
    }

    // Convert Float32Array [-1,1] to Int16 PCM
    const pcmData = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      const s = Math.max(-1, Math.min(1, inputData[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    chunks.push(pcmData);

    // Realtime streaming callback
    if (onChunk) {
      const bytes = new Uint8Array(pcmData.buffer);
      const b64 = uint8ToBase64(bytes);
      try { onChunk(b64); } catch (e) { /* ignore */ }
    }
  };

  source.connect(processor);
  processor.connect(audioContext.destination);

  async function stop() {
    recording = false;
    try {
      processor.disconnect();
    } catch {}
    try {
      source.disconnect();
    } catch {}
    try {
      await audioContext.close();
    } catch {}

    // Combine all chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Int16Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to base64 without stack overflow (chunked)
    const bytes = new Uint8Array(combined.buffer);
    const base64 = uint8ToBase64(bytes);
    return base64;
  }

  function getDurationMs() {
    return performance.now() - startedAt;
  }

  function getSampleRate() {
    return inputSampleRate;
  }

  return { stop, getDurationMs, getSampleRate };
}

function uint8ToBase64(u8) {
  let binary = '';
  const chunkSize = 0x8000; // 32KB per chunk
  for (let i = 0; i < u8.length; i += chunkSize) {
    const chunk = u8.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

/**
 * Build a WAV file from base64-encoded Int16 PCM chunks (24kHz mono from Gemini)
 * Returns a Blob suitable for playback
 */
export function buildWavFromBase64Int16Chunks(base64Chunks, sampleRate = 24000, channels = 1) {
  // Decode all chunks
  const pcmChunks = base64Chunks.map(b64 => {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Int16Array(bytes.buffer);
  });

  // Combine
  const totalSamples = pcmChunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combined = new Int16Array(totalSamples);
  let offset = 0;
  for (const chunk of pcmChunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  // Build WAV header
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = combined.byteLength;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Copy PCM data
  const pcmView = new Int16Array(buffer, 44);
  pcmView.set(combined);

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Play a WAV blob using HTML5 Audio
 */
export function playAudioBlob(blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
  audio.onended = () => URL.revokeObjectURL(url);
  return audio;
}
