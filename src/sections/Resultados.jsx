import { useState } from "react";
import Section from "../components/Section.jsx";
import Formula from "../components/Formula.jsx";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const INTEGRANTES = [
  { id: "juan", name: "Juan Huertas" },
  { id: "deyvi", name: "Deyvi Ardila" },
  { id: "nicolas", name: "Nicolas Betancur" },
];

export default function Resultados() {
  const [activeTab, setActiveTab] = useState("nicolas");

  return (
    <Section
      id="resultados"
      index="05"
      accent="sign"
      variant="page"
      title="Resultados, conclusiones y transformación"
      subtitle="Contrastamos las intuiciones iniciales con lo descubierto analíticamente: cómo el estándar IEEE 754 interactúa realmente con el hardware gráfico."
    >
      {/* Selector de pestañas por integrante */}
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
            <span className="block font-mono text-xs mb-1 opacity-70">Resultados de</span>
            <span className="font-medium text-lg">{integrante.name}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {/* Pestaña: Juan Huertas */}
        {activeTab === "juan" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="max-w-[65ch] text-ink-dim leading-relaxed">
              Aquí irán los resultados y conclusiones de Juan Huertas, contrastando su intuición geométrica de cinemática y proyección del espacio 3D a la pantalla 2D con los hallazgos de precisión numérica.
            </p>
            <div className="mt-6 h-48 border border-dashed border-line rounded-sm flex flex-col items-center justify-center text-ink-faint">
              <span className="font-mono text-sm">Contenido en desarrollo</span>
              <span className="text-xs mt-2 opacity-50">Esperando resultados de Juan...</span>
            </div>
          </div>
        )}

        {/* Pestaña: Deyvi Ardila */}
        {activeTab === "deyvi" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="max-w-[65ch] text-ink-dim leading-relaxed">
              Aquí irán los resultados y conclusiones de Deyvi Ardila, contrastando su intuición sobre la arquitectura de hardware, paralelismo masivo y el intercambio de precisión (Float32 vs Float16) con los resultados del proyecto.
            </p>
            <div className="mt-6 h-48 border border-dashed border-line rounded-sm flex flex-col items-center justify-center text-ink-faint">
              <span className="font-mono text-sm">Contenido en desarrollo</span>
              <span className="text-xs mt-2 opacity-50">Esperando resultados de Deyvi...</span>
            </div>
          </div>
        )}

        {/* Pestaña: Nicolas Betancur */}
        {activeTab === "nicolas" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            
            {/* Cuadro de transformación síntesis */}
            <div className="p-4 border border-line rounded-sm bg-surface max-w-[65ch]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="size-4 text-mant" />
                <h4 className="font-mono text-xs font-bold uppercase text-ink tracking-wider">
                  Síntesis de Transformación Conceptual
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-surface-2 rounded-sm border border-line">
                  <span className="font-mono text-[10px] text-sign uppercase font-bold block mb-1">Intuición Inicial</span>
                  <p className="text-ink-dim">
                    El error se hace visible tras acumular pequeños desvíos en múltiples rebotes; la corrección consistiría en engrosar la superficie o iterar modos de redondeo.
                  </p>
                </div>
                <div className="p-2.5 bg-surface-2 rounded-sm border border-line">
                  <span className="font-mono text-[10px] text-mant uppercase font-bold block mb-1">Resultado Analítico</span>
                  <p className="text-ink-dim">
                    El fallo es instantáneo en el rebote 1 (auto-intersección por residuo negativo); se corrige desplazando el origen secundario fuera de la superficie con un épsilon.
                  </p>
                </div>
              </div>
            </div>

            {/* Párrafo 1 */}
            <p className="max-w-[65ch] text-ink-dim leading-relaxed">
              Aunque es cierto que el error por aproximación de punto flotante se da en un rebote, no se da como lo pensaba y la corrección del error también es diferente.
            </p>

            {/* Párrafo 2 */}
            <p className="max-w-[65ch] text-ink-dim leading-relaxed">
              En primera instancia, pensaba que el error se volvía visible despues de acumular errores de aproximación pequeños tras varios rebotes seguidos, pero es posible notar el error en el primer rebote, más aún cuando la escena es grande (<Formula tex={String.raw`X \ge 50\,000`} />), o el ángulo es rasante (<Formula tex={String.raw`D \cdot N \to 0`} />). También, el fallo más destructivo del error es cuando es negativo, ya que el punto cae debajo de la superficie y no es que ilumine o atraviese el muro como yo pensaba, si no que el rebote se va a autointerceptar con la misma superficie, porque rebotó &quot;debajo&quot; de la misma.
            </p>

            {/* Párrafo 3 */}
            <p className="max-w-[65ch] text-ink-dim leading-relaxed">
              Sobre la corrección del error una de mis propuestas era que el método de aproximación variara iterativamente, sin embargo no es posible que sea una solución porque el error puede verse visible y ser fatal en el primer rebote, por lo que hay que corregirlo desde el primer momento. Otra de mis propuestas era que la superficie tuviera un &quot;margen&quot;, de esta manera se podía interpretar que siempre rebotaba, pero mi intuición estaba mal de nuevo porque si la superficie tiene un margen, por ejemplo la hacemos teóricamente 1 milímetro más gruesa, al contrario de corregir el error, lo hará más probable, porque hay más posibilidad de que el rayo quede debajo de la superficie. En vez de eso, lo que realmente pasa es que para corregir los errores positivos se suma un epsilon fijo al cálculo del punto de colisión de tal forma que aproxime exactamente al punto de la superficie, y para los errores negativos desplaza el punto de origen donde en teoría se genera el nuevo rayo rebotado, también se desplaza un epsilon que puede ser fijo o adaptativo.
            </p>

            {/* Párrafo 4 */}
            <p className="max-w-[65ch] text-ink-dim leading-relaxed font-medium text-ink">
              Calcular los errores y corregirlos para simular un fenómeno continuo como lo es el trazadoo de rayos es realmente complicado, pero la aritmética de punto flotante nos da una forma de poder jugar con los errores para que visualmente se vea continuo, aunque no haya forma de simularlo a la perfección.
            </p>

            {/* Cuadro de conclusión técnica */}
            <div className="mt-8 p-4 bg-surface-2 border border-line rounded-sm max-w-[65ch] flex items-start gap-3">
              <CheckCircle2 className="size-5 text-mant shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-ink-dim">
                <strong className="text-ink block font-mono uppercase text-[11px] mb-1">
                  Conclusión del Análisis Numérico:
                </strong>
                En trazado de rayos en GPU, el objetivo no es eliminar el error de redondeo inherente a IEEE 754 (lo cual exigiría precisión infinita), sino aplicar geometría analítica para <strong>garantizar que el error caiga siempre en el semiespacio exterior seguro</strong> (<Formula tex={String.raw`(O_{\text{sec}} - P_0) \cdot N > 0`} />). Así, la simulación física se mantiene creíble y fluida a 60 FPS sin desbordar el silicio.
              </div>
            </div>

          </div>
        )}
      </div>
    </Section>
  );
}
