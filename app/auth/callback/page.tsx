"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Handle OAuth callback and exchange code for session
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error during auth callback:", error);
        router.push("/auth/login?error=Authentication%20failed");
      } else {
        // Successful authentication
        router.push("/");
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Finishing authentication...</p>
    </div>
  );
}
