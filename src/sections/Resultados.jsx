import { useState } from "react";
import Section from "../components/Section.jsx";
import Formula from "../components/Formula.jsx";
import { CheckCircle2 } from "lucide-react";

const INTEGRANTES = [
  { id: "juan", name: "Juan Huertas" },
  { id: "deyvi", name: "Deyvi Ardila" },
  { id: "nicolas", name: "Nicolas Betancur" },
  { id: "german", name: "Germán Rodríguez" },
];

export default function Resultados() {
  const [activeTab, setActiveTab] = useState("nicolas");

  return (
    <Section
      id="resultados"
      index="06"
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

        {/* Pestaña: Germán Rodríguez */}
        {activeTab === "german" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            <p className="max-w-[75ch] text-ink-dim leading-relaxed">
              Se estudió cómo se acumulan los errores de Float32 al componer miles de rotaciones de un
              cuerpo rígido y hasta qué punto la normalización periódica conserva un cuaternión válido.
              El experimento separó dos efectos: el <strong className="text-ink">error de norma</strong>,
              que mide cuánto se aleja el cuaternión de <Formula tex={String.raw`S^3`} />, y el
              {" "}<strong className="text-ink">error angular</strong>, que mide la diferencia entre la
              orientación calculada y una referencia analítica.
            </p>

            <div className="max-w-[75ch] rounded-sm border border-line bg-surface p-4">
              <h4 className="font-mono text-xs font-bold uppercase text-ink">
                Configuración utilizada para comparar los resultados
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                Se aplicaron <strong className="text-ink">100.000 rotaciones</strong> de
                {" "}<Formula tex={String.raw`0.1^\circ`} /> alrededor del eje
                {" "}<Formula tex={String.raw`\mathbf u=(1,2,3)/\sqrt{14}`} />. Se exigió un error de
                norma menor o igual que <Formula tex={String.raw`10^{-4}`} /> y un error angular menor
                o igual que <Formula tex={String.raw`0.1^\circ`} />. Todas las multiplicaciones, sumas
                y restas del producto de Hamilton se redondearon a binary32.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-sm border border-sign-dim bg-surface p-4">
                <p className="font-mono text-xs uppercase text-sign">Sin normalizar</p>
                <dl className="mt-4 space-y-2 font-mono text-[11px] text-ink-dim">
                  <div className="flex justify-between gap-3">
                    <dt>mayor error de norma</dt>
                    <dd className="text-ink">2.15 × 10⁻³</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>mayor error angular</dt>
                    <dd className="text-ink">0.0318°</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>límite de norma</dt>
                    <dd className="text-right text-ink">superado en el paso 4.777</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>límite angular</dt>
                    <dd className="text-right text-ink">no se superó</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                  El error de norma terminó siendo <strong className="text-ink">21,5 veces</strong> la
                  tolerancia. La orientación angular siguió dentro de su límite, pero el cuaternión dejó
                  de satisfacer la precisión exigida para la norma.
                </p>
              </div>

              <div className="rounded-sm border border-exp-dim bg-surface p-4">
                <p className="font-mono text-xs uppercase text-exp">Normalizar cada 1.000 pasos</p>
                <dl className="mt-4 space-y-2 font-mono text-[11px] text-ink-dim">
                  <div className="flex justify-between gap-3">
                    <dt>mayor error de norma</dt>
                    <dd className="text-ink">2.69 × 10⁻⁵</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>mayor error angular</dt>
                    <dd className="text-ink">0.0310°</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>límite de norma</dt>
                    <dd className="text-right text-ink">no se superó</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>límite angular</dt>
                    <dd className="text-right text-ink">no se superó</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                  El mayor error de norma fue aproximadamente
                  {" "}<strong className="text-ink">79,9 veces menor</strong> que en el caso sin
                  normalización. El error angular solo disminuyó cerca de
                  {" "}<strong className="text-ink">2,5 %</strong>. Esta frecuencia fue la más larga de
                  las ensayadas que cumplió simultáneamente ambas tolerancias.
                </p>
              </div>

              <div className="rounded-sm border border-mant-dim bg-surface p-4">
                <p className="font-mono text-xs uppercase text-mant">Normalizar en cada paso</p>
                <dl className="mt-4 space-y-2 font-mono text-[11px] text-ink-dim">
                  <div className="flex justify-between gap-3">
                    <dt>mayor error de norma</dt>
                    <dd className="text-ink">2.06 × 10⁻⁷</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>mayor error angular</dt>
                    <dd className="text-ink">0.0263°</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>límite de norma</dt>
                    <dd className="text-right text-ink">no se superó</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>límite angular</dt>
                    <dd className="text-right text-ink">no se superó</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                  Esta estrategia produjo la menor desviación de norma y redujo el error angular un
                  {" "}<strong className="text-ink">17,3 %</strong> frente al caso sin normalización.
                  Sin embargo, exige calcular la norma y reescalar el cuaternión después de cada
                  movimiento, incluso cuando una frecuencia menor ya satisface los límites.
                </p>
              </div>
            </div>

            <div className="max-w-[75ch] space-y-4">
              <p className="leading-relaxed text-ink-dim">
                <strong className="text-ink">El error sí se acumula, pero no de una sola forma.</strong>
                {" "}Sin normalización, el primer incumplimiento de la norma apareció en el paso 4.777,
                mientras que el error angular permaneció por debajo de su tolerancia durante los
                100.000 movimientos. Por ello, vigilar únicamente el ángulo habría ocultado que el
                cuaternión ya no conservaba adecuadamente la condición
                {" "}<Formula tex={String.raw`\lVert q\rVert=1`} />.
              </p>
              <p className="leading-relaxed text-ink-dim">
                <strong className="text-ink">¿Por qué aumentó más el error de norma?</strong>
                {" "}En aritmética exacta, el producto de dos cuaterniones unitarios vuelve a tener norma
                uno. En Float32, cada multiplicación y suma perturba ligeramente sus cuatro componentes.
                La parte radial de esa perturbación modifica la longitud y vuelve a entrar en la
                siguiente actualización, pues
                {" "}<Formula tex={String.raw`\lVert q\otimes\Delta q\rVert=
                  \lVert q\rVert\lVert\Delta q\rVert`} />. En cambio, una variación puramente radial no
                cambia la dirección del cuaternión. Al medir el error angular se compara
                {" "}<Formula tex={String.raw`q/\lVert q\rVert`} /> con la referencia, de modo que esa
                variación de longitud se elimina de la medida. Solo permanecen las perturbaciones
                tangenciales, que en este experimento fueron menores y pudieron compensarse parcialmente
                entre rotaciones sucesivas.
              </p>
              <p className="leading-relaxed text-ink-dim">
                <strong className="text-ink">La normalización corrige principalmente el error radial.</strong>
                {" "}Al proyectar el cuaternión de nuevo sobre <Formula tex={String.raw`S^3`} />, el
                error de norma se reduce varios órdenes de magnitud. La mejora angular es mucho menor
                porque reescalar el cuaternión no determina cuál era la orientación exacta y no elimina
                el error tangencial ya acumulado.
              </p>
              <p className="leading-relaxed text-ink-dim">
                <strong className="text-ink">Corregir el error radial evita deformaciones.</strong>
                {" "}La fórmula de rotación <Formula tex={String.raw`q\,p\,q^*`} /> supone que
                {" "}<Formula tex={String.raw`q`} /> es unitario. Si su norma se aparta de uno, el
                conjugado deja de ser el inverso, ya que
                {" "}<Formula tex={String.raw`q^{-1}=q^*/\lVert q\rVert^2`} />. Usar entonces
                {" "}<Formula tex={String.raw`q^*`} /> como si fuera <Formula tex={String.raw`q^{-1}`} />
                puede introducir escala y hacer que la transformación deje de ser una rotación rígida.
                Una normalización oportuna restaura la restricción
                {" "}<Formula tex={String.raw`\lVert q\rVert=1`} />, evita que el error radial siga
                alimentando las actualizaciones posteriores y conserva la forma del objeto.
              </p>
              <p className="leading-relaxed text-ink-dim">
                <strong className="text-ink">No existe un intervalo universal de normalización.</strong>
                {" "}La frecuencia adecuada depende del ángulo incremental, el eje, el número de pasos,
                las tolerancias, el orden de evaluación y las decisiones del compilador de GPU. En esta
                configuración, normalizar cada 1.000 pasos fue suficiente. Ese resultado debe volver a
                evaluarse cuando cambien las condiciones de la simulación.
              </p>
            </div>

            <div className="max-w-[75ch] rounded-sm border border-line bg-surface-2 p-4 flex items-start gap-3">
              <CheckCircle2 className="size-5 text-mant shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed text-ink-dim">
                <strong className="mb-1 block font-mono text-[11px] uppercase text-ink">
                  Respuesta a la pregunta de investigación
                </strong>
                En las condiciones evaluadas, dejar el cuaternión sin normalizar hizo que el error de
                norma superara el límite después de 4.777 movimientos. Normalizar cada 1.000 pasos
                mantuvo tanto la norma como la orientación dentro de las tolerancias durante 100.000
                actualizaciones. Normalizar en cada paso redujo aún más los errores, pero aportó una
                mejora angular limitada frente al trabajo adicional. La decisión práctica debe controlar
                simultáneamente la norma y el ángulo y escoger el mayor intervalo que satisfaga ambos
                requisitos.
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
