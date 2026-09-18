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
      title="Resultados Experimentales"
      subtitle="Evidencia analítica y visual de cómo el estándar IEEE 754 interactúa con el hardware gráfico para la optimización de cálculos en 3D."
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
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            <p className="max-w-[65ch] text-ink-dim leading-relaxed">
              Al estudiar la normalización de vectores, descubrimos cómo la aritmética de coma flotante y sus representaciones a nivel de bits permitieron optimizaciones críticas en la historia de los gráficos 3D.
            </p>

            <div className="p-4 border border-line rounded-sm bg-surface max-w-[65ch]">
              <h4 className="font-mono text-xs font-bold uppercase text-ink mb-2">Evidencia: Fast Inverse Square Root</h4>
              <p className="text-sm text-ink-dim leading-relaxed mb-3">
                Calcular la raíz cuadrada inversa (<code className="font-mono text-xs text-exp">1/sqrt(x)</code>) de forma tradicional requería múltiples divisiones de coma flotante, operaciones extremadamente costosas para las CPU antiguas. El famoso algoritmo de Quake III trata los bits del flotante IEEE 754 directamente como un número entero, aplicando un desplazamiento de bits (bitshift) y restándolo a una constante mágica (<code className="font-mono text-xs">0x5f3759df</code>) para obtener una primera aproximación logarítmica casi instantánea.
              </p>
              <p className="text-sm text-ink-dim leading-relaxed">
                <strong className="text-exp">Resultado:</strong> Esta aproximación tiene un error máximo del 1.75%, que luego se reduce casi a cero aplicando una iteración del método de Newton-Raphson. Logra un cálculo 4 veces más rápido que la división estándar, permitiendo renderizar iluminación e intersecciones en tiempo real.
              </p>
            </div>
          </div>
        )}

        {/* Pestaña: Deyvi Ardila */}
        {activeTab === "deyvi" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            <p className="max-w-[65ch] text-ink-dim leading-relaxed">
              Al analizar experimentalmente el trazado de rayos bajo diferentes precisiones de punto flotante, descubrimos por qué la industria estandarizó el uso mixto de precisiones en lugar de usar <code className="font-mono text-xs">Float16</code> para todo (buscando máximo paralelismo).
            </p>
            
            <div className="p-4 border border-line rounded-sm bg-surface max-w-[65ch]">
              <h4 className="font-mono text-xs font-bold uppercase text-ink mb-2">Evidencia: El problema geométrico (Shadow Acne)</h4>
              <p className="text-sm text-ink-dim leading-relaxed mb-3">
                Cuando forzamos el cálculo de intersección rayo-triángulo a usar <code className="font-mono text-xs">Float16</code> (Half-precision), la mantisa de 10 bits no tiene la resolución suficiente para almacenar coordenadas espaciales exactas. El error de redondeo microscópico provoca que el punto de colisión se calcule numéricamente "por debajo" de la superficie real del triángulo.
              </p>
              <p className="text-sm text-ink-dim leading-relaxed">
                <strong className="text-sign">Resultado visual:</strong> Al lanzar el rayo secundario de sombra hacia la luz, este choca inmediatamente con la misma superficie desde adentro, creando falsas sombras negras conocidas como <em>Shadow Acne</em>. Geométricamente, perdimos la noción analítica de "exterior" e "interior" de la malla.
              </p>
            </div>

            <div className="p-4 border border-line rounded-sm bg-surface max-w-[65ch]">
              <h4 className="font-mono text-xs font-bold uppercase text-ink mb-2">Solución: Precisión Mixta en Hardware</h4>
              <p className="text-sm text-ink-dim leading-relaxed mb-3">
                Para resolver esto sin perder rendimiento, las GPU modernas dividen el <em>pipeline</em>:
              </p>
              <ul className="list-disc pl-5 text-sm text-ink-dim space-y-2">
                <li><strong>Geometría (Float32):</strong> El cálculo de intersección estricta y recorrido del árbol BVH se hace en precisión simple. Evitamos el <em>Shadow Acne</em> y los huecos en las mallas.</li>
                <li><strong>Color e Iluminación (Float16):</strong> Una vez determinada la colisión, el cálculo de acumulación de luz, rebotes de color y atenuación se degrada deliberadamente a <code className="font-mono text-xs">Float16</code>. El ojo humano es insensible a pequeños errores de redondeo en gradientes de color, logrando reducir el ancho de banda de VRAM a la mitad.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Pestaña: Nicolas Betancur */}
        {activeTab === "nicolas" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">

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
