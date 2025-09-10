import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

const PostSchema = z.object({
  episodeId: z.number().int().positive(),
  status: z.enum(["unlistened", "listening", "listened"]).optional(),
  progress: z.number().int().min(0).optional(),
});

type DbStatus = "UNLISTENED" | "LISTENING" | "LISTENED";

const toDbStatus = (s: string): DbStatus => {
  switch (s) {
    case "unlistened":
      return "UNLISTENED";
    case "listening":
      return "LISTENING";
    case "listened":
      return "LISTENED";
    default:
      return "UNLISTENED";
  }
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const podcastId = Number(searchParams.get("podcastId"));
    if (!podcastId || Number.isNaN(podcastId)) {
      return NextResponse.json({ error: "Missing or invalid podcastId" }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profile")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 403 });

    const { data: episodes, error: epsErr } = await supabase
      .from("episode")
      .select("id")
      .eq("podcast_id", podcastId);
    if (epsErr) return NextResponse.json({ error: epsErr.message }, { status: 500 });
    const episodeIds = (episodes ?? []).map((e: any) => e.id);
    if (episodeIds.length === 0) return NextResponse.json({ items: [] });

    const { data: statuses, error: stErr } = await supabase
      .from("episode_status")
      .select("episode_id, status, progress, last_update")
      .eq("profile_id", profile.id)
      .in("episode_id", episodeIds);
    if (stErr) return NextResponse.json({ error: stErr.message }, { status: 500 });

    return NextResponse.json({ items: statuses ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profile")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 403 });

    const json = await req.json().catch(() => ({}));
    const parsed = PostSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { episodeId, status, progress } = parsed.data;

    const payload: Record<string, any> = {
      profile_id: profile.id,
      episode_id: episodeId,
    };
    if (typeof status === "string") payload.status = toDbStatus(status);
    if (typeof progress === "number") payload.progress = progress;

    const { data, error } = await supabase
      .from("episode_status")
      .upsert(payload, { onConflict: "profile_id,episode_id" })
      .select("episode_id, status, progress, last_update")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ item: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
