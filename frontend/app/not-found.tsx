import Link from 'next/link';

/** Global 404 (no negotiated locale), so it shows English and Amharic together. */
export default function NotFound() {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-[#F7F8FA] px-5 text-center">
        <main className="max-w-md">
          <h1 className="text-2xl font-semibold text-[#102A43]">Page not found</h1>
          <p className="mt-2 text-sm text-slate-600">The page you requested is unavailable.</p>
          <div lang="am">
            <h2 className="mt-5 text-xl font-semibold text-[#102A43]">ገጹ አልተገኘም</h2>
            <p className="mt-2 text-sm text-slate-600">የጠየቁት ገጽ አይገኝም።</p>
          </div>
          <Link href="/" className="mt-5 inline-block text-[#102A43] underline">
            Return home · <span lang="am">ወደ መነሻ ገጽ ይመለሱ</span>
          </Link>
        </main>
      </body>
    </html>
  );
}
