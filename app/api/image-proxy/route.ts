import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const src = searchParams.get("src");
    if (!src) return fallbackImage();

    let parsed: URL;
    try {
      parsed = new URL(src);
    } catch {
      return fallbackImage();
    }

    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== "http:" && protocol !== "https:") return fallbackImage();

    const hostname = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTS.has(hostname)) return fallbackImage();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let upstream: Response;
    try {
      upstream = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "Podkids-ImageProxy/1.0",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    const contentType = upstream.headers.get("content-type");
    const isImage = !!contentType && contentType.toLowerCase().startsWith("image/");
    if (!upstream.ok || !upstream.body || !isImage) {
      return fallbackImage();
    }

    const cacheControl = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType!,
        "Cache-Control": cacheControl,
      },
    });
  } catch (e: any) {
    console.error(e);
    return fallbackImage();
  }
}

async function fallbackImage() {
  try {
    const filePath = path.join(process.cwd(), "public", "images", "Logo.webp");
    const data = await readFile(filePath);
    const body = new Uint8Array(data);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response(null, { status: 204 });
  }
}
