import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Placeholder for auth check
    // In a real app, we would check for a session cookie/token
    const isAuthenticated = false; // Simulation

    if (pathname.startsWith('/app') && !isAuthenticated) {
        // For now, we allow access in the demo, but this is where the protection would be
        // return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/app/:path*'],
};
