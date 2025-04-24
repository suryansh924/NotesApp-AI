"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/supabase/notes";
import { Note } from "@/lib/stores/notesSlice";

export default function EditNotePage() {
  const { id } = useParams();
  const router = useRouter();
  const noteId = Array.isArray(id) ? id[0] : id;

  // Fetch all notes
  const {
    data: notes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
    staleTime: 0, // Force fresh data
    retry: 2,
  });

  const [note, setNote] = useState<Note | undefined>(undefined);

  useEffect(() => {
    if (notes && noteId) {
      console.log("Looking for note with ID:", noteId);
      console.log(
        "Available notes:",
        notes.map((n) => n.id)
      );

      // Convert both to strings for comparison to handle potential type mismatches
      const foundNote = notes.find((n) => String(n.id) === String(noteId));

      if (foundNote) {
        console.log("Note found:", foundNote);
        setNote(foundNote);
      } else if (!isLoading) {
        console.error("Note not found with ID:", noteId);
        toast.error("Note not found");
        // Delay redirect to show the toast
        setTimeout(() => router.push("/"), 1500);
      }
    }
  }, [notes, noteId, router, isLoading]);

  const handleSave = () => {
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 max-w-4xl">
        <Toaster position="top-right" />
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ChevronLeft className="h-5 w-5 mr-1" /> Back to Notes
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Note</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading note...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-destructive">
            Error loading note. Please try again.
          </div>
        ) : note ? (
          <NoteEditor existingNote={note} onSave={handleSave} />
        ) : (
          <div className="p-4 text-muted-foreground">
            Note not found.{" "}
            <Link href="/new" className="text-primary hover:underline">
              Create a new note
            </Link>{" "}
            instead.
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
