import { NextRequest, NextResponse } from "next/server";

function bad(message: string, status = 400) {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("src");
    if (!url) return bad("missing_src");
    let target: URL;
    try {
      target = new URL(url);
    } catch {
      return bad("invalid_url");
    }
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return bad("unsupported_protocol");
    }

    const range = req.headers.get("range");
    const headers: HeadersInit = {};
    if (range) headers["Range"] = range;
    headers["User-Agent"] = headers["User-Agent"] || "Podkids/1.0 (+https://podkids.app)";
    headers["Accept"] = "*/*";

    const upstream = await fetch(target.toString(), {
      method: "GET",
      headers,
      redirect: "follow",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse(null, { status: upstream.status });
    }

    const resHeaders = new Headers();
    const copy = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "cache-control",
      "etag",
      "last-modified",
    ];
    for (const key of copy) {
      const v = upstream.headers.get(key);
      if (v) resHeaders.set(key, v);
    }

    if (!resHeaders.has("accept-ranges")) resHeaders.set("accept-ranges", "bytes");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch {
    return bad("proxy_error", 502);
  }
}
