import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }: any) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }: any) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check the session
  const { data: { user } } = await supabase.auth.getUser();
  const isGuest = request.cookies.get("ignatius_guest_session")?.value === "true";

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth/callback');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  if (!user && !isGuest && !isAuthPage && !isApiRoute) {
    // If not logged in and not guest, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Guard: Guest cannot access sensitive admin routes
  if (isGuest && !user) {
    const restrictedForGuest = [
      '/usermanagement',
      '/dataumat',
      '/dansospar/spb/inbox',
      '/dansospar/spb/rutin',
      '/dansospar/keuangan',
    ];
    if (restrictedForGuest.some(path => request.nextUrl.pathname.startsWith(path))) {
      const url = request.nextUrl.clone();
      url.pathname = '/dansospar';
      return NextResponse.redirect(url);
    }
  }

  if ((user || isGuest) && isAuthPage) {
    // If logged in or guest and on login page, redirect to home
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
