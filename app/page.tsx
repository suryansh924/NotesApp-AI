"use client";

import { Button } from "@/components/ui/button";
import { Plus, Settings, LogOut, User } from "lucide-react";
import NotesList from "@/components/NotesList";
import FloatingAIButton from "@/components/FloatingAIButton";
import Link from "next/link";
import { Toaster } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 max-w-7xl">
        <Toaster position="top-right" />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notes</h1>
            <p className="text-muted-foreground">
              All your thoughts in one place
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/new">
                <Plus className="h-5 w-5 mr-2" /> New Note
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <NotesList />
        <FloatingAIButton />
      </div>
    </ProtectedRoute>
  );
}
