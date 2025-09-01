import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isFiveDigits(pin: unknown): pin is string {
  return typeof pin === "string" && /^\d{5}$/.test(pin);
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

  const pin = body?.pin;
  if (!isFiveDigits(pin)) {
    return NextResponse.json({ error: "invalid_pin" }, { status: 400 });
  }

  const { data: rows, error } = await supabase
    .from("pin")
    .select("id, pin_code, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "not_set" }, { status: 404 });
  }

  const stored = rows[0].pin_code;
  if (Number(pin) !== Number(stored)) {
    return NextResponse.json({ error: "wrong_pin" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
