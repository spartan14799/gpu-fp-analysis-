import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SECTIONS } from "../lib/sections.js";

const ANCHOR_IDS = SECTIONS.filter((s) => s.kind === "anchor").map((s) => s.id);

/** Scroll-spy: solo se activa en la landing, entre los ids ancla. */
function useActiveAnchor(enabled) {
  const [activeId, setActiveId] = useState(ANCHOR_IDS[0]);

  useEffect(() => {
    if (!enabled) return;
    const elements = ANCHOR_IDS.map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);

  return activeId;
}

/** Barra de bits decorativa: S·1 / E·8 / M·23 — el motivo visual del sitio en miniatura. */
function BitGlyph() {
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-[1px]">
      <div style={{ width: "3.125%", background: "var(--color-sign)" }} />
      <div style={{ width: "25%", background: "var(--color-exp)" }} />
      <div style={{ width: "71.875%", background: "var(--color-mant)" }} />
    </div>
  );
}

export default function NavRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const onLanding = location.pathname === "/";
  const activeAnchor = useActiveAnchor(onLanding);

  const isActive = (s) =>
    s.kind === "anchor" ? onLanding && activeAnchor === s.id : location.pathname === s.path;

  const goToAnchor = (id) => {
    if (!onLanding) {
      navigate("/");
      requestAnimationFrame(() => {
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
      });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const itemInner = (s, active) => (
    <>
      <span
        className="font-mono text-xs"
        style={{ color: active ? `var(--color-${s.accent})` : "var(--color-ink-faint)" }}
      >
        {s.index}
      </span>
      <span className={active ? "text-sm text-ink" : "text-sm text-ink-dim group-hover:text-ink"}>
        {s.label}
      </span>
    </>
  );

  return (
    <>
      {/* Desktop: riel fijo a la izquierda */}
      <nav
        aria-label="Secciones del proyecto"
        className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-bg/95 backdrop-blur px-6 py-8 lg:flex"
      >
        <Link to="/">
          <BitGlyph />
        </Link>
        <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-faint">
          IEEE 754 · binary32
        </p>

        <ul className="mt-10 flex flex-col gap-1">
          {SECTIONS.map((s) => {
            const active = isActive(s);
            const className = `group flex w-full items-baseline gap-3 rounded-sm px-2 py-2 text-left transition-colors ${
              active ? "bg-surface" : "hover:bg-surface"
            }`;
            return (
              <li key={s.id}>
                {s.kind === "route" ? (
                  <Link to={s.path} className={className} aria-current={active ? "true" : undefined}>
                    {itemInner(s, active)}
                  </Link>
                ) : (
                  <button
                    onClick={() => goToAnchor(s.id)}
                    className={className}
                    aria-current={active ? "true" : undefined}
                  >
                    {itemInner(s, active)}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-auto font-mono text-[10px] leading-relaxed text-ink-faint">
          Universidad Nacional de Colombia
          <br />
          Análisis Numérico
        </div>
      </nav>

      {/* Móvil / tablet: barra superior con scroll horizontal */}
      <nav
        aria-label="Secciones del proyecto"
        className="fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/95 backdrop-blur lg:hidden"
      >
        <div className="px-4 pt-3">
          <BitGlyph />
        </div>
        <ul className="flex gap-1 overflow-x-auto px-3 py-2.5">
          {SECTIONS.map((s) => {
            const active = isActive(s);
            const className = `flex items-center gap-2 whitespace-nowrap rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors ${
              active ? "border-mant text-ink" : "border-line text-ink-dim"
            }`;
            return (
              <li key={s.id} className="shrink-0">
                {s.kind === "route" ? (
                  <Link to={s.path} className={className} aria-current={active ? "true" : undefined}>
                    <span style={{ color: active ? `var(--color-${s.accent})` : undefined }}>{s.index}</span>
                    {s.label}
                  </Link>
                ) : (
                  <button onClick={() => goToAnchor(s.id)} className={className} aria-current={active ? "true" : undefined}>
                    <span style={{ color: active ? `var(--color-${s.accent})` : undefined }}>{s.index}</span>
                    {s.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
