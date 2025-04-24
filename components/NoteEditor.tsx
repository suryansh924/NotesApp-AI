"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Code,
  Quote,
  ListOrdered,
  Save,
  Copy,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Note } from "@/lib/stores/notesSlice";
import { useNotes } from "@/lib/hooks/useNotes";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";
import { summarizeText } from "@/lib/utils/openai";

// Minimum content length required for summarization (approximately 50 words)
const MIN_SUMMARIZABLE_LENGTH = 200;

interface NoteEditorProps {
  existingNote?: Note;
  onSave?: () => void;
}

// Function to convert markdown to HTML for TipTap
const markdownToHTML = async (markdown: string): Promise<string> => {
  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkHtml)
      .process(markdown);

    return result.toString();
  } catch (error) {
    console.error("Error converting markdown to HTML:", error);
    return markdown; // Fallback to raw markdown if conversion fails
  }
};

const NoteEditor = ({ existingNote, onSave }: NoteEditorProps) => {
  const [title, setTitle] = useState(existingNote?.title || "");
  const { addNote, updateNote } = useNotes();
  const { user } = useAuth();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [tempSummary, setTempSummary] = useState<string | null>(null);
  const [formattedSummary, setFormattedSummary] = useState<string | null>(null);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(false);
  const [hasEnoughContent, setHasEnoughContent] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-300 pl-4 italic",
          },
        },
        code: {
          HTMLAttributes: {
            class: "bg-gray-100 rounded p-1 font-mono text-sm",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Write your note content here... (Markdown supported)",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg dark:prose-invert focus:outline-none min-h-[300px] max-w-none p-4",
      },
    },
    onUpdate: ({ editor }) => {
      // Check if the content is long enough to be summarized
      const contentLength = editor.getText().trim().length;
      setHasEnoughContent(contentLength >= MIN_SUMMARIZABLE_LENGTH);
    },
  });

  useEffect(() => {
    const loadContent = async () => {
      if (existingNote && editor && !editor.isDestroyed) {
        try {
          // For existing content - attempt to parse markdown if it contains markdown symbols
          if (
            existingNote.content.includes("#") ||
            existingNote.content.includes("*") ||
            existingNote.content.includes("- ") ||
            existingNote.content.includes("> ")
          ) {
            const html = await markdownToHTML(existingNote.content);
            editor.commands.setContent(html);
          } else {
            editor.commands.setContent(existingNote.content);
          }
          setTitle(existingNote.title);

          // Check if existing content is long enough to summarize
          const contentLength = existingNote.content.trim().length;
          setHasEnoughContent(contentLength >= MIN_SUMMARIZABLE_LENGTH);
        } catch (err) {
          console.error("Error setting editor content:", err);
          editor.commands.setContent(existingNote.content);

          // Still check content length even if there was an error
          const contentLength = existingNote.content.trim().length;
          setHasEnoughContent(contentLength >= MIN_SUMMARIZABLE_LENGTH);
        }
      }
    };

    loadContent();
  }, [existingNote, editor]);

  // Helper function to handle new content from AI or other sources
  // const setMarkdownContent = async (markdown: string) => {
  //   if (!editor || editor.isDestroyed) return;

  //   try {
  //     const html = await markdownToHTML(markdown);
  //     editor.commands.setContent(html);
  //   } catch (err) {
  //     console.error("Error setting markdown content:", err);
  //     editor.commands.setContent(markdown);
  //   }
  // };

  const handleSummarize = async (
    noteId: null | string,
    content: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (isSummarizing) return;

    setIsSummarizing(true);
    try {
      console.log("Starting summarization for note ID:", noteId);
      const summary = await summarizeText(content);

      // Store the raw summary
      setTempSummary(summary);

      // Convert markdown summary to HTML for display
      const formattedHTML = await markdownToHTML(summary);
      setFormattedSummary(formattedHTML);

      setShowSummaryDrawer(true);
      toast.success("Note summarized successfully");
    } catch (error) {
      console.error("Failed to summarize note:", error);
      toast.error("Failed to summarize note");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopySummary = () => {
    if (!tempSummary) return;
    navigator.clipboard.writeText(tempSummary);
    toast.success("Summary copied to clipboard");
  };

  const closeSummaryDrawer = () => {
    setShowSummaryDrawer(false);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your note");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to save a note");
      return;
    }

    if (!editor) {
      toast.error("Editor not initialized");
      return;
    }

    const content = editor.getHTML();

    try {
      if (existingNote) {
        updateNote({
          id: existingNote.id,
          note: {
            title,
            content,
            updatedAt: new Date().toISOString(),
          },
        });
        toast.success("Note updated successfully");
      } else {
        addNote({
          title,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          isPrivate: false,
          user_id: user.id,
        });
        setTitle("");
        editor.commands.clearContent();
        toast.success("Note created successfully");
      }

      if (onSave) onSave();
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note");
    }
  };

  // Function to check if the buttons should be highlighted (active)
  const isActive = (type: string, attrs = {}): boolean => {
    if (!editor) return false;
    return editor.isActive(type, attrs);
  };

  // Improved formatters that directly use the editor instance
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleBulletList = () =>
    editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () =>
    editor?.chain().focus().toggleOrderedList().run();
  const toggleHeading1 = () =>
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleHeading2 = () =>
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleCode = () => editor?.chain().focus().toggleCode().run();
  const toggleBlockquote = () =>
    editor?.chain().focus().toggleBlockquote().run();

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-xl font-medium"
      />

      <div className="border rounded-md">
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/40">
          <Button
            variant={isActive("bold") ? "default" : "ghost"}
            size="sm"
            onClick={toggleBold}
            disabled={!editor?.can().chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive("italic") ? "default" : "ghost"}
            size="sm"
            onClick={toggleItalic}
            disabled={!editor?.can().chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive("bulletList") ? "default" : "ghost"}
            size="sm"
            onClick={toggleBulletList}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive("orderedList") ? "default" : "ghost"}
            size="sm"
            onClick={toggleOrderedList}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive("heading", { level: 1 }) ? "default" : "ghost"}
            size="sm"
            onClick={toggleHeading1}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive("heading", { level: 2 }) ? "default" : "ghost"}
            size="sm"
            onClick={toggleHeading2}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive("code") ? "default" : "ghost"}
            size="sm"
            onClick={toggleCode}
            disabled={!editor?.can().chain().focus().toggleCode().run()}
            title="Code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive("blockquote") ? "default" : "ghost"}
            size="sm"
            onClick={toggleBlockquote}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {editor && (
          <div className="prose-container">
            <EditorContent editor={editor} className="min-h-[300px]" />
          </div>
        )}
      </div>
      {!hasEnoughContent && (
        <div className="text-sm text-red-500 mt-2 align-center">
          Please add more content to your note for summary (minimum 200
          characters needed).
        </div>
      )}
      <div className="flex justify-end mt-2">
        <Button
          onClick={(e) =>
            handleSummarize(
              existingNote?.id ?? null,
              editor?.getHTML() || existingNote?.content || "",
              e
            )
          }
          className="flex gap-2 mr-4"
          title={
            !hasEnoughContent
              ? "Content is too short to summarize (minimum 200 characters needed)"
              : "Summarize Note"
          }
          disabled={isSummarizing || !hasEnoughContent || !editor?.getHTML()}
        >
          {isSummarizing ? (
            <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-white"></div>
          ) : (
            "Summarize with AI"
          )}
        </Button>
        <Button onClick={handleSave} className="flex gap-2">
          <Save className="h-4 w-4" />
          {existingNote ? "Update Note" : "Save Note"}
        </Button>
      </div>

      {/* Floating Summary Drawer */}
      {showSummaryDrawer && tempSummary && (
        <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
            <h3 className="font-medium">AI Summary</h3>
            <Button variant="ghost" size="sm" onClick={closeSummaryDrawer}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {formattedSummary ? (
              <div
                className="prose prose-sm dark:prose-invert mb-4"
                dangerouslySetInnerHTML={{ __html: formattedSummary }}
              />
            ) : (
              <div className="whitespace-pre-wrap mb-4">{tempSummary}</div>
            )}
            <Button
              onClick={handleCopySummary}
              variant="outline"
              className="w-full flex gap-2 justify-center"
            >
              <Copy className="h-4 w-4" />
              Copy Summary
            </Button>
          </div>
          <div className="p-2 text-xs text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
            This summary will disappear when you close this page
          </div>
        </div>
      )}
    </div>
  );
};

// Make the setMarkdownContent and markdownToHTML functions available for other components
export { NoteEditor as default, markdownToHTML };
