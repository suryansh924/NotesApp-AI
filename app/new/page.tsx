"use client";

import NoteEditor from "@/components/NoteEditor";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NewNotePage() {
  const router = useRouter();

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
          <h1 className="text-3xl font-bold">Create New Note</h1>
        </div>

        <NoteEditor onSave={handleSave} />
      </div>
    </ProtectedRoute>
  );
}
