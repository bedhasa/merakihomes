import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-[#F7F8FA] px-5 text-center">
        <main className="max-w-md">
          <h1 className="text-2xl font-semibold text-[#102A43]">Page not found</h1>
          <p className="mt-2 text-sm text-slate-600">The page you requested is unavailable.</p>
          <Link href="/" className="mt-5 inline-block text-[#102A43] underline">
            Return home
          </Link>
        </main>
      </body>
    </html>
  );
}
