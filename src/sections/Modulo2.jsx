import Section from "../components/Section.jsx";
import Formula from "../components/Formula.jsx";
import BVHVisualizer from "../components/BVHVisualizer.jsx";

export default function Modulo2() {
  return (
    <Section
      id="modulo-2"
      index="03"
      accent="mant"
      variant="page"
      title="Trazado de Rayos y Optimización en GPU"
      subtitle="El enfoque geométrico y cómo el hardware actual lidia con la precisión para procesar el comportamiento físico de la luz."
    >
      <p className="max-w-[65ch] text-ink-dim">
        A diferencia de la rasterización, el trazado de rayos (Ray Tracing) simula el recorrido de los fotones reales, calculando sus intersecciones exactas con la geometría de la escena. Este enfoque es físicamente preciso pero requiere un poder de cómputo inmenso, lo que nos obliga a analizar cómo las GPU interactúan con el estándar IEEE 754 para optimizar estas matemáticas al extremo.
      </p>

      {/* 1. Matemática de la Intersección */}
      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl text-ink font-medium">1. La Matemática de la Intersección</h3>
        
        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          Imagina que tu pantalla es una ventana y tus ojos disparan lásers (rayos) a través de cada píxel hacia el mundo virtual. El trabajo de la GPU es descubrir contra qué objeto choca primero ese láser para decidir de qué color pintar el píxel. Esto suena simple, pero en un mundo 3D lleno de triángulos, es un problema matemático brutal.
        </p>

        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          Para saber si un rayo perfora un polígono, los motores gráficos usan algoritmos analíticos como el de <strong>Möller-Trumbore</strong>. La idea detrás de este algoritmo se traduce en resolver un sistema de ecuaciones matriciales. En lenguaje sencillo: cruzamos la ecuación de una línea recta (el rayo láser) con la ecuación de un plano (el triángulo).
        </p>
        
        <div className="mt-6 overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`\begin{bmatrix} -D & V_1 - V_0 & V_2 - V_0 \end{bmatrix} \begin{bmatrix} t \\ u \\ v \end{bmatrix} = O - V_0`} block />
        </div>
        
        <div className="mt-6 flex flex-col gap-2 max-w-[65ch] bg-surface-2 p-4 rounded-sm border border-line border-l-4 border-l-sign">
          <p className="text-sm text-ink-dim font-mono mb-2 uppercase font-bold text-sign">Desmenuzando la matriz:</p>
          <ul className="text-sm text-ink-dim space-y-3 list-disc pl-4">
            <li><strong>D (Dirección) y O (Origen):</strong> Es la cámara disparando la luz.</li>
            <li><strong>V₀, V₁, V₂ (Vértices):</strong> Son las tres esquinas del triángulo.</li>
            <li><strong>t (Distancia):</strong> "A cuántos metros viajó la luz antes de chocar".</li>
            <li><strong>u, v (Coordenadas Baricéntricas):</strong> Coordenadas internas del triángulo. Si <code>u + v</code> superan el 100%, significa que el rayo pasó por <em>afuera</em> del triángulo (¡falló el tiro!).</li>
          </ul>
        </div>

        <p className="mt-6 max-w-[65ch] text-ink-dim leading-relaxed">
          Para que el computador obtenga los números <code>t, u, v</code> necesita calcular determinantes y multiplicaciones cruzadas (usando la Regla de Cramer). Si el juego corre a 60 fotogramas por segundo (FPS) en resolución 4K, la GPU debe hacer esta matemática <strong>cientos de miles de millones de veces por segundo</strong>. ¡Es una locura computacional!
        </p>
      </div>

      {/* 2. Float32 vs Float16 */}
      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl text-ink font-medium">2. El Problema de la Precisión</h3>
        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          Como señalamos en la intuición inicial, podríamos vernos tentados a utilizar precisión reducida (<code className="font-mono text-xs text-ink bg-line px-1 rounded-sm">Float16</code>) indiscriminadamente para lograr mayor paralelismo. Sin embargo, en el trazado espacial, esto genera errores visuales catastróficos.
        </p>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[65ch]">
          <div className="border border-line rounded-sm p-4 bg-surface hover:border-sign transition-colors">
            <h4 className="text-sign font-mono text-[11px] font-bold uppercase mb-3">Peligro en Float16 (Geometría)</h4>
            <p className="text-ink-dim text-sm leading-relaxed mb-3">
              La reducción abrupta de bits en la mantisa provoca que los vértices del espacio 3D no puedan guardar una posición exacta y "encajen" en posiciones discretas (<strong>grid snapping</strong>).
            </p>
            <p className="text-ink-dim text-sm leading-relaxed">
              Esto produce huecos visibles en las mallas o un defecto fatal llamado <strong>Shadow Acne</strong> (acné de sombras). Este problema ocurre cuando, por un error de redondeo microscópico (perder precisión decimal), la GPU calcula que el punto de impacto del rayo está ligeramente "por debajo" de la superficie. Como resultado, la superficie proyecta una sombra sobre sí misma, creando franjas o puntos negros que arruinan la imagen.
            </p>
          </div>
          
          <div className="border border-line rounded-sm p-4 bg-surface hover:border-mant transition-colors">
            <h4 className="text-mant font-mono text-[11px] font-bold uppercase mb-3">Ventaja en Float16 (Color/Luz)</h4>
            <p className="text-ink-dim text-sm leading-relaxed">
              Para resolver lo anterior, las GPU modernas realizan el cálculo estricto de posición e intersección geométrica usando obligatoriamente <code className="font-mono text-xs">Float32</code>. Sin embargo, una vez confirmada la colisión, el problema geométrico termina. Operaciones posteriores como la mezcla de texturas, atenuación de luz y gradientes de color se degradan deliberadamente a <code className="font-mono text-xs">Float16</code>. El ojo humano es pésimo diferenciando variaciones de luz tan sutiles, logrando que la GPU ahorre hasta la mitad de memoria sin pérdida visual.
            </p>
          </div>
        </div>
        
        <div className="mt-6 max-w-[65ch] flex flex-col border border-line rounded-sm bg-bg overflow-hidden relative group">
          <img 
            src="/shadow-acne.png" 
            alt="Ejemplo de defecto visual Shadow Acne" 
            className="w-full h-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="p-3 bg-surface-2 border-t border-line">
            <p className="text-xs text-ink-dim font-mono">
              <span className="text-sign font-bold">Arriba:</span> Ejemplo visual de "Shadow Acne". Las estrías y puntos oscuros son la superficie auto-sombreada por errores de precisión de punto flotante en el cálculo de la colisión.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Aceleración por Hardware (BVH) */}
      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl text-ink font-medium">3. Aceleración por Hardware (BVH y RT Cores)</h3>
        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          Históricamente (antes de 2018), el trazado de rayos solo se utilizaba en películas de animación, ya que calcular el choque de la luz mediante CPU para cada pixel tardaba <em>horas por fotograma</em>. Evaluar el sistema de ecuaciones para millones de triángulos de manera bruta (fuerza bruta) era inviable para jugar a 60 FPS.
        </p>
        
        <p className="mt-4 max-w-[65ch] text-ink-dim leading-relaxed">
          Para sortear esto, las gráficas emplean estructuras de datos llamadas <strong>BVH (Bounding Volume Hierarchy)</strong> y hardware dedicado.
        </p>

        <div className="mt-6 flex flex-col gap-2 max-w-[65ch] bg-surface-2 p-4 rounded-sm border border-line border-l-4 border-l-mant">
          <p className="text-sm text-ink-dim font-mono mb-2 uppercase font-bold text-mant">La Matemática detrás del RT Core:</p>
          <p className="text-sm text-ink-dim leading-relaxed">
            Las tarjetas actuales incluyen <strong>RT Cores</strong>. En lugar de hacer multiplicaciones complejas contra geometría detallada, los RT Cores ejecutan el algoritmo <em>"Slabs Method"</em> para evaluar Cajas Delimitadoras Alineadas a los Ejes (AABB).
          </p>
          <p className="text-sm text-ink-dim leading-relaxed mt-2">
            El <em>Slabs Method</em> se reduce a matemáticas increíblemente rápidas: simples sumas, restas y multiplicaciones por inversos para hallar el valor <code>Min</code> y <code>Max</code> en los ejes X, Y y Z. El circuito lógico del RT Core está soldado literalmente en el chip de silicio para procesar estas restas y multiplicaciones instantáneamente. Si el test de la caja resulta falso, la GPU descarta todo lo que hay adentro sin tener que mirar un solo triángulo.
          </p>
        </div>
        
        {/* Componente Interactivo */}
        <BVHVisualizer />
      </div>

    </Section>
  );
}
