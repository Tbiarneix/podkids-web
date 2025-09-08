import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AccountSettingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <h1 className="text-3xl font-bold">Paramètres du compte</h1>
      <p className="text-muted-foreground">Gérez vos informations personnelles.</p>
    </div>
  );
}
