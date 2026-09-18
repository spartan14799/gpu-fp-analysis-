import Section from "../components/Section.jsx";
import { CheckCircle2, Sparkles } from "lucide-react";
import Formula from "../components/Formula.jsx";

export default function Conclusiones() {
  return (
    <Section
      id="conclusiones"
      index="06"
      accent="mant"
      variant="page"
      title="Conclusiones y Transformación"
      subtitle="Informe consolidado sobre qué aprendimos y cómo cambió nuestra forma de entender los gráficos 3D desde la perspectiva del Análisis Numérico."
    >
      <div className="space-y-12">
        {/* Conclusión General */}
        <div className="space-y-4">
          <h3 className="text-xl font-display font-medium text-ink flex items-center gap-2">
            <CheckCircle2 className="size-5 text-mant" />
            Conclusión General
          </h3>
          <p className="max-w-[65ch] text-ink-dim leading-relaxed">
            Las GPU modernas son prodigios del análisis numérico aplicado. La respuesta a nuestra pregunta inicial ("¿Cómo interactúan las GPU con las representaciones en punto flotante?") no radica en buscar una precisión matemática infinita, sino en un equilibrio calculado. La simulación gráfica en tiempo real sacrifica deliberadamente precisión estricta a favor de un paralelismo masivo.
          </p>
          <p className="max-w-[65ch] text-ink-dim leading-relaxed">
            Hemos comprobado analíticamente que el estándar IEEE 754 permite técnicas de optimización profunda: desde manipular los bits directamente para calcular logaritmos (Fast Inverse Square Root), hasta utilizar precisión mixta (<code className="font-mono text-xs">Float32</code> para colisiones vs <code className="font-mono text-xs">Float16</code> para la luz). Las GPUs no evitan el error de redondeo, sino que lo controlan garantizando que sus consecuencias (como el residuo negativo en rebotes) caigan siempre en un espacio seguro visual y geométricamente.
          </p>
        </div>

        {/* Transformación Intelectual */}
        <div className="space-y-6">
          <h3 className="text-xl font-display font-medium text-ink flex items-center gap-2">
            <Sparkles className="size-5 text-sign" />
            ¿Qué cambió en nuestra comprensión?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {/* Juan */}
            <div className="p-5 border border-line rounded-sm bg-surface">
              <h4 className="font-mono text-sm font-bold uppercase text-ink mb-3">Juan Huertas</h4>
              <div className="space-y-4 text-sm text-ink-dim">
                <div>
                  <strong className="text-ink text-xs uppercase font-mono block mb-1">Pensaba al comenzar:</strong>
                  Creía que las operaciones gráficas como normalizar vectores y proyectar puntos eran operaciones geométricas puras calculadas directamente con divisiones estándares.
                </div>
                <div>
                  <strong className="text-ink text-xs uppercase font-mono block mb-1">Entiendo ahora:</strong>
                  Comprendo que la matemática del hardware es fundamentalmente binaria y numérica. Modificar los bits de un flotante como si fuera un entero permite atajos matemáticos inimaginables en álgebra pura, demostrando que en el análisis numérico el rendimiento frecuentemente justifica la pérdida calculada de precisión.
                </div>
              </div>
            </div>

            {/* Deyvi */}
            <div className="p-5 border border-line rounded-sm bg-surface">
              <h4 className="font-mono text-sm font-bold uppercase text-ink mb-3">Deyvi Ardila</h4>
              <div className="space-y-4 text-sm text-ink-dim">
                <div>
                  <strong className="text-ink text-xs uppercase font-mono block mb-1">Pensaba al comenzar:</strong>
                  Pensaba que un menor número de bits (<code className="font-mono text-[10px]">Float16</code>) solo significaba que el juego se vería con menos "resolución" de color, pero que funcionaría más rápido por el paralelismo.
                </div>
                <div>
                  <strong className="text-ink text-xs uppercase font-mono block mb-1">Entiendo ahora:</strong>
                  La precisión afecta la ubicación en el espacio real. Reducir los bits en el cálculo geométrico causa problemas físicos (Shadow Acne) donde la luz choca consigo misma debido a un error de épsilon. Aprendí que la arquitectura moderna resuelve esto separando el rigor espacial (Float32) de la percepción de la luz (Float16).
                </div>
              </div>
            </div>

            {/* Nicolás */}
            <div className="p-5 border border-line rounded-sm bg-surface">
              <h4 className="font-mono text-sm font-bold uppercase text-ink mb-3">Nicolas Betancur</h4>
              <div className="space-y-4 text-sm text-ink-dim">
                <div>
                  <strong className="text-ink text-xs uppercase font-mono block mb-1">Pensaba al comenzar:</strong>
                  El error se hacía visible gradualmente tras acumular pequeños desvíos en múltiples rebotes de luz; creía que engrosar la superficie o iterar los modos de redondeo corregiría el fallo.
                </div>
                <div>
                  <strong className="text-ink text-xs uppercase font-mono block mb-1">Entiendo ahora:</strong>
                  El fallo es instantáneo en el rebote 1 (auto-intersección por residuo negativo). Darle más grosor a la pared empeora el problema numérico. Aprendí que la verdadera corrección analítica es aplicar un sesgo (epsilon) para desplazar el origen secundario al semiespacio exterior seguro.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
