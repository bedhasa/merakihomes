import type { ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';
import '../src/index.css';

/**
 * Passthrough root layout. `<html lang>` lives in `app/[locale]/layout.tsx`
 * so `/_not-found` can render without a negotiated locale.
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
