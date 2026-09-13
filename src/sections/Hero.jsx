import { ChevronDown } from "lucide-react";

// TODO: reemplazar por los nombres reales del equipo.
const TEAM = ["Integrante 1", "Integrante 2", "Integrante 3"];

export default function Hero() {
  return (
    <section
      id="inicio"
      className="flex min-h-[80svh] scroll-mt-20 flex-col justify-center px-6 sm:px-10 lg:min-h-screen lg:px-16"
    >
      <div className="mx-auto w-full max-w-4xl">
        <p className="font-mono text-xs text-ink-dim">
          Universidad Nacional de Colombia · Análisis Numérico
        </p>

        <h1 className="mt-6 max-w-3xl text-balance font-display text-3xl font-medium leading-[1.15] text-ink sm:text-4xl lg:text-5xl">
          ¿Cómo interactúan las GPU con las representaciones en punto
          flotante (IEEE 754) para procesar gráficos 3D?
        </h1>

        <p className="mt-6 font-mono text-xs text-ink-faint">{TEAM.join(" · ")}</p>
      </div>

      <button
        onClick={() => document.getElementById("intuicion")?.scrollIntoView({ behavior: "smooth" })}
        aria-label="Ir a intuición inicial"
        className="mx-auto mt-16 animate-bounce text-ink-faint transition-colors hover:text-ink"
      >
        <ChevronDown size={20} />
      </button>
    </section>
  );
}
