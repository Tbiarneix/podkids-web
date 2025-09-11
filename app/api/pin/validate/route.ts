import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function isFiveDigits(pin: unknown): pin is string {
  return typeof pin === "string" && /^\d{5}$/.test(pin);
}

export async function POST(req: Request) {
  const MAX_ATTEMPTS = 3;
  const BLOCK_MS = 60_000;
  const COOKIE_KEY = "pk_pin_block";

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

  const jar = await cookies();
  let attempts = 0;
  let until: number | null = null;
  try {
    const raw = jar.get(COOKIE_KEY)?.value;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        attempts = Number(parsed.attempts) || 0;
        until = typeof parsed.until === "number" ? parsed.until : null;
      }
    }
  } catch {}

  if (until && until > Date.now()) {
    const res = NextResponse.json({ error: "too_many_attempts", retryAt: until }, { status: 429 });
    const maxAge = Math.max(1, Math.ceil((until - Date.now()) / 1000));
    res.cookies.set(COOKIE_KEY, JSON.stringify({ attempts, until }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return res;
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
    const nextAttempts = attempts + 1;
    if (nextAttempts >= MAX_ATTEMPTS) {
      const blockUntil = Date.now() + BLOCK_MS;
      const res = NextResponse.json(
        { error: "too_many_attempts", retryAt: blockUntil },
        { status: 429 },
      );
      res.cookies.set(COOKIE_KEY, JSON.stringify({ attempts: 0, until: blockUntil }), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: Math.ceil(BLOCK_MS / 1000),
      });
      return res;
    }
    const res = NextResponse.json({ error: "wrong_pin" }, { status: 403 });
    res.cookies.set(COOKIE_KEY, JSON.stringify({ attempts: nextAttempts, until: null }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
    return res;
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("pk_pin_ok", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/protected",
    maxAge: 5 * 60,
  });
  res.cookies.delete(COOKIE_KEY);
  return res;
}
