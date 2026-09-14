import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

// Integrantes del equipo
const TEAM = ["Juan Huertas", "Deyvi Ardila", "Nicolas Betancur"];

export default function Hero() {
  return (
    <section
      id="inicio"
      className="flex min-h-[80svh] scroll-mt-20 flex-col justify-center px-6 sm:px-10 lg:min-h-screen lg:px-16"
    >
      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Columna Izquierda: Textos */}
        <div>
          <p className="font-mono text-xs text-ink-dim">
            Universidad Nacional de Colombia · Análisis Numérico
          </p>

          <h1 className="mt-6 max-w-3xl text-balance font-display text-3xl font-medium leading-[1.15] text-ink sm:text-4xl lg:text-5xl">
            ¿Cómo interactúan las GPU con las representaciones en punto
            flotante (IEEE 754) para procesar gráficos 3D?
          </h1>

          <p className="mt-6 font-mono text-xs text-ink-faint">{TEAM.join(" · ")}</p>
        </div>

        {/* Columna Derecha: Imagen GPU */}
        <div className="hidden lg:flex justify-center items-center w-full h-full relative group">
          {/* Brillo sutil de fondo para resaltar la GPU */}
          <div className="absolute inset-0 bg-gradient-to-tr from-mant/5 to-exp/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10 rounded-full"></div>
          
          <img 
            src="/GPU.png" 
            alt="Ilustración o render de una GPU" 
            className="w-full max-w-[450px] object-contain drop-shadow-2xl opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-700 ease-out"
          />
        </div>
      </div>

      <Link
        to="/intuicion"
        aria-label="Ir a intuición inicial"
        className="mx-auto mt-16 animate-bounce text-ink-faint transition-colors hover:text-ink block w-max"
      >
        <ChevronDown size={20} />
      </Link>
    </section>
  );
}
