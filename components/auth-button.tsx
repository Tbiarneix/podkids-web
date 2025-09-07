import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { Play, LogIn, UserPlus } from "lucide-react";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4 max-[768px]:gap-2">
      <Button
        size="lg"
        asChild
        variant="outline"
        className="inline-flex items-center gap-2 rounded-full max-[768px]:h-10 max-[768px]:w-10 max-[768px]:justify-center max-[768px]:border-0 max-[768px]:bg-primary max-[768px]:p-0 max-[768px]:text-primary-foreground max-[768px]:shadow max-[768px]:hover:bg-primary/90"
      >
        <Link href="/api/pin/clear" className="inline-flex w-full items-center gap-2 lg:w-auto">
          <Play className="size-5 max-[768px]:size-5" aria-hidden />
          <span className="max-[768px]:sr-only">Accéder au player web</span>
        </Link>
      </Button>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center gap-2 max-[768px]:gap-2">
      <Button
        asChild
        size="xl"
        variant={"outline"}
        className="w-full rounded-full max-[768px]:h-10 max-[768px]:w-10 max-[768px]:justify-center max-[768px]:border-0 max-[768px]:bg-primary max-[768px]:p-0 max-[768px]:text-primary-foreground max-[768px]:shadow max-[768px]:hover:bg-primary/90 lg:w-auto"
      >
        <Link href="/auth/login" className="inline-flex items-center gap-2">
          <LogIn className="size-5 max-[768px]:size-5" aria-hidden />
          <span className="max-[768px]:sr-only">Se connecter</span>
        </Link>
      </Button>
      <Button
        asChild
        size="xl"
        variant={"outline"}
        className="w-full rounded-full max-[768px]:h-10 max-[768px]:w-10 max-[768px]:justify-center max-[768px]:border-0 max-[768px]:bg-primary max-[768px]:p-0 max-[768px]:text-primary-foreground max-[768px]:shadow max-[768px]:hover:bg-primary/90 lg:w-auto"
      >
        <Link href="/auth/sign-up" className="inline-flex items-center gap-2">
          <UserPlus className="size-5 max-[768px]:size-5" aria-hidden />
          <span className="max-[768px]:sr-only">S&apos;inscrire</span>
        </Link>
      </Button>
    </div>
  );
}
