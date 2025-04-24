"use client";

import { useState } from "react";
import { Search, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { useNotes } from "@/lib/hooks/useNotes";
import { useRouter } from "next/navigation";

const NotesList = () => {
  const { notes, isLoading, deleteNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNoteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedNoteId) {
      try {
        console.log("NotesList: Deleting note with ID:", selectedNoteId);

        // Pass the ID in the expected format
        deleteNote(
          { id: selectedNoteId },
          {
            onSuccess: () => {
              console.log("NotesList: Note deleted successfully");
              // UI should be automatically updated due to optimistic updates and cache invalidation
            },
          }
        );
      } catch (error) {
        console.error("NotesList: Error in delete operation:", error);
      } finally {
        setDeleteDialogOpen(false);
        setSelectedNoteId(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openNote = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  const filteredNotes = notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading notes...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => openNote(note.id)}
                >
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg line-clamp-1">
                          {note.title}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteClick(note.id, e)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2 line-clamp-3 text-sm text-muted-foreground prose-sm">
                        <ReactMarkdown>
                          {note.content.replace(/<\/?[^>]+(>|$)/g, "")}
                        </ReactMarkdown>
                      </div>

                      <div className="mt-4 pt-2 border-t text-xs text-muted-foreground">
                        {formatDate(note.updatedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No notes found. Create your first note!
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesList;
