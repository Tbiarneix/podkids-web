import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const profileIdRaw = body?.profileId;
    const podcastIdRaw = body?.podcastId;

    if (profileIdRaw == null || podcastIdRaw == null) {
      return NextResponse.json({ error: "missing_params" }, { status: 400 });
    }

    const profile_id = Number(profileIdRaw);
    const podcast_id = Number(podcastIdRaw);

    if (Number.isNaN(profile_id) || Number.isNaN(podcast_id)) {
      return NextResponse.json({ error: "invalid_ids" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { error: upsertErr } = await supabase
      .from("podcast_subscriptions")
      .upsert({ profile_id, podcast_id }, { onConflict: "profile_id,podcast_id", ignoreDuplicates: true });

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const profileIdRaw = body?.profileId;
    const podcastIdRaw = body?.podcastId;

    if (profileIdRaw == null || podcastIdRaw == null) {
      return NextResponse.json({ error: "missing_params" }, { status: 400 });
    }

    const profile_id = Number(profileIdRaw);
    const podcast_id = Number(podcastIdRaw);

    if (Number.isNaN(profile_id) || Number.isNaN(podcast_id)) {
      return NextResponse.json({ error: "invalid_ids" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { error: delErr } = await supabase
      .from("podcast_subscriptions")
      .delete()
      .eq("profile_id", profile_id)
      .eq("podcast_id", podcast_id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 });
  }
}
