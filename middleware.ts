import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/hot(.*)', // Trending API should be public
    '/api/webhooks/(.*)', // Webhooks must bypass Clerk auth
    '/track/(.*)'   // Track details should be public
]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        // Optionally protect other routes
        // await auth().protect(); 
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
