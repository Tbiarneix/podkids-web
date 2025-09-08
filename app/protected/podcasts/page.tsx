import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import PodcastsManager from "@/components/protected/PodcastsManager";
import PodcastsList from "@/components/protected/PodcastsList";

export default async function PodcastsManagementPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: podcasts } = await supabase
    .from("podcast")
    .select("id,name,author,description,cover_url,categories,public,episodes_count")
    .order("name", { ascending: true });

  const privateIds: number[] = [];
  if (user) {
    const { data: links } = await supabase
      .from("private_podcast")
      .select("podcast_id")
      .eq("user_id", user.id);
    if (Array.isArray(links)) {
      for (const l of links) if (l?.podcast_id != null) privateIds.push(l.podcast_id as number);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <h1 className="text-3xl font-bold">Gérer les podcasts</h1>
      <p className="text-muted-foreground">
        Ajoutez, organisez et gérez vos podcasts et abonnements.
      </p>
      <PodcastsManager />
      <PodcastsList podcasts={podcasts ?? []} privateIds={privateIds} />
    </div>
  );
}
