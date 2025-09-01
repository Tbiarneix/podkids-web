import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isFiveDigits(pin: unknown): pin is string {
  return typeof pin === "string" && /^\d{5}$/.test(pin);
}

export async function GET() {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("pin")
    .select("id")
    .eq("user_id", userData.user.id)
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ exists: !!(data && data.length > 0) });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const pin = (body as any)?.pin;
  const currentPin = (body as any)?.currentPin;
  if (!isFiveDigits(pin)) {
    return NextResponse.json({ error: "invalid_pin" }, { status: 400 });
  }

  const { data: rows, error: selErr } = await supabase
    .from("pin")
    .select("id, created_at, pin_code")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }

  if (rows && rows.length > 0) {
    if (!isFiveDigits(currentPin ?? "")) {
      return NextResponse.json({ error: "current_pin_required" }, { status: 400 });
    }
    const stored = rows[0].pin_code;
    if (Number(currentPin) !== Number(stored)) {
      return NextResponse.json({ error: "invalid_current_pin" }, { status: 403 });
    }
    const targetId = rows[0].id;
    const { error: updErr } = await supabase
      .from("pin")
      .update({ pin_code: Number(pin) })
      .eq("id", targetId);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }
  } else {
    const { error: insErr } = await supabase.from("pin").insert({
      user_id: userData.user.id,
      pin_code: Number(pin),
    });
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
