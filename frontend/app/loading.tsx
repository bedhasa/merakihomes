/** Shown before the locale layout resolves, so it is bilingual. */
export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F8FA] text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-200" role="status">
      <span>Loading Meraki Homes… · <span lang="am">Meraki Homes በመጫን ላይ…</span></span>
    </main>
  );
}
