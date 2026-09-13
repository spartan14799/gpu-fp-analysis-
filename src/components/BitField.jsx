/**
 * Visual reutilizable de los 3 campos de un float32: signo · exponente · mantisa.
 * Se usa tanto en el inspector interactivo como en la barra de navegación.
 */
const FIELDS = [
  { key: "sign", label: "S", bits: 1, color: "var(--color-sign)" },
  { key: "exponent", label: "E", bits: 8, color: "var(--color-exp)" },
  { key: "mantissa", label: "M", bits: 23, color: "var(--color-mant)" },
];

export default function BitField({ values, size = "md", showLabels = true }) {
  const dims = {
    sm: { h: "h-3", text: "text-[10px]" },
    md: { h: "h-8 sm:h-10", text: "text-xs sm:text-sm" },
  }[size];

  return (
    <div className="w-full">
      <div className={`flex w-full overflow-hidden rounded-sm border border-line ${dims.h}`}>
        {FIELDS.map((f) => (
          <div
            key={f.key}
            className="flex items-center justify-center font-mono font-medium text-bg"
            style={{
              width: `${(f.bits / 32) * 100}%`,
              backgroundColor: f.color,
            }}
            title={`${f.label} · ${f.bits} bit${f.bits > 1 ? "s" : ""}`}
          >
            <span className={`truncate px-1 ${dims.text}`}>
              {values ? values[f.key] : f.label}
            </span>
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="mt-1.5 flex w-full font-mono text-[10px] text-ink-faint">
          <span style={{ width: `${(1 / 32) * 100}%` }} className="truncate">
            S·1
          </span>
          <span style={{ width: `${(8 / 32) * 100}%` }} className="truncate">
            E·8
          </span>
          <span style={{ width: `${(23 / 32) * 100}%` }} className="truncate">
            M·23
          </span>
        </div>
      )}
    </div>
  );
}
