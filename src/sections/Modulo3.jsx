import Section from "../components/Section.jsx";
import Formula from "../components/Formula.jsx";
import LaboratorioRebotePlano from "../components/LaboratorioRebotePlano.jsx";

export default function Modulo3() {
  return (
    <Section
      id="modulo-3"
      index="04"
      accent="mant"
      variant="page"
      title="Intersección, Rebote y Corrección de Error en Superficies"
      subtitle="El análisis formal de la interacción rayo-plano: de la física continua a la aritmética IEEE 754, la génesis de auto-intersecciones y el diseño de cotas de error adaptativas."
    >
      <div className="space-y-4 max-w-[65ch] text-ink-dim leading-relaxed">
        <p>
          En este módulo aterrizamos la pregunta a un caso concreto, analizable y fundamental en la computación gráfica: la interacción y rebote de un rayo de luz contra una superficie plana infinita, para ver qué pasa con el error de punto flotante.
        </p>
        <p>
          Analizaremos cómo se describe este fenómeno en la física continua, cómo se codifica en los registros de una GPU bajo el estándar <strong>IEEE 754</strong>, cómo las limitaciones de la mantisa generan el temido defecto de <em>auto-intersección (Shadow Acne)</em> y cómo se formulan matemáticamente las técnicas modernas de amortiguación y cotas de error adaptativas respaldadas por la literatura canónica de renderizado basado en física.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. FORMULACIÓN MATEMÁTICA RIGUROSA */}
      {/* ========================================================================= */}
      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl text-ink font-medium">
          1. Formulación Matemática Rigurosa (Espacio Continuo <Formula tex={String.raw`\mathbb{R}^3`} />)
        </h3>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          En el espacio euclidiano continuo tridimensional, la interacción entre un fotón y un plano se modela mediante la intersección geométrica de una recta semiparamétrica y un hiperplano implícito, seguida de una reflexión especular vectorial.
        </p>

        {/* Definición de Elementos */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[65ch]">
          <div className="border border-line rounded-sm p-4 bg-surface">
            <h4 className="font-mono text-xs font-bold uppercase text-mant mb-2">Rayo Primario Incidente</h4>
            <div className="my-2 bg-surface-2 p-2 rounded-sm border border-line">
              <Formula tex={String.raw`R(t) = O + t D, \quad t \in \mathbb{R}^+`} block />
            </div>
            <ul className="text-xs text-ink-dim space-y-1.5 list-disc pl-4 mt-2">
              <li><strong className="text-ink">Origen <Formula tex={String.raw`O = (O_x, O_y, O_z)`} />:</strong> Posición tridimensional de la cámara o emisor en el espacio de la escena.</li>
              <li><strong className="text-ink">Dirección <Formula tex={String.raw`D = (D_x, D_y, D_z)`} />:</strong> Vector unitario de propagación del rayo, con norma continua estricta <Formula tex={String.raw`\|D\| = \sqrt{D_x^2 + D_y^2 + D_z^2} = 1`} />.</li>
              <li><strong className="text-ink">Parámetro <Formula tex={String.raw`t`} />:</strong> Escalar que representa la distancia euclidiana recorrida a lo largo del rayo.</li>
            </ul>
          </div>

          <div className="border border-line rounded-sm p-4 bg-surface">
            <h4 className="font-mono text-xs font-bold uppercase text-exp mb-2">Superficie Plana Infinita</h4>
            <div className="my-2 bg-surface-2 p-2 rounded-sm border border-line">
              <Formula tex={String.raw`(P - P_0) \cdot N = 0`} block />
            </div>
            <ul className="text-xs text-ink-dim space-y-1.5 list-disc pl-4 mt-2">
              <li><strong className="text-ink">Punto de anclaje <Formula tex={String.raw`P_0 = (P_{0x}, P_{0y}, P_{0z})`} />:</strong> Cualquier coordenada conocida perteneciente a la superficie del plano.</li>
              <li><strong className="text-ink">Normal unitaria <Formula tex={String.raw`N = (N_x, N_y, N_z)`} />:</strong> Vector perpendicular al plano orientado al semiespacio exterior, con <Formula tex={String.raw`\|N\| = 1`} />.</li>
              <li><strong className="text-ink">Punto arbitrario <Formula tex={String.raw`P`} />:</strong> Coordenada que satisface la ecuación si y solo si yace sobre el plano.</li>
            </ul>
          </div>
        </div>

        {/* Deducción de t_hit */}
        <h4 className="mt-8 font-display text-base text-ink font-medium">
          Deducción del Parámetro de Impacto (<Formula tex={String.raw`t_{\text{hit}}`} />)
        </h4>
        <p className="mt-2 max-w-[65ch] text-ink-dim leading-relaxed">
          Para hallar el instante en que el rayo atraviesa el plano, evaluamos la ecuación paramétrica del rayo <Formula tex={String.raw`R(t)`} /> dentro de la ecuación implícita del plano:
        </p>

        <div className="mt-4 overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`(O + t D - P_0) \cdot N = 0 \iff (O - P_0) \cdot N + t (D \cdot N) = 0`} block />
        </div>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          Aplicando linealidad del producto punto y despejando el escalar <Formula tex={String.raw`t`} />, obtenemos la solución exacta continua:
        </p>

        <div className="mt-3 overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`t_{\text{hit}} = \frac{(P_0 - O) \cdot N}{D \cdot N} = \frac{N_x(P_{0x}-O_x) + N_y(P_{0y}-O_y) + N_z(P_{0z}-O_z)}{N_x D_x + N_y D_y + N_z D_z}`} block />
        </div>

        {/* Condiciones de frontera */}
        <div className="mt-6 flex flex-col gap-2 max-w-[65ch] bg-surface-2 p-4 rounded-sm border border-line border-l-4 border-l-mant">
          <p className="text-xs text-ink-dim font-mono mb-1 uppercase font-bold text-mant">
            Condiciones de Frontera y Singularidades Geométricas:
          </p>
          <ul className="text-xs text-ink-dim space-y-2 list-disc pl-4">
            <li>
              <strong className="text-ink">Condición de Paralelismo (<Formula tex={String.raw`D \cdot N = 0`} />):</strong> El vector de dirección del rayo es perpendicular a la normal del plano (ángulo de incidencia de 90° respecto a la normal). El denominador se anula; la recta es paralela al plano y no existe intersección única finita.
            </li>
            <li>
              <strong className="text-ink">Condición de Causalidad Temporal (<Formula tex={String.raw`t_{\text{hit}} \le 0`} />):</strong> La intersección matemática existe en la recta geométrica infinita pero se encuentra por detrás del origen del rayo o en el mismo origen. Debe ser descartada para respetar la flecha temporal de la propagación lumínica.
            </li>
            <li>
              <strong className="text-ink">Orientación de la Superficie:</strong> Si <Formula tex={String.raw`D \cdot N < 0`} />, el rayo incide sobre la cara frontal (contra la normal exterior). Si <Formula tex={String.raw`D \cdot N > 0`} />, el rayo incide por la cara posterior del plano.
            </li>
          </ul>
        </div>

        {/* Coordenada de impacto y Rebote especular */}
        <h4 className="mt-8 font-display text-base text-ink font-medium">
          Punto de Impacto y Ley de Reflexión Vectorial
        </h4>
        <p className="mt-2 max-w-[65ch] text-ink-dim leading-relaxed">
          Si <Formula tex={String.raw`t_{\text{hit}} > 0`} />, la coordenada tridimensional exacta del impacto en el espacio continuo es:
        </p>

        <div className="mt-3 overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`P_{\text{hit}} = O + t_{\text{hit}} D`} block />
        </div>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          En una superficie especular ideal (Ley de Snell-Descartes en reflexión), el ángulo de incidencia es igual al ángulo de reflexión. Descomponiendo el vector entrante <Formula tex={String.raw`D`} /> en su componente paralela a la superficie y su componente perpendicular a la normal:
        </p>

        <div className="mt-3 overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`D_{\parallel} = D - (D \cdot N)N, \qquad D_{\perp} = (D \cdot N)N`} block />
        </div>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          La reflexión conserva la componente tangencial <Formula tex={String.raw`D_{\parallel}`} /> e invierte el sentido de la componente normal <Formula tex={String.raw`-D_{\perp}`} />, produciendo la ecuación canónica del vector de rebote reflejado:
        </p>

        <div className="mt-3 overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`D_{\text{refl}} = D_{\parallel} - D_{\perp} = D - 2(D \cdot N)N`} block />
        </div>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          El rayo secundario reflejado resultante listo para propagarse en la escena queda formalmente definido como:
        </p>

        <div className="mt-3 overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`R_{\text{sec}}(t) = P_{\text{hit}} + t D_{\text{refl}}, \quad t \in \mathbb{R}^+`} block />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REPRESENTACIÓN EN MEMORIA IEEE 754 */}
      {/* ========================================================================= */}
      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl text-ink font-medium">
          2. Representación en Memoria Bajo el Estándar IEEE 754 (En la GPU)
        </h3>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          En el silicio de una GPU (como los núcleos CUDA o Stream Processors), los números reales continuos no existen. Toda coordenada espacial, vector de dirección y parámetro <Formula tex={String.raw`t`} /> debe almacenarse en registros de hardware bajo el estándar <strong>IEEE 754-2019</strong> en formato de precisión simple (<strong>binary32</strong> o <code className="font-mono text-xs">Float32</code>).
        </p>

        {/* Anatomía del Float32 */}
        <div className="mt-6 border border-line rounded-sm p-4 bg-surface max-w-[65ch]">
          <h4 className="font-mono text-xs font-bold uppercase text-ink mb-2">
            Anatomía de una Palabra de 32 Bits en la GPU (Float32)
          </h4>
          <p className="text-xs text-ink-dim leading-relaxed mb-4">
            Cada escalar ocupa exactamente 4 bytes (32 bits), particionados en tres campos analíticos:
          </p>

          <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs mb-3">
            <div className="bg-sign/20 border border-sign/40 p-2 rounded-sm">
              <span className="text-sign font-bold block">Signo (s)</span>
              <span className="text-[10px] text-ink-dim">1 bit [31]</span>
            </div>
            <div className="bg-exp/20 border border-exp/40 p-2 rounded-sm">
              <span className="text-exp font-bold block">Exponente Sesgado (e)</span>
              <span className="text-[10px] text-ink-dim">8 bits [30-23] (Sesgo = 127)</span>
            </div>
            <div className="bg-mant/20 border border-mant/40 p-2 rounded-sm">
              <span className="text-mant font-bold block">Mantisa / Fracción (m)</span>
              <span className="text-[10px] text-ink-dim">23 bits [22-0] (+1 implícito)</span>
            </div>
          </div>

          <div className="bg-surface-2 p-3 rounded-sm border border-line">
            <Formula tex={String.raw`v = (-1)^s \times \left(1 + \sum_{i=1}^{23} m_i 2^{-i}\right) \times 2^{e - 127}`} block />
          </div>

          <p className="text-xs text-ink-dim mt-3">
            El épsilon de la máquina para <code className="font-mono text-[11px] text-ink">binary32</code> es <Formula tex={String.raw`\varepsilon_{\text{mach}} = 2^{-24} \approx 5.96046 \times 10^{-8}`} />, lo que garantiza únicamente entre 6 y 7 dígitos decimales significativos de precisión relativa.
          </p>
        </div>

        {/* Empaquetamiento y Alineación en VRAM */}
        <h4 className="mt-8 font-display text-base text-ink font-medium">
          Alineación en VRAM y el Paradigma SIMD de 128 Bits
        </h4>
        <p className="mt-2 max-w-[65ch] text-ink-dim leading-relaxed">
          Geométricamente, un punto o vector en <Formula tex={String.raw`\mathbb{R}^3`} /> requiere 3 coordenadas (<Formula tex={String.raw`x, y, z`} />), es decir, <code className="font-mono text-xs">3 × 4 bytes = 12 bytes</code> (<code className="font-mono text-xs">float3</code>). Sin embargo, los buses de memoria de las GPU modernas transfieren datos en bloques de 16, 32 o 128 bytes coalescentes.
        </p>

        <p className="mt-3 max-w-[65ch] text-ink-dim leading-relaxed">
          Para maximizar el ancho de banda, las APIs como DirectX (HLSL), Vulkan (SPIR-V) y OptiX empaquetan las estructuras en 16 bytes (<code className="font-mono text-xs">float4</code> o coordenadas homogéneas):
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[65ch]">
          <div className="border border-line rounded-sm p-3 bg-surface text-xs font-mono">
            <span className="text-mant font-bold block mb-1">// Origen o Punto (w = 1.0)</span>
            <span className="text-ink-dim block">struct Point4 {"{"}</span>
            <span className="text-ink pl-3 block">float x; // 32 bits (IEEE 754)</span>
            <span className="text-ink pl-3 block">float y; // 32 bits (IEEE 754)</span>
            <span className="text-ink pl-3 block">float z; // 32 bits (IEEE 754)</span>
            <span className="text-exp pl-3 block">float w; // 1.0f (Homogéneo / 16B)</span>
            <span className="text-ink-dim block">{"};"}</span>
          </div>

          <div className="border border-line rounded-sm p-3 bg-surface text-xs font-mono">
            <span className="text-exp font-bold block mb-1">// Dirección o Normal (w = 0.0)</span>
            <span className="text-ink-dim block">struct Vector4 {"{"}</span>
            <span className="text-ink pl-3 block">float dx; // 32 bits (IEEE 754)</span>
            <span className="text-ink pl-3 block">float dy; // 32 bits (IEEE 754)</span>
            <span className="text-ink pl-3 block">float dz; // 32 bits (IEEE 754)</span>
            <span className="text-sign pl-3 block">float w;  // 0.0f (Vectorial / 16B)</span>
            <span className="text-ink-dim block">{"};"}</span>
          </div>
        </div>

        {/* El concepto de ULP y la no homogeneidad del espacio */}
        <h4 className="mt-8 font-display text-base text-ink font-medium">
          El Concepto de ULP y la No-Homogeneidad del Espacio Tridimensional
        </h4>
        <p className="mt-2 max-w-[65ch] text-ink-dim leading-relaxed">
          El aspecto más contra-intuitivo de IEEE 754 para un programador gráfico es que <strong>el espacio euclidiano deja de ser continuo y regular</strong>. La distancia entre dos números flotantes consecutivos en la recta numérica se denomina <strong>ULP (Unit in the Last Place)</strong>:
        </p>

        <div className="mt-3 overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`\text{ulp}(x) = 2^{\lfloor \log_2 |x| \rfloor - 23}`} block />
        </div>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          Esto significa que la resolución espacial de la GPU se degrada drásticamente cuanto más nos alejamos del origen de coordenadas del mundo:
        </p>

        {/* Tabla comparativa ULP */}
        <div className="mt-4 overflow-x-auto max-w-[65ch] border border-line rounded-sm">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-surface-2 text-ink border-b border-line">
              <tr>
                <th className="p-2.5">Magnitud de Coordenada (<Formula tex={String.raw`x`} />)</th>
                <th className="p-2.5">Exponente IEEE 754</th>
                <th className="p-2.5">Distancia entre floats (<Formula tex={String.raw`\text{ulp}`} />)</th>
                <th className="p-2.5">Resolución Física</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-dim">
              <tr>
                <td className="p-2.5 text-ink">1.0 metro</td>
                <td className="p-2.5">127 (<Formula tex={String.raw`2^0`} />)</td>
                <td className="p-2.5 text-mant font-bold">1.19 × 10⁻⁷ m</td>
                <td className="p-2.5">Nanométrica (Excelente)</td>
              </tr>
              <tr>
                <td className="p-2.5 text-ink">10.0 metros</td>
                <td className="p-2.5">130 (<Formula tex={String.raw`2^3`} />)</td>
                <td className="p-2.5 text-mant">9.54 × 10⁻⁷ m</td>
                <td className="p-2.5">Micrométrica</td>
              </tr>
              <tr>
                <td className="p-2.5 text-ink">1,000.0 metros (1 km)</td>
                <td className="p-2.5">136 (<Formula tex={String.raw`2^9`} />)</td>
                <td className="p-2.5 text-exp">6.10 × 10⁻⁵ m</td>
                <td className="p-2.5">0.06 milímetros</td>
              </tr>
              <tr>
                <td className="p-2.5 text-ink">50,000.0 metros (50 km)</td>
                <td className="p-2.5">142 (<Formula tex={String.raw`2^{15}`} />)</td>
                <td className="p-2.5 text-sign font-bold">3.91 × 10⁻³ m</td>
                <td className="p-2.5 text-sign">~4 milímetros (Crítica)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ¿Qué cambia con Precisión Doble (Float64 de 64 bits)? */}
        <div className="mt-8 border border-line rounded-sm p-4 bg-surface max-w-[65ch]">
          <h4 className="font-mono text-xs font-bold uppercase text-exp mb-2">
            ¿Qué Cambia con Precisión Doble (Float64 / binary64)?
          </h4>
          <p className="text-xs text-ink-dim leading-relaxed">
            Una alternativa aparente para erradicar el error de redondeo sería adoptar <strong className="text-ink">Float64</strong> (64 bits: 1 bit de signo, 11 de exponente y <strong>52 bits de mantisa</strong>).
          </p>
          <ul className="text-xs text-ink-dim space-y-2 list-disc pl-4 mt-3">
            <li>
              <strong className="text-ink">Ventaja Numérica Absoluta:</strong> El épsilon de máquina se reduce a <Formula tex={String.raw`\varepsilon_{\text{mach}} \approx 2.22 \times 10^{-16}`} /> (~16 dígitos decimales significativos). A una distancia de <Formula tex={String.raw`50\,000`} /> metros, el salto entre números consecutivos (<Formula tex={String.raw`\text{ulp}`} />) pasa de <code className="text-sign font-mono">~3.9 milímetros</code> en FP32 a <code className="text-mant font-mono">~7.28 × 10⁻¹² milímetros</code> (escala picométrica) en FP64. A este nivel, el <em>Shadow Acne</em> desaparece por completo sin trucos numéricos.
            </li>
            <li>
              <strong className="text-ink">El Costo Inviable en Hardware de GPU:</strong> En tarjetas gráficas de consumo (como NVIDIA GeForce RTX o AMD Radeon), las unidades aritméticas de 64 bits son severamente reducidas en silicio: su tasa de rendimiento es típicamente de <strong>1:64</strong> respecto a FP32 (~1.5% de velocidad).
            </li>
            <li>
              <strong className="text-ink">Presión de Memoria y Ancho de Banda:</strong> Cada dato ocupa el doble de VRAM (8 bytes vs 4 bytes), saturando los buses de memoria y reduciendo a la mitad los hilos concurrentes que pueden ejecutarse en cada multiprocesador (menor <em>warp occupancy</em>).
            </li>
          </ul>
          <p className="text-xs text-ink mt-3 pt-2 border-t border-line font-medium leading-relaxed">
            💡 <strong>Conclusión:</strong> En renderizado en tiempo real es inviable sacrificar el 98% del rendimiento usando FP64. Por esta razón, el estándar universal de la industria gráfica es <strong>mantener el cómputo en Float32 y neutralizar el error numérico mediante algoritmos de amortiguación y cotas adaptativas (<Formula tex={String.raw`\varepsilon`} />-bias)</strong>.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. GÉNESIS Y PROPAGACIÓN DEL ERROR */}
      {/* ========================================================================= */}
      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl text-ink font-medium">
          3. Génesis y Propagación del Error de Punto Flotante en el Algoritmo
        </h3>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          Siguiendo el modelo clásico de análisis de error inverso de Wilkinson, cada operación aritmética básica de punto flotante <Formula tex={String.raw`\odot \in \{+, -, \times, /\}`} /> ejecutada por una Unidad Aritmético-Lógica (ALU) de la GPU introduce una perturbación de redondeo acotada:
        </p>

        <div className="mt-3 overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`\text{fl}(a \odot b) = (a \odot b)(1 + \delta), \quad \text{con } |\delta| \le \varepsilon_{\text{mach}}`} block />
        </div>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          Al calcular el rebote rayo-plano, las operaciones encadenadas acumulan errores que culminan en un fallo geométrico grave:
        </p>

        {/* Desglose de Operaciones */}
        <div className="mt-6 space-y-4 max-w-[65ch]">
          {/* Operación 1 */}
          <div className="p-4 border border-line rounded-sm bg-surface">
            <h4 className="font-mono text-xs font-bold uppercase text-sign">
              Paso A: Resta de Posiciones y Cancelación Catastrófica
            </h4>
            <p className="text-xs text-ink-dim leading-relaxed mt-2">
              Al calcular <Formula tex={String.raw`\text{fl}(P_0 - O)`} />, si el origen del rayo se encuentra muy cerca de la superficie del plano (<Formula tex={String.raw`O \approx P_0`} />), se produce <strong>cancelación catastrófica</strong>: la resta de dos cantidades casi idénticas cancela los dígitos más significativos de la mantisa, dejando el resultado a merced del ruido en los bits de menor peso.
            </p>
          </div>

          {/* Operación 2 */}
          <div className="p-4 border border-line rounded-sm bg-surface">
            <h4 className="font-mono text-xs font-bold uppercase text-exp">
              Paso B: Productos Punto y Pérdida en Ángulos Rasantes
            </h4>
            <p className="text-xs text-ink-dim leading-relaxed mt-2">
              El producto punto acumula 3 multiplicaciones y 2 adiciones:
            </p>
            <div className="my-2 bg-surface-2 p-2 rounded-sm border border-line">
              <Formula tex={String.raw`\text{fl}(D \cdot N) = \sum_{i=1}^3 D_i N_i (1 + \gamma_3), \quad |\gamma_3| \le \frac{3\varepsilon_{\text{mach}}}{1 - 3\varepsilon_{\text{mach}}}`} block />
            </div>
            <p className="text-xs text-ink-dim leading-relaxed">
              Cuando el rayo incide de forma casi paralela a la superficie (<strong>ángulo rasante</strong>, <Formula tex={String.raw`\theta \to 90^\circ`} />), el valor analítico <Formula tex={String.raw`D \cdot N \to 0`} />. El término queda completamente dominado por el error de redondeo de la mantisa.
            </p>
          </div>

          {/* Operación 3 */}
          <div className="p-4 border border-line rounded-sm bg-surface">
            <h4 className="font-mono text-xs font-bold uppercase text-sign">
              Paso C: División Mal Condicionada
            </h4>
            <p className="text-xs text-ink-dim leading-relaxed mt-2">
              La evaluación del parámetro <Formula tex={String.raw`t_{\text{hit}}^* = \text{fl}\left(\frac{(P_0 - O) \cdot N}{D \cdot N}\right)`} /> implica dividir por un número infinitesimalmente pequeño en ángulos rasantes. El número de condición relativo de la función división <Formula tex={String.raw`f(y) = x / y`} /> es:
            </p>
            <div className="my-2 bg-surface-2 p-2 rounded-sm border border-line">
              <Formula tex={String.raw`\kappa = \left| \frac{y f'(y)}{f(y)} \right| = \left| \frac{y (-x/y^2)}{x/y} \right| = 1`} block />
            </div>
            <p className="text-xs text-ink-dim leading-relaxed">
              Sin embargo, el error absoluto en <Formula tex={String.raw`t`} /> ante una perturbación <Formula tex={String.raw`\delta`} /> en el denominador es <Formula tex={String.raw`\Delta t \approx \frac{(P_0 - O) \cdot N}{(D \cdot N)^2} \delta`} />. ¡Crece con el cuadrado del divisor inverso, disparando la incertidumbre de la distancia!
            </p>
          </div>

          {/* Operación 4: El Teorema del Error Residual */}
          <div className="p-4 border border-line rounded-sm bg-surface">
            <h4 className="font-mono text-xs font-bold uppercase text-mant">
              Paso D: El Teorema del Error Residual en la Posición de Impacto
            </h4>
            <p className="text-xs text-ink-dim leading-relaxed mt-2">
              Al multiplicar <Formula tex={String.raw`\text{fl}(t_{\text{hit}}^* D)`} /> y sumarlo al origen <Formula tex={String.raw`O`} />, la posición calculada por la GPU es:
            </p>
            <div className="my-2 bg-surface-2 p-2 rounded-sm border border-line">
              <Formula tex={String.raw`P_{\text{hit}}^* = \text{fl}(O + \text{fl}(t_{\text{hit}}^* D)) = P_{\text{hit}} + \Delta P`} block />
            </div>
            <p className="text-xs text-ink-dim leading-relaxed">
              Si evaluamos este punto calculado <Formula tex={String.raw`P_{\text{hit}}^*`} /> en la ecuación implícita del plano, matemáticamente debería dar exactamente cero. Sin embargo, en silicio:
            </p>
            <div className="my-2 bg-surface-2 p-2 rounded-sm border border-line">
              <Formula tex={String.raw`(P_{\text{hit}}^* - P_0) \cdot N = \Delta P \cdot N \neq 0`} block />
            </div>
          </div>
        </div>

        {/* La Consecuencia Destructiva: Auto-Intersección */}
        <div className="mt-8 border border-sign/40 bg-sign/5 p-5 rounded-sm max-w-[65ch]">
          <h4 className="font-mono text-sm font-bold uppercase text-sign flex items-center gap-2">
            La Catástrofe Numérica: Shadow Acne y Auto-Intersección
          </h4>
          <p className="text-xs text-ink-dim leading-relaxed mt-2">
            Aproximadamente en el <strong>50% de las evaluaciones</strong>, el redondeo en la mantisa provoca que <Formula tex={String.raw`\Delta P \cdot N < 0`} />. Esto significa que:
          </p>
          <div className="p-3 bg-bg/80 border border-sign/30 rounded-sm my-3 font-mono text-xs text-sign font-semibold text-center">
            ¡El punto calculado <Formula tex={String.raw`P_{\text{hit}}^*`} /> se ubica físicamente DETRÁS o DEBAJO de la superficie del plano!
          </div>
          <p className="text-xs text-ink-dim leading-relaxed">
            Cuando el motor de renderizado genera el rayo de rebote <Formula tex={String.raw`R_{\text{sec}}(t)`} /> usando <Formula tex={String.raw`P_{\text{hit}}^*`} /> como nuevo origen y evalúa nuevamente la colisión contra los objetos de la escena (incluyendo el mismo plano), ocurre lo siguiente:
          </p>
          <div className="my-3 bg-surface p-3 rounded-sm border border-line">
            <Formula tex={String.raw`t_{\text{sec}} = \frac{(P_0 - P_{\text{hit}}^*) \cdot N}{D_{\text{refl}} \cdot N} = \frac{-\Delta P \cdot N}{D_{\text{refl}} \cdot N}`} block />
          </div>
          <p className="text-xs text-ink-dim leading-relaxed">
            Como <Formula tex={String.raw`\Delta P \cdot N < 0`} />, el numerador resulta positivo (<Formula tex={String.raw`-\Delta P \cdot N > 0`} />). Dado que el rayo reflejado apunta hacia afuera (<Formula tex={String.raw`D_{\text{refl}} \cdot N > 0`} />), se obtiene una distancia:
          </p>
          <div className="p-2 bg-surface-2 rounded-sm border border-line text-center font-mono text-xs text-sign font-bold my-2">
            <Formula tex={String.raw`t_{\text{sec}} \approx +10^{-6} > 0`} /> (¡Intersección Espuria Inmediata!)
          </div>
          <p className="text-xs text-ink-dim leading-relaxed">
            La GPU concluye erróneamente que el rayo acaba de colisionar contra la <em>misma superficie de la que acaba de nacer</em>. Esto bloquea la iluminación, generando estrías oscuras y manchas negras conocidas como <strong>Shadow Acne</strong>, o si la pared es delgada, el rayo se fuga hacia la habitación trasera (<strong>Light Leaking</strong>).
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMULADOR INTERACTIVO */}
      {/* ========================================================================= */}
      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl text-ink font-medium">
          Demostración Interactiva en Silicio
        </h3>
        <p className="mt-2 max-w-[65ch] text-ink-dim leading-relaxed">
          Prueba en tiempo real cómo interactúa la aritmética de 32 bits (<code className="font-mono text-xs">Math.fround</code>) al variar el ángulo de incidencia y la escala del mundo. Observa la absorción del epsilon estático y cómo la cota adaptativa resuelve la auto-intersección:
        </p>

        <LaboratorioRebotePlano />
      </div>

      {/* ========================================================================= */}
      {/* 4. CORRECCIÓN MATEMÁTICA DEL ERROR */}
      {/* ========================================================================= */}
      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl text-ink font-medium">
          4. Corrección Matemática del Error (Mitigación Formal)
        </h3>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          Para que el rayo secundario pueda escapar de la superficie sin auto-interceptarse, el nuevo origen <Formula tex={String.raw`O_{\text{sec}}`} /> debe ser desplazado fuera de la zona de incertidumbre de la mantisa. A lo largo de la historia de la computación gráfica se han utilizado dos enfoques:
        </p>

        {/* Método 1: Epsilon Estático y su Colapso */}
        <div className="mt-6 border border-line rounded-sm p-4 bg-surface max-w-[65ch]">
          <h4 className="font-mono text-xs font-bold uppercase text-sign mb-2">
            Enfoque Empírico: Desplazamiento Estático (<Formula tex={String.raw`\epsilon`} />-Offset Fijo)
          </h4>
          <div className="my-2 bg-surface-2 p-2 rounded-sm border border-line">
            <Formula tex={String.raw`O_{\text{sec}} = P_{\text{hit}}^* + \epsilon N, \quad \text{con } \epsilon = 10^{-4}`} block />
          </div>
          <p className="text-xs text-ink-dim leading-relaxed mt-2">
            Este método primitivo suma una constante fija (típicamente <Formula tex={String.raw`10^{-4}`} /> o <Formula tex={String.raw`10^{-3}`} />) en dirección de la normal. Aunque parece intuitivo, <strong>colapsa matemáticamente en dos situaciones opuestas</strong>:
          </p>
          <ul className="text-xs text-ink-dim space-y-2 list-disc pl-4 mt-3">
            <li>
              <strong className="text-ink">Fallo por Absorción de Mantisa a Gran Escala:</strong> En escenas amplias (ej. coordenadas <Formula tex={String.raw`X \ge 50\,000`} />), el ULP en Float32 es <Formula tex={String.raw`\text{ulp}(50\,000) \approx 0.0039`} />. Como <Formula tex={String.raw`\epsilon = 0.0001 < \frac{1}{2}\text{ulp}`} />, la regla de redondeo al más cercano de IEEE 754 produce:
              <div className="p-2 bg-bg rounded-sm font-mono text-[11px] text-sign my-1 text-center font-bold">
                <Formula tex={String.raw`\text{fl}(50\,000.0 + 0.0001) \equiv 50\,000.0`} /> (¡Absorción total, offset nulo!)
              </div>
              El desplazamiento se desvanece por completo y el Shadow Acne reaparece intacto.
            </li>
            <li>
              <strong className="text-ink">Fallo por Desconexión de Sombras (Peter-Panning):</strong> En geometrías de pequeña escala o ángulos rasantes, una constante fija de <Formula tex={String.raw`10^{-3}`} /> desplaza el rayo visiblemente lejos de la superficie, haciendo que las sombras proyectadas parezcan "flotar" despegadas de los objetos.
            </li>
          </ul>
        </div>

        {/* Método 2: Cotas de Error Adaptativas de Pharr, Jakob & Humphreys */}
        <div className="mt-8 border border-mant/40 rounded-sm p-5 bg-surface max-w-[65ch]">
          <h4 className="font-mono text-xs font-bold uppercase text-mant mb-2">
            Enfoque Riguroso: Cotas de Error Adaptativas y Forward Error Analysis (PBRT v4)
          </h4>
          <p className="text-xs text-ink-dim leading-relaxed">
            En la 4ta edición del texto canónico <em>Physically Based Rendering: From Theory to Implementation</em> (Pharr, Jakob & Humphreys, 2023), los autores formalizan una solución matemáticamente rigurosa que calcula una <strong>caja de incertidumbre conservadora</strong> alrededor de cada punto de intersección.
          </p>

          <p className="text-xs text-ink-dim leading-relaxed mt-3">
            Definiendo el factor de acumulación de error de orden <Formula tex={String.raw`n`} />:
          </p>
          <div className="my-2 bg-surface-2 p-2.5 rounded-sm border border-line">
            <Formula tex={String.raw`\gamma_n = \frac{n \varepsilon_{\text{mach}}}{1 - n \varepsilon_{\text{mach}}}, \quad \text{donde } \varepsilon_{\text{mach}} = 2^{-24}`} block />
          </div>

          <p className="text-xs text-ink-dim leading-relaxed mt-3">
            El vector de cota de error absoluto para la coordenada calculada <Formula tex={String.raw`P_{\text{hit}}^*`} /> se deduce propagando el error a través de la multiplicación y la suma:
          </p>
          <div className="my-2 bg-surface-2 p-2.5 rounded-sm border border-line">
            <Formula tex={String.raw`\delta P = \gamma_3 (|O| + |t_{\text{hit}}^* D|) = (\delta_x, \delta_y, \delta_z)`} block />
          </div>

          <p className="text-xs text-ink-dim leading-relaxed mt-3">
            Para garantizar que el nuevo origen quede estrictamente en el semiespacio exterior correcto, se proyecta la caja de incertidumbre <Formula tex={String.raw`\delta P`} /> sobre la normal del plano, obteniendo el <strong>desplazamiento seguro analítico mínimo (<Formula tex={String.raw`d_{\text{safe}}`} />)</strong>:
          </p>
          <div className="my-2 bg-surface-2 p-2.5 rounded-sm border border-line">
            <Formula tex={String.raw`d_{\text{safe}} = |\delta P \cdot N| = |\delta_x N_x| + |\delta_y N_y| + |\delta_z N_z|`} block />
          </div>

          <p className="text-xs text-ink-dim leading-relaxed mt-3">
            El nuevo origen secundario se calcula sumando este desplazamiento conservador orientado con la dirección del rayo de salida:
          </p>
          <div className="my-2 bg-surface-2 p-2.5 rounded-sm border border-line">
            <Formula tex={String.raw`O_{\text{sec}} = P_{\text{hit}}^* + \text{sign}(D_{\text{refl}} \cdot N) \cdot (d_{\text{safe}} + \text{ulp}(P_{\text{hit}}^*)) \cdot N`} block />
          </div>

          <p className="text-xs text-mant font-medium leading-relaxed mt-3">
            ✓ <strong>Garantía Matemática:</strong> Esta formulación asegura de manera analítica que <Formula tex={String.raw`(O_{\text{sec}} - P_0) \cdot N > 0`} /> en todo el dominio representable de IEEE 754, eliminando el 100% de las auto-intersecciones sin importar si el rayo se calculó en <Formula tex={String.raw`X = 1`} /> o en <Formula tex={String.raw`X = 100\,000`} />.
          </p>
        </div>

        {/* Renormalización obligatoria de D_refl */}
        <h4 className="mt-8 font-display text-base text-ink font-medium">
          Renormalización Obligatoria del Vector de Rebote
        </h4>
        <p className="mt-2 max-w-[65ch] text-ink-dim leading-relaxed">
          Finalmente, debido a los errores de redondeo en el cálculo <Formula tex={String.raw`\text{fl}(D - 2(D \cdot N)N)`} />, la norma euclidiana del vector reflejado resultante no es idéntica a 1:
        </p>

        <div className="mt-3 overflow-x-auto rounded-sm border border-line bg-surface p-3 max-w-max">
          <Formula tex={String.raw`\|D_{\text{refl}}^*\| = \sqrt{\text{fl}(D_x^2 + D_y^2 + D_z^2)} \neq 1.0`} block />
        </div>

        <p className="mt-3 max-w-[65ch] text-ink-dim leading-relaxed">
          En simulaciones de múltiples rebotes (como caminos de Markov en Path Tracing), este desvío de norma se acumula exponencialmente (<Formula tex={String.raw`\|D\|_k \approx (1 + \delta)^k`} />), distorsionando las integrales de transmitancia y flujo radiométrico. Por ello, la GPU debe ejecutar una renormalización explícita mediante la instrucción de hardware de raíz cuadrada inversa rápida (<code className="font-mono text-xs text-exp">rsqrt</code>):
        </p>

        <div className="mt-3 overflow-x-auto rounded-sm border border-line bg-surface p-3 max-w-max">
          <Formula tex={String.raw`D_{\text{refl}} \leftarrow D_{\text{refl}} \times \text{rsqrt}(D_{\text{refl}} \cdot D_{\text{refl}})`} block />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BIBLIOGRAFÍA Y REFERENCIAS */}
      {/* ========================================================================= */}
      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl text-ink font-medium">
          5. Bibliografía y Referencias Académicas
        </h3>

        <p className="mt-2 max-w-[65ch] text-ink-dim leading-relaxed">
          Este formalismo matemático y el análisis de errores de punto flotante en silicio se fundamentan en las siguientes obras canónicas de la literatura de gráficos por computadora y análisis numérico:
        </p>

        <div className="mt-6 space-y-4 max-w-[65ch]">
          <div className="border border-line rounded-sm p-4 bg-surface text-xs leading-relaxed">
            <p className="font-mono text-ink font-semibold">
              Pharr, M., Jakob, W., & Humphreys, G. (2023).
            </p>
            <p className="text-ink-dim mt-1">
              <em>Physically Based Rendering: From Theory to Implementation</em> (4th ed.). MIT Press.
            </p>
            <p className="text-ink-faint mt-1">
              Capítulo 3: <em>Geometry and Transformations</em>, Sección 3.9: <em>Managing Rounding Error in Intersections</em>. Formalización de la cota de error conservadora (<Formula tex={String.raw`\gamma_n`} />) y cálculo del desplazamiento adaptativo sobre normales.
            </p>
          </div>

          <div className="border border-line rounded-sm p-4 bg-surface text-xs leading-relaxed">
            <p className="font-mono text-ink font-semibold">
              Shirley, P., & Morley, R. K. (2008).
            </p>
            <p className="text-ink-dim mt-1">
              <em>Realistic Ray Tracing</em> (2nd ed.). A. K. Peters / CRC Press.
            </p>
            <p className="text-ink-faint mt-1">
              Capítulo 2: <em>Ray-Surface Intersection</em>. Análisis fundamental de la intersección analítica con planos y discusión sobre la tolerancia <Formula tex={String.raw`t_{\min}`} /> para evitar el acné de sombras superficial.
            </p>
          </div>

          <div className="border border-line rounded-sm p-4 bg-surface text-xs leading-relaxed">
            <p className="font-mono text-ink font-semibold">
              Glassner, A. S. (1989).
            </p>
            <p className="text-ink-dim mt-1">
              <em>An Introduction to Ray Tracing</em>. Academic Press.
            </p>
            <p className="text-ink-faint mt-1">
              Capítulo 2: <em>Essential Ray Tracing Algorithms</em>. Formulación clásica de la ley de reflexión vectorial y consideraciones numéricas pioneras sobre la precisión de los rayos secundarios.
            </p>
          </div>

          <div className="border border-line rounded-sm p-4 bg-surface text-xs leading-relaxed">
            <p className="font-mono text-ink font-semibold">
              IEEE Computer Society. (2019).
            </p>
            <p className="text-ink-dim mt-1">
              <em>IEEE Standard for Floating-Point Arithmetic</em> (IEEE Std 754-2019). IEEE.
            </p>
            <p className="text-ink-faint mt-1">
              Definición normativa del formato <code className="font-mono text-ink">binary32</code>, especificación de operaciones elementales con redondeo al número par más cercano y cotas de error de redondeo de máquina (<Formula tex={String.raw`\varepsilon_{\text{mach}}`} />).
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
