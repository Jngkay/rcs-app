import { useState, useRef } from "react";
import axios from "axios";

export default function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const startTimeRef = useRef(null);

  const startRecording = async () => {
    try {
      setError(null);
      setDuration(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setResult("");
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Microphone access denied or error starting recording.");
    }
  };

  const stopRecording = async () => {
    try {
      setIsProcessing(true);
      setIsRecording(false);

      if (startTimeRef.current) {
        setDuration((Date.now() - startTimeRef.current) / 1000);
      }

      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) return;

      const recordingPromise = new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          resolve(audioBlob);
          // Stop all audio tracks to release the microphone
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        };
      });

      mediaRecorder.stop();
      const audioBlob = await recordingPromise;

      const file = new File([audioBlob], "speech.webm", { type: 'audio/webm' });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "whisper-1");

      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your .env file.");
      }

      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data.text);
    } catch (err) {
      console.error("Error processing recording:", err);
      setError(err.response?.data?.error?.message || err.message || "Failed to process audio.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetRecording = () => {
    setResult("");
    setError(null);
    setDuration(0);
  };

  return {
    isRecording,
    isProcessing,
    result,
    error,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
