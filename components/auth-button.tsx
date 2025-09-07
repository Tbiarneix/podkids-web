import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { Play } from "lucide-react";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      <Button size="lg" asChild>
            <Link href="/api/pin/clear" className="inline-flex items-center gap-2 w-full lg:w-auto">
              <Play className="size-5" aria-hidden />
              <span>Accéder au player web</span>
            </Link>
          </Button>
      <LogoutButton/>
    </div>
  ) : (
    <div className="flex flex-col lg:flex-row items-center gap-2">
      <Button asChild size="xl" variant={"outline"} className="w-full lg:w-auto">
        <Link href="/auth/login">Se connecter</Link>
      </Button>
      <Button asChild size="xl" variant={"default"} className="w-full lg:w-auto">
        <Link href="/auth/sign-up">S&apos;inscrire</Link>
      </Button>
    </div>
  );
}
