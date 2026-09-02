export function MetricCard({ label, value, note, tone = "default" }: { label: string; value: string; note?: string; tone?: "default" | "good" | "warn" }) {
  return <article className="panel p-4"><p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</p><p className={`mt-2 text-2xl font-black ${tone === "good" ? "text-moss dark:text-lime" : tone === "warn" ? "text-clay" : ""}`}>{value}</p>{note && <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>}</article>;
}
