import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import '../src/index.css';
import { ThemeProvider } from '../src/contexts/ThemeContext';

export const metadata: Metadata = {
  title: {
    default: 'Meraki Homes | Home Services, Made Easy',
    template: '%s | Meraki Homes',
  },
  description: 'Trusted home cleaning, cooking, childcare, repairs, and household services in Addis Ababa.',
  applicationName: 'Meraki Homes',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
