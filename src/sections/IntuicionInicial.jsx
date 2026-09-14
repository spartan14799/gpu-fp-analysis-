import { useState } from "react";
import Section from "../components/Section.jsx";
import PantallaPersonaje from "../components/PantallaPersonaje.jsx";
import Proyeccion3D from "../components/Proyeccion3D.jsx";
import PrecisionVsParalelismo from "../components/PrecisionVsParalelismo.jsx";

const INTEGRANTES = [
  { id: "juan", name: "Juan Huertas" },
  { id: "deyvi", name: "Deyvi Ardila" },
  { id: "nicolas", name: "Nicolas Betancur" }
];

export default function IntuicionInicial() {
  const [activeTab, setActiveTab] = useState("juan");

  return (
    <Section
      id="intuicion"
      index="01"
      accent="sign"
      title="Intuición inicial"
      subtitle="Antes de llegar al estándar IEEE 754, partimos de una intuición más cercana a los gráficos por computadora que a la representación binaria."
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {INTEGRANTES.map((integrante) => (
          <button
            key={integrante.id}
            onClick={() => setActiveTab(integrante.id)}
            className={`flex-1 p-4 border rounded-sm text-left transition-colors ${
              activeTab === integrante.id
                ? "border-ink bg-surface text-ink"
                : "border-line text-ink-dim hover:border-ink-dim hover:text-ink"
            }`}
          >
            <span className="block font-mono text-xs mb-1 opacity-70">Intuición de</span>
            <span className="font-medium text-lg">{integrante.name}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "juan" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="max-w-[65ch] text-ink-dim">
              Nuestra intuición inicial es que, de manera similar a como funcionan
              los gráficos 2D, el problema consiste en asignar coordenadas a la
              pantalla y en usar funciones físicas de cinemática —como la
              aceleración— para calcular la velocidad y el movimiento de los
              personajes: su desplazamiento y su salto.
            </p>

            <div className="mt-6">
              <p className="mb-3 font-mono text-xs text-ink-dim">
                pantalla 2D — coordenadas y movimiento de un personaje
              </p>
              <PantallaPersonaje />
            </div>

            <p className="mt-10 max-w-[65ch] text-ink-dim">
              Llevar esta idea a tres dimensiones consiste en proyectar un
              espacio 3D sobre una pantalla de dos dimensiones: convertir cada
              coordenada tridimensional en la posición 2D de la pantalla donde
              debe dibujarse su color. Esto exige definir una función de
              proyección que, para cada punto del espacio 3D, determine el
              píxel correspondiente en la superficie 2D.
            </p>

            <div className="mt-6">
              <p className="mb-3 font-mono text-xs text-ink-dim">
                intento de proyección — de un espacio 3D a la pantalla 2D
              </p>
              <Proyeccion3D />
            </div>
          </div>
        )}

        {activeTab === "deyvi" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="max-w-[65ch] text-ink-dim">
              Mi intuición inicial recae desde la perspectiva de la arquitectura de hardware y la programación paralela. Si proyectar un espacio 3D a una pantalla 2D requiere calcular proyecciones, rotaciones y rayos de luz para millones de polígonos por cuadro, hacerlo con precisión absoluta (por ejemplo, usando <code className="font-mono text-xs">Float64</code>) crearía un cuello de botella computacional masivo.
            </p>

            <div className="mt-6">
              <p className="mb-3 font-mono text-xs text-ink-dim">
                cuello de botella — alta precisión vs renderizado en tiempo real
              </p>
              <PrecisionVsParalelismo />
            </div>

            <p className="mt-10 max-w-[65ch] text-ink-dim">
              Por lo tanto, intuyo que la interacción de las GPU con el estándar IEEE 754 se basa en un intercambio (trade-off) deliberado: sacrificar la precisión milimétrica (usando formatos más pequeños como <code className="font-mono text-xs">Float32</code> o incluso <code className="font-mono text-xs">Float16</code>) para poder distribuir operaciones simples en miles de núcleos simultáneamente. Supongo que los errores de redondeo o pérdida de precisión en estos formatos son visualmente imperceptibles para el ojo humano, pero absolutamente críticos para evitar que la memoria de la GPU colapse y mantener la fluidez en tiempo real.
            </p>
          </div>
        )}

        {activeTab === "nicolas" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="max-w-[65ch] text-ink-dim">
              Aquí irá la intuición inicial de Nicolas Betancur. Abordaremos preguntas sobre las limitaciones 
              computacionales, y tal vez una aproximación sobre cómo técnicas más pesadas como el trazado de 
              rayos podrían interactuar a nivel de máquina.
            </p>
            <div className="mt-6 h-48 border border-dashed border-line rounded-sm flex flex-col items-center justify-center text-ink-faint">
              <span className="font-mono text-sm">Contenido en desarrollo</span>
              <span className="text-xs mt-2 opacity-50">Esperando intuición de Nicolas...</span>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
