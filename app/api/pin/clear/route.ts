import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL("/webplayer", request.url);
  const res = NextResponse.redirect(url);
  // Clear the PIN session cookie (must match the original path)
  res.cookies.set("pk_pin_ok", "", {
    path: "/protected",
    maxAge: 0,
  });
  return res;
}
