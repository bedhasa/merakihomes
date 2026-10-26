'use client';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F8FA] px-5 text-center">
      <section className="max-w-lg rounded-md border border-slate-200 bg-white p-7">
        <h1 className="text-xl font-semibold text-[#102A43]">This page could not be loaded</h1>
        <p className="mt-2 text-sm text-slate-600">Your booking and account records are not affected. Please try again.</p>
        <button className="meraki-button mt-5" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
