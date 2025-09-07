"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button
      onClick={logout}
      size="lg"
      variant="outline"
      className="inline-flex w-full items-center gap-2 rounded-full max-[768px]:h-10 max-[768px]:w-10 max-[768px]:justify-center max-[768px]:gap-0 max-[768px]:border-0 max-[768px]:bg-primary max-[768px]:p-0 max-[768px]:text-primary-foreground max-[768px]:shadow max-[768px]:hover:bg-primary/90 lg:w-auto"
    >
      <LogOut className="size-5 max-[768px]:size-5" aria-hidden />
      <span className="max-[768px]:sr-only">Se deconnecter</span>
    </Button>
  );
}
