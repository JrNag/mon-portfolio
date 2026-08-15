export default function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string
  value: string | number
  hint?: string
  accent?: boolean
}) {
  return (
    <div className="card p-5">
      <span className="eyebrow">{label}</span>
      <p
        className={`font-[family-name:var(--font-display)] text-3xl font-semibold mt-2 ${
          accent ? 'text-[var(--accent)]' : ''
        }`}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-[var(--ink-faint)] mt-1.5">{hint}</p>}
    </div>
  )
}