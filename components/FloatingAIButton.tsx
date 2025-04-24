"use client";

import React, { useState } from "react";
import { Mic, ArrowUpRight, Paperclip, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import VoiceRecognition from "./VoiceRecognition";
import { generateContent } from "@/lib/utils/openai";
import { toast } from "sonner";
import { useNotes } from "@/lib/hooks/useNotes";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { markdownToHTML } from "./NoteEditor";

type Suggestion = {
  text: string;
};

const FloatingAIButton = () => {
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { addNote } = useNotes();
  const { user } = useAuth();
  const router = useRouter();

  const suggestions: Suggestion[] = [
    { text: "Plan my day" },
    { text: "Write a note about artificial intelligence" },
    { text: "Generate a summary of my recent meetings" },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      // Generate content from OpenAI
      const generatedText = await generateContent(inputText);
      setInputText("");
      setIsOpen(false);
      console.log("Generated Text:", generatedText);

      // Convert Markdown to HTML for proper rendering
      const contentHtml = await markdownToHTML(generatedText);
      console.log("Converted HTML:", contentHtml);

      // Add the generated content as a new note using React Query mutation
      if (!user) {
        toast.error("You must be logged in to save a note");
        return;
      }

      const noteData = {
        title:
          inputText.length > 30
            ? `${inputText.substring(0, 30)}...`
            : inputText,
        // Store the HTML content so it renders properly
        content: contentHtml,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["ai-generated"],
        isPrivate: false,
        user_id: user.id,
      };

      addNote(noteData, {
        onSuccess: (newNote) => {
          if (newNote && newNote.id) {
            router.push(`/notes/${newNote.id}`);
          }
        },
      });
    } catch (error) {
      toast.error("Failed to generate content");
      console.error("Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranscriptionComplete = (transcribedText: string) => {
    setInputText((prev) => prev + " " + transcribedText.trim());
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary/90 z-50">
          <Mic size={24} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="p-0 border-t rounded-t-xl max-h-[90vh] pb-20 pt-5"
      >
        <SheetTitle className="sr-only">Ai Assistant</SheetTitle>
        <div className="flex flex-col h-full pt-5">
          <div className="px-4">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything..."
              className="w-full focus:outline-none focus:ring-0 border-0 border-b rounded-none text-xl pb-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="flex-1 px-4 mt-4 space-y-5">
            {suggestions.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setInputText(item.text)}
              >
                <p className="text-sm">{item.text}</p>
                <ArrowUpRight size={16} />
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-background border-t px-4 py-2">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <VoiceRecognition
                  onTranscriptionComplete={handleTranscriptionComplete}
                />

                {/* <button className="bg-transparent text-muted-foreground rounded-full p-2">
                  <Paperclip size={20} />
                </button> */}
              </div>
              <Button
                type="button"
                size="icon"
                className="rounded-full"
                onClick={() => handleSubmit()}
                disabled={isGenerating || !inputText.trim()}
                aria-label="Submit"
              >
                {isGenerating ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-white"></div>
                ) : (
                  <ArrowUp />
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FloatingAIButton;
