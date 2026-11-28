import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Exclude API proxy, Next internals, and static files. Keep unprefixed paths for as-needed.
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
