'use client';

/**
 * Last-resort boundary for errors in the locale layout itself. It renders outside the translation
 * provider (the locale is unknown here), so it shows English and Amharic together. Page errors are
 * handled by the translated app/[locale]/error.tsx.
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F8FA] px-5 text-center dark:bg-slate-900">
      <section className="max-w-lg rounded-md border border-slate-200 bg-white p-7 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-xl font-semibold text-[#102A43] dark:text-white">
          This page could not be loaded
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your booking and account records are not affected. Please try again.
        </p>
        <div lang="am">
          <h2 className="mt-5 text-lg font-semibold text-[#102A43] dark:text-white">ይህ ገጽ ሊጫን አልቻለም</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            የቦታ ማስያዝ እና የመለያ መዝገቦችዎ አልተነኩም። እባክዎ እንደገና ይሞክሩ።
          </p>
        </div>
        <button className="meraki-button mt-5" onClick={reset}>
          Try again · <span lang="am">እንደገና ይሞክሩ</span>
        </button>
      </section>
    </main>
  );
}
