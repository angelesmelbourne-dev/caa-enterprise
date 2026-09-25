import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/vehicles/:path*",
    "/job-orders/:path*",
    "/reports/:path*",
    "/users/:path*",
  ],
};