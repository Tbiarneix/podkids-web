import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { AgeRange, Category } from "@/types/podcast";
import { hydratePodcast } from "@/lib/rss/hydrate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rssUrl: string | undefined = body?.rssUrl;
    const ageRanges: string[] | undefined = body?.ageRanges;
    const categories: string[] | undefined = body?.categories;

    if (!rssUrl || typeof rssUrl !== "string") {
      return NextResponse.json({ error: "invalid_url" }, { status: 400 });
    }
    const url = rssUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "url_must_be_http_or_https" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const supabaseServer = await createServerSupabase();

    const {
      data: { user },
      error: userErr,
    } = await supabaseServer.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Normalize incoming UI enums to DB enum codes
    const AGE_RANGE_CODE_MAP: Record<string, string> = {
      [AgeRange.UNDER_3]: "UNDER_3",
      [AgeRange.BETWEEN_4_AND_6]: "BETWEEN_4_AND_6",
      [AgeRange.BETWEEN_7_AND_9]: "BETWEEN_7_AND_9",
      [AgeRange.BETWEEN_10_AND_12]: "BETWEEN_10_AND_12",
      [AgeRange.BETWEEN_13_AND_15]: "BETWEEN_13_AND_15",
      [AgeRange.OVER_15]: "OVER_15",
    };

    const CATEGORY_CODE_MAP: Record<string, string> = Object.fromEntries(
      Object.entries(Category).map(([key, value]) => [String(value), key])
    );

    const dbAgeRanges: string[] = Array.isArray(ageRanges)
      ? ageRanges.map((v) => AGE_RANGE_CODE_MAP[v] ?? v).filter(Boolean)
      : [];

    const dbCategories: string[] = Array.isArray(categories)
      ? categories.map((v) => CATEGORY_CODE_MAP[v] ?? v).filter(Boolean)
      : [];

    // 1) Find or create podcast by URL (table name: public.podcast)
    const { data: existingList, error: findErr } = await supabaseAdmin
      .from("podcast")
      .select("id, public")
      .eq("url", url)
      .limit(1);
    if (findErr) {
      return NextResponse.json({ error: findErr.message }, { status: 500 });
    }

    let podcastId: number | null = null;
    let isPublic = false;

    if (existingList && existingList.length > 0) {
      podcastId = existingList[0].id;
      isPublic = !!existingList[0].public;
    } else {
      // Create private podcast shell (name/author/cover/description can be filled later by RSS fetcher)
      const { data: created, error: insertErr } = await supabaseAdmin
        .from("podcast")
        .insert({
          url,
          age_range: dbAgeRanges,
          categories: dbCategories,
          public: false,
        })
        .select("id")
        .single();
      if (insertErr) {
        // If unique constraint on URL triggers, fetch again
        if ((insertErr as any).code === "23505") {
          const { data: retryList, error: retryErr } = await supabaseAdmin
            .from("podcast")
            .select("id, public")
            .eq("url", url)
            .limit(1);
          if (retryErr || !retryList || retryList.length === 0) {
            return NextResponse.json({ error: retryErr?.message || "conflict_but_not_found" }, { status: 500 });
          }
          podcastId = retryList[0].id;
          isPublic = !!retryList[0].public;
        } else {
          return NextResponse.json({ error: insertErr.message }, { status: 500 });
        }
      } else {
        podcastId = created!.id as unknown as number;
        isPublic = false;
      }
    }

    if (!podcastId) {
      return NextResponse.json({ error: "podcast_id_missing" }, { status: 500 });
    }

    // 2) If not public, ensure private link exists for the user (without relying on DB unique constraint)
    if (!isPublic) {
      const { data: linkExistsList, error: linkFindErr } = await supabaseAdmin
        .from("private_podcast")
        .select("id")
        .eq("podcast_id", podcastId)
        .eq("user_id", user.id)
        .limit(1);
      if (linkFindErr) {
        return NextResponse.json({ error: linkFindErr.message }, { status: 500 });
      }
      const linkExists = Array.isArray(linkExistsList) && linkExistsList.length > 0;
      if (!linkExists) {
        const { error: linkInsertErr } = await supabaseAdmin
          .from("private_podcast")
          .insert({ podcast_id: podcastId, user_id: user.id });
        if (linkInsertErr) {
          return NextResponse.json({ error: linkInsertErr.message }, { status: 500 });
        }
      }
    }

    // Fire-and-forget hydration (do not await)
    try {
      // run outside the request lifecycle
      void hydratePodcast(podcastId).catch((e) => {
        console.error("hydratePodcast error", e);
      });
    } catch (e) {
      // swallow scheduling errors to avoid impacting client response
      console.error("hydratePodcast schedule failed", e);
    }

    return NextResponse.json({ ok: true, podcastId, isPublic });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const podcastId: number | undefined = body?.podcastId;
    if (!podcastId || Number.isNaN(Number(podcastId))) {
      return NextResponse.json({ error: "invalid_podcast_id" }, { status: 400 });
    }

    const supabaseServer = await createServerSupabase();
    const {
      data: { user },
      error: userErr,
    } = await supabaseServer.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { error: delErr } = await supabaseAdmin
      .from("private_podcast")
      .delete()
      .eq("podcast_id", podcastId)
      .eq("user_id", user.id);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 });
  }
}
