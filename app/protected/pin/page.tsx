import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function PinSettingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Code PIN</h1>
      <p className="text-muted-foreground">Ajoutez ou modifiez votre code PIN pour sécuriser l’accès.</p>
    </div>
  );
}
