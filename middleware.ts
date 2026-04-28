// middleware.ts
// Protege rutas privadas. Refresca la sesión de Supabase en cada request.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const PROTECTED = ["/home", "/units", "/lesson", "/exercise", "/victory", "/level-up",
                   "/profile", "/shop", "/league", "/achievements", "/parental", "/settings"];
const AUTH_PAGES = ["/auth/login", "/auth/signup", "/auth/forgot"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // No logueado intentando ir a ruta protegida → login
  if (!user && PROTECTED.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Ya logueado yendo a login/signup → home
  if (user && AUTH_PAGES.includes(path)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
