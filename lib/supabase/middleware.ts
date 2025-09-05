import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";

    // IMPORTANT: Preserve cookies set by Supabase during this middleware execution.
    const redirectResponse = NextResponse.redirect(url);
    const supaCookies = supabaseResponse.cookies.getAll();
    for (const c of supaCookies) {
      redirectResponse.cookies.set(c);
    }
    return redirectResponse;
  }

  const path = request.nextUrl.pathname;
  if (
    path.startsWith("/protected") &&
    !path.startsWith("/auth/pin") &&
    !path.startsWith("/protected/pin")
  ) {
    const hasPinCookie = request.cookies.get("pk_pin_ok");
    if (!hasPinCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/pin";
      url.searchParams.set("redirect", request.nextUrl.pathname + (request.nextUrl.search || ""));

      // IMPORTANT: Preserve cookies set by Supabase during this middleware execution.
      const redirectResponse = NextResponse.redirect(url);
      const supaCookies = supabaseResponse.cookies.getAll();
      for (const c of supaCookies) {
        redirectResponse.cookies.set(c);
      }
      return redirectResponse;
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
