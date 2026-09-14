import { useState } from "react";
import Section from "../components/Section.jsx";
import PantallaPersonaje from "../components/PantallaPersonaje.jsx";
import Proyeccion3D from "../components/Proyeccion3D.jsx";
import PrecisionVsParalelismo from "../components/PrecisionVsParalelismo.jsx";
import AcumulacionErrorRayTracing from "../components/AcumulacionErrorRayTracing.jsx";

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
            <p className="max-w-[65ch] text-ink-dim leading-relaxed">
              Inicialmente la idea de analizar esta pregunta llamó mi atención por lo mencionado en clase sobre la acumulación de errores, y junto al tema discutido con mis compañeros sobre el procesamiento gráfico 3D, surgió una pregunta sobre técnicas intensivas para simular fenómenos continuos, como el Ray Tracing. Ya que estamos intentando modelar este fenómeno en un computador que es discreto, hay lugar a errores de aproximación en la colisión de los rayos.
            </p>

            <div className="mt-6">
              <p className="mb-3 font-mono text-xs text-ink-dim">
                simulación interactiva — acumulación de error en rebotes sucesivos vs entorno continuo
              </p>
              <AcumulacionErrorRayTracing />
            </div>

            <p className="mt-10 max-w-[65ch] text-ink-dim leading-relaxed">
              Ahora bien, cada vez que un rayo colisiona, rebota o se refracta, es muy probable que en la aproximación de punto flotante se estén acumulando errores por la pérdida de precisión en la mantisa. En algún escenario donde hay millones de interacciones como esta se pueden generar fallos como que un rayo atraviese una pared delgada, malos cálculos en las sombras o superficies superpuestas.
            </p>

            <p className="mt-6 max-w-[65ch] text-ink-dim leading-relaxed">
              Pienso que es casi seguro que de alguna forma deben de &quot;amortiguar&quot; esta acumulación de errores, talvez dando un pequeño margen de error a las superficies que interactuán con los rayos de luz o aproximando iterativamente entre aproximación truncada y por exceso, haciendo que el error no pase de cierto valor.
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}
