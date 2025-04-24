"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transcribeAudio } from "@/lib/utils/openai";

interface VoiceRecognitionProps {
  onTranscriptionComplete: (text: string) => void;
}

const VoiceRecognition = ({
  onTranscriptionComplete,
}: VoiceRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
        });

        try {
          const transcription = await transcribeAudio(audioFile);
          onTranscriptionComplete(transcription);
        } catch (error) {
          console.error("Transcription error:", error);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      className="bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800"
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <Square className="h-5 w-5 text-red-500" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};

export default VoiceRecognition;
