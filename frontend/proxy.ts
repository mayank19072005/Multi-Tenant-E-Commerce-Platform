import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Redirects to HTTPS if not already on HTTPS
export function proxy(request: NextRequest) {
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto');

  if (process.env.NODE_ENV === 'production' && protocol !== 'https' && host?.includes('vercel.app')) {
    return NextResponse.redirect(`https://${host}`);
  }

  return NextResponse.next();
} 