import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function PodcastsManagementPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Gérer les podcasts</h1>
      <p className="text-muted-foreground">Ajoutez, organisez et gérez vos podcasts et abonnements.</p>
    </div>
  );
}
