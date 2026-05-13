import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  // First update the session
  const response = await updateSession(request)
  
  const { pathname } = request.nextUrl

  // Allow auth routes and static files
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return response
  }

  // Create supabase client to check auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Get user profile for role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role || "trainer"

  // Role-based access control
  // Trainers can only access /alumnos
  if (role === "trainer") {
    const allowedPaths = ["/alumnos"]
    const isAllowed = allowedPaths.some(p => pathname === p || pathname.startsWith(p + "/"))
    
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/alumnos", request.url))
    }
  }

  // Admin-only routes
  const adminOnlyPaths = ["/configuracion", "/usuarios"]
  const isAdminRoute = adminOnlyPaths.some(p => pathname === p || pathname.startsWith(p + "/"))
  
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/alumnos", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
