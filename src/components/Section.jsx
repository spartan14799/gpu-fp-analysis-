/**
 * Envoltorio de sección: aplica el mismo ritmo tipográfico y espaciado
 * a cada módulo del proyecto (número de secuencia, título, contenido).
 *
 * variant="stacked" (por defecto) -> sección apilada bajo otra en la misma
 *   página (landing): lleva borde superior separador.
 * variant="page" -> la sección ES la página completa: sin borde superior,
 *   con el espaciado superior propio de una página independiente.
 */
export default function Section({
  id,
  index,
  title,
  subtitle,
  accent = "mant",
  children,
  variant = "stacked",
  className = "",
}) {
  const base =
    variant === "page"
      ? "scroll-mt-20 px-6 pb-16 pt-24 sm:px-10 sm:pt-28 lg:px-16 lg:pb-24 lg:pt-16"
      : "scroll-mt-20 border-t border-line px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-24";

  return (
    <section id={id} className={`${base} ${className}`}>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start gap-4 sm:gap-6">
          <span
            className="mt-1 shrink-0 font-mono text-xs sm:text-sm"
            style={{ color: `var(--color-${accent})` }}
          >
            {index}
          </span>
          <div className="min-w-0">
            <h2 className="text-balance font-display text-2xl font-medium leading-tight text-ink sm:text-3xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 max-w-[65ch] text-ink-dim">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="mt-10 sm:ml-10 lg:ml-12">{children}</div>
      </div>
    </section>
  );
}
