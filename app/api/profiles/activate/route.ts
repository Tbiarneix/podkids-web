import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FRONT_TO_DB_AGE: Record<string, string> = {
  "under 3": "UNDER_3",
  "between 4 and 6": "BETWEEN_4_AND_6",
  "between 7 and 9": "BETWEEN_7_AND_9",
  "between 10 and 12": "BETWEEN_10_AND_12",
  "between 13 and 15": "BETWEEN_13_AND_15",
  "over 15": "OVER_15",
};

const DB_TO_FRONT_AGE: Record<string, string> = Object.fromEntries(
  Object.entries(FRONT_TO_DB_AGE).map(([front, db]) => [db, front]),
);

function mapDbToFront(row: any) {
  return {
    id: row.id != null ? String(row.id) : undefined,
    name: row.name,
    avatar: row.avatar != null ? Number(row.avatar) : undefined,
    ageRanges: Array.isArray(row.age_range)
      ? row.age_range.map((v: string) => DB_TO_FRONT_AGE[v] ?? v)
      : [],
    activeProfile: row.active_profile ?? false,
    createdAt: row.created_at ? Date.parse(row.created_at as string) : Date.now(),
    updatedAt: row.updated_at ? Date.parse(row.updated_at as string) : Date.now(),
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const id = body?.id;
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const { error: resetErr } = await supabase
    .from("profile")
    .update({ active_profile: false })
    .eq("user_id", userData.user.id);
  if (resetErr) {
    return NextResponse.json({ error: resetErr.message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("profile")
    .update({ active_profile: true })
    .eq("id", Number(id))
    .eq("user_id", userData.user.id)
    .select("id, name, avatar, age_range, active_profile, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: mapDbToFront(data) });
}
