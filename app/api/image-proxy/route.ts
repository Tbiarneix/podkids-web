import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Basic list of disallowed hostnames to reduce SSRF risk
const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
]);

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

    // Ne pas bloquer l'affichage sur l'état de la base.
    // On essayera d'upserter le host APRÈS avoir validé que le contenu est bien une image.

    // Fetch the image (with timeout) and validate content-type
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let upstream: Response;
    try {
      upstream = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: {
          // pass through minimal headers
          "User-Agent": "Podkids-ImageProxy/1.0",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
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

    // Option A: Pas d'allowlist en base. Rien à faire ici.

    const cacheControl = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType!,
        "Cache-Control": cacheControl,
      },
    });
  } catch (e: any) {
    // En cas d'erreur, retourner une image de fallback pour éviter les erreurs Next/Image
    return fallbackImage();
  }
}

async function fallbackImage() {
  try {
    const filePath = path.join(process.cwd(), "public", "images", "Logo.webp");
    const data = await readFile(filePath);
    return new Response(data, {
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
