import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Pick the active profile if any, otherwise the oldest
    const { data: profiles, error: profErr } = await supabase
      .from("profile")
      .select("id, active_profile, created_at")
      .eq("user_id", user.id)
      .order("active_profile", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1);
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
    const profile = Array.isArray(profiles) ? profiles[0] : null;
    if (!profile) return NextResponse.json({ items: [] }, { status: 200 });

    const { data: recents, error: stErr } = await supabase
      .from("episode_status")
      .select("episode_id, last_update")
      .eq("profile_id", profile.id)
      .eq("status", "LISTENING")
      .order("last_update", { ascending: false })
      .limit(5);
    if (stErr) return NextResponse.json({ error: stErr.message }, { status: 500 });

    const episodeIds = (recents ?? []).map((r: any) => r.episode_id);
    if (episodeIds.length === 0) return NextResponse.json({ items: [] });

    const { data: episodes, error: epErr } = await supabase
      .from("episode")
      .select("id, name, cover, url, duration, podcast:podcast_id ( id, name, cover_url )")
      .in("id", episodeIds);
    if (epErr) return NextResponse.json({ error: epErr.message }, { status: 500 });

    const byId = new Map<number, any>();
    for (const ep of episodes ?? []) byId.set(Number(ep.id), ep);

    const items = (recents ?? [])
      .map((r: any) => {
        const ep = byId.get(Number(r.episode_id));
        if (!ep) return null;
        return {
          id: Number(ep.id),
          episode_name: ep.name as string,
          episode_cover: ep.cover as string | null,
          episode_url: ep.url as string,
          duration: ep.duration as number | null,
          podcast_id: Number(ep.podcast?.id ?? 0) || null,
          podcast_name: (ep.podcast?.name as string) ?? null,
          podcast_cover: (ep.podcast?.cover_url as string) ?? null,
          last_update: r.last_update as string,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
