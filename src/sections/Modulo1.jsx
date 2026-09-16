import { useState } from "react";
import Section from "../components/Section.jsx";
import Formula from "../components/Formula.jsx";

// Función que replica exactamente el bit hack y Newton-Raphson de C en JS
function calculateFastInverseSqrt(inputValue) {
  const x = Math.max(0.000001, parseFloat(inputValue) || 1.0);
  const buffer = new ArrayBuffer(4);
  const floatView = new Float32Array(buffer);
  const intView = new Int32Array(buffer);

  // xhalf = 0.5F * number;
  const xhalf = 0.5 * x;

  // y = number; i = * ( long * ) &y;
  floatView[0] = x;
  let i = intView[0];

  // i = 0x5f3759df - ( i >> 1 );
  i = 0x5f3759df - (i >> 1);
  intView[0] = i;

  // y = * ( float * ) &i;
  const y0 = floatView[0]; // 0 iteraciones (Solo Bit Hack)

  // 1ra iteración: y = y * ( threehalfs - ( xhalf * y * y ) );
  const y1 = y0 * (1.5 - xhalf * y0 * y0);

  // 2da iteración
  const y2 = y1 * (1.5 - xhalf * y1 * y1);

  // Valor exacto con Math.sqrt
  const exact = 1 / Math.sqrt(x);

  const err0 = Math.abs((y0 - exact) / exact) * 100;
  const err1 = Math.abs((y1 - exact) / exact) * 100;
  const err2 = Math.abs((y2 - exact) / exact) * 100;

  return { x, y0, y1, y2, exact, err0, err1, err2, hexBits: "0x" + (i >>> 0).toString(16).toUpperCase() };
}

export default function Modulo1() {
  const [inputValue, setInputValue] = useState("16.0");
  const results = calculateFastInverseSqrt(inputValue);

  return (
    <Section
      id="modulo-1"
      index="02"
      accent="exp"
      variant="page"
      title="Optimización de bits y Raíz Cuadrada Inversa Rápida"
      subtitle="El algoritmo Fast Inverse Square Root (Quake III Arena, 1999): cómo calcular 1/√x mediante manipulación binaria directa y Newton-Raphson."
    >
      {/* 1. Importancia y Problema que resuelve */}
      <div className="space-y-4">
        <strong className="block text-xl text-ink font-display">
          ¿Por qué es importante y qué problemas resuelve?
        </strong>
        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          En los gráficos 3D en tiempo real (iluminación de Phong, cálculo de sombreado, reflexiones y trazado de rayos), es indispensable medir la dirección de los rayos de luz y de las normales de las superficies. Esto requiere normalizar vectores tridimensionales constantemente para convertirlos en vectores unitarios:
        </p>

        <div className="overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`\hat{v} = \frac{v}{\|v\|} = v \cdot \frac{1}{\sqrt{v_x^2 + v_y^2 + v_z^2}}`} block />
        </div>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          A finales de la década de 1990, realizar una división y una raíz cuadrada en hardware de punto flotante convencional era extremadamente lento. El algoritmo no calcula la raíz cuadrada para después dividir entre 1, sino que aproxima directamente la <strong>raíz cuadrada inversa</strong> (<Formula tex="1/\sqrt{x}" />) operando los bits del número flotante como un entero de 32 bits en tiempo récord.
        </p>
      </div>

      {/* 2. Código del Algoritmo (Quake III Arena) - Ventana Ampliada */}
      <div className="mt-12 border-t border-line pt-8 space-y-6">
        <strong className="block text-xl text-ink font-display">
          Código del Algoritmo (Quake III Arena)
        </strong>
        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          Este es el código C original utilizado en la función <code>Q_rsqrt</code> del motor gráfico de Quake III Arena:
        </p>

        <div className="w-full max-w-4xl overflow-x-auto rounded-sm border border-line bg-surface-2 p-5 font-mono text-xs sm:text-sm text-ink shadow-lg">
          <pre>{`float Q_rsqrt( float number )
{
    long i;
    float xhalf, y;
    const float threehalfs = 1.5F;

    xhalf = 0.5F * number;
    y  = number;
    i  = * ( long * ) &y;                       // evil floating point bit level hacking
    i  = 0x5f3759df - ( i >> 1 );               // what the fuck? 
    y  = * ( float * ) &i;
    y  = y * ( threehalfs - ( xhalf * y * y ) ); // 1st iteration
    // y  = y * ( threehalfs - ( xhalf * y * y ) ); // 2nd iteration, this can be removed

    return y;
}`}</pre>
        </div>
      </div>

      {/* 3. Ejecución e Inspección en Tiempo Real */}
      <div className="mt-10 border border-line rounded-sm bg-surface p-6 max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <strong className="text-base text-ink font-display block">
              Simulador de Ejecución
            </strong>
            <span className="text-xs text-ink-dim font-mono">
              Prueba cualquier valor x y observa la aproximación binaria y el error de cada etapa.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="input-x" className="font-mono text-xs text-ink-dim">
              x =
            </label>
            <input
              id="input-x"
              type="number"
              step="any"
              min="0.0001"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-bg border border-line rounded-sm px-3 py-1 font-mono text-sm text-ink w-32 focus:outline-none focus:border-mant"
            />
          </div>
        </div>

        {/* Muestra de Resultados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="border border-line rounded-sm p-3 bg-surface-2">
            <span className="text-ink-faint uppercase block mb-1">Valor Exacto (1/√x)</span>
            <span className="text-sm font-bold text-ink">{results.exact.toFixed(6)}</span>
          </div>

          <div className="border border-line rounded-sm p-3 bg-surface-2">
            <span className="text-sign uppercase block mb-1">0 Iter. (Solo Bit Hack)</span>
            <span className="text-sm font-bold text-ink block">{results.y0.toFixed(6)}</span>
            <span className="text-[10px] text-sign">Error: {results.err0.toFixed(2)}%</span>
            <span className="text-[10px] text-ink-faint block mt-1">Hex: {results.hexBits}</span>
          </div>

          <div className="border border-line rounded-sm p-3 bg-surface-2 border-l-2 border-l-mant">
            <span className="text-mant uppercase font-bold block mb-1">1 Iter. (Quake III)</span>
            <span className="text-sm font-bold text-ink block">{results.y1.toFixed(6)}</span>
            <span className="text-[10px] text-mant font-bold">Error: {results.err1.toFixed(4)}%</span>
          </div>

          <div className="border border-line rounded-sm p-3 bg-surface-2">
            <span className="text-exp uppercase block mb-1">2 Iteraciones</span>
            <span className="text-sm font-bold text-ink block">{results.y2.toFixed(6)}</span>
            <span className="text-[10px] text-exp">Error: {results.err2.toFixed(6)}%</span>
          </div>
        </div>
      </div>

      {/* 4. Demostración y Aproximación Matemática */}
      <div className="mt-12 border-t border-line pt-8 space-y-6">
        <strong className="block text-xl text-ink font-display">
          Demostración y Aproximación Matemática
        </strong>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          Un número en formato IEEE 754 de 32 bits representa un valor real <Formula tex="x" /> mediante su exponente <Formula tex="E" /> (con sesgo 127) y su mantisa <Formula tex="M = m / 2^{23}" />:
        </p>

        <div className="overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`x = (1 + M) \cdot 2^{E - 127}`} block />
        </div>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          Cuando la memoria de la máquina reinterpreta esos mismos 32 bits directamente como si fueran un entero <Formula tex="I_x" />, la representación interna responde a:
        </p>

        <div className="overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`I_x = E \cdot 2^{23} + m = 2^{23} (E + M)`} block />
        </div>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          Al calcular el logaritmo en base 2 de <Formula tex="x" />, y utilizando la aproximación lineal <Formula tex="\log_2(1 + M) \approx M + \mu" /> (con <Formula tex="\mu \approx 0.043035" />):
        </p>

        <div className="overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`\log_2(x) = \log_2(1 + M) + (E - 127) \approx M + \mu + E - 127`} block />
        </div>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          Sustituyendo esta igualdad dentro de la expresión del entero <Formula tex="I_x" />, obtenemos la relación clave entre el entero representado y el logaritmo en punto flotante:
        </p>

        <div className="overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`I_x \approx 2^{23} (\log_2(x) + 127 - \mu)`} block />
        </div>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          Buscamos evaluar <Formula tex="y = x^{-1/2}" />, lo que implica que <Formula tex="\log_2(y) = -\frac{1}{2} \log_2(x)" />. Despejando la representación entera del resultado <Formula tex="I_y" />:
        </p>

        <div className="overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`I_y \approx \frac{3}{2} 2^{23} (127 - \mu) - \frac{1}{2} I_x`} block />
        </div>

        <div className="max-w-[65ch] bg-surface-2 p-4 rounded-sm border border-line border-l-4 border-l-exp">
          <strong className="text-xs font-mono uppercase text-exp block mb-1">
            Origen de la Constante Mágica
          </strong>
          <p className="text-sm text-ink-dim leading-relaxed">
            Evaluando el término constante <Formula tex="K = \frac{3}{2} 2^{23} (127 - \mu)" /> en representación hexadecimal da como resultado el famoso valor <code>0x5F3759DF</code>. En el código, la resta <code>{"i >> 1"}</code> desplaza los bits un lugar a la derecha, equivaliendo exactamente a la división entre 2 (<Formula tex="\frac{1}{2} I_x" />).
          </p>
        </div>
      </div>

      {/* 5. Refinamiento mediante Newton-Raphson */}
      <div className="mt-12 border-t border-line pt-8 space-y-6">
        <strong className="block text-xl text-ink font-display">
          Refinamiento: Método de Newton-Raphson
        </strong>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          La aproximación por bits nos da una estimación inicial cercana pero imperfecta. Para llevarla al rango de precisión necesario en gráficos, se aplica una iteración del método de Newton-Raphson sobre la función <Formula tex="f(y) = \frac{1}{y^2} - x = 0" />:
        </p>

        <div className="overflow-x-auto rounded-sm border border-line bg-surface p-4 max-w-max">
          <Formula tex={String.raw`y_{n+1} = y_n - \frac{f(y_n)}{f'(y_n)} = y_n \left(1.5 - 0.5 \cdot x \cdot y_n^2\right)`} block />
        </div>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          Lo relevante de esta formulación es que **no requiere ninguna división**, solo multiplicaciones y restas extremadamente rápidas.
        </p>
      </div>

      {/* 6. ¿Por qué solo 1 iteración? */}
      <div className="mt-12 border-t border-line pt-8 space-y-6">
        <strong className="block text-xl text-ink font-display">
          ¿Por qué NO se utiliza más de una iteración?
        </strong>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          Dado que la constante mágica entrega una estimación inicial con un error cercano al 3.5%–5%, una sola iteración reduce drásticamente el error a valores imperceptibles:
        </p>

        <div className="max-w-[65ch] overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse border border-line">
            <thead>
              <tr className="bg-surface-2 text-ink">
                <th className="border border-line p-3 font-mono text-xs">Etapa</th>
                <th className="border border-line p-3 font-mono text-xs">Error Relativo Máx.</th>
                <th className="border border-line p-3 font-mono text-xs">Costo Operativo</th>
              </tr>
            </thead>
            <tbody className="text-ink-dim">
              <tr>
                <td className="border border-line p-3">Bit Hack (0 Iteraciones)</td>
                <td className="border border-line p-3 text-sign font-mono">~ 3.5% - 5.0%</td>
                <td className="border border-line p-3">1 resta entera + 1 bit shift</td>
              </tr>
              <tr className="bg-surface">
                <td className="border border-line p-3 font-bold text-ink">1 Iteración de Newton</td>
                <td className="border border-line p-3 text-mant font-mono font-bold">~ 0.175%</td>
                <td className="border border-line p-3">+3 mult, +1 resta float</td>
              </tr>
              <tr>
                <td className="border border-line p-3">2 Iteraciones de Newton</td>
                <td className="border border-line p-3 font-mono">~ 0.0000003%</td>
                <td className="border border-line p-3">Doble de multiplicaciones float</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Gráfica de Convergencia */}
        <div className="max-w-[65ch] border border-line rounded-sm bg-surface p-6 space-y-4">
          <span className="font-mono text-xs text-ink-faint block uppercase">
            Convergencia del Error Relativo Máximo
          </span>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span>0 Iteraciones (Solo Bit Shift)</span>
                <span className="text-sign">5.0%</span>
              </div>
              <div className="w-full bg-surface-2 h-3 rounded-sm overflow-hidden">
                <div className="bg-sign h-full w-[100%] transition-all"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>1 Iteración (Quake III)</span>
                <span className="text-mant font-bold">0.175%</span>
              </div>
              <div className="w-full bg-surface-2 h-3 rounded-sm overflow-hidden">
                <div className="bg-mant h-full w-[3.5%] transition-all"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>2 Iteraciones</span>
                <span className="text-ink-dim">0.0000003%</span>
              </div>
              <div className="w-full bg-surface-2 h-3 rounded-sm overflow-hidden">
                <div className="bg-exp h-full w-[0.1%] transition-all"></div>
              </div>
            </div>
          </div>
        </div>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          Un error máximo del <strong>0.175%</strong> es absolutamente imperceptible para el ojo humano en motores gráficos. Añadir una segunda iteración duplicaba las operaciones de punto flotante en la ALU sin aportar ninguna mejora visual perceptible.
        </p>
      </div>

      {/* 7. ¿Qué se hace actualmente? (Hardware moderno) */}
      <div className="mt-12 border-t border-line pt-8 space-y-6">
        <strong className="block text-xl text-ink font-display">
          ¿Cómo se implementa actualmente en hardware moderno?
        </strong>

        <p className="max-w-[65ch] text-ink-dim leading-relaxed">
          En procesadores y tarjetas gráficas modernas, este truco en software a nivel de bits ya no es necesario:
        </p>

        <ul className="max-w-[65ch] space-y-3 text-sm text-ink-dim list-disc pl-5">
          <li>
            <strong>Instrucciones SSE / AVX en CPU:</strong> Las arquitecturas x86 incorporan instrucciones en ensamblador como <code>RSQRTSS</code> (Scalar Reciprocal Square Root) y <code>RSQRTPS</code> (SIMD Vectorial), capaces de calcular la raíz cuadrada inversa aproximada a nivel de hardware en 1 solo ciclo de reloj.
          </li>
          <li>
            <strong>SFU (Special Function Units) en GPU:</strong> Las GPU (NVIDIA, AMD) incluyen unidades de hardware dedicadas exclusivamente a calcular funciones trascendentes y recíprocas (<Formula tex="1/\sqrt{x}" />, <Formula tex="\log_2(x)" />, <Formula tex="\sin(x)" />) directamente en silicio con latencia mínima.
          </li>
          <li>
            <strong>Operaciones FMA (Fused Multiply-Add):</strong> Permiten refinar la precisión en un solo paso de instrucción de hardware si una aplicación requiere mayor precisión.
          </li>
        </ul>
      </div>

      {/* 8. Referencias y Fuentes */}
      <div className="mt-12 border-t border-line pt-8 space-y-4">
        <strong className="block text-xl text-ink font-display">
          Referencias y Fuentes
        </strong>

        <ul className="max-w-[65ch] space-y-2 text-sm text-ink-dim list-disc pl-5">
          <li>
            <em>FAST INVERSE SQUARE ROOT</em> — Chris Lomont.
          </li>
          <li>
            <em>Exploring the Quake III Fast Inverse Square Root Algorithm</em> — Daniel Harrington.
          </li>
          <li>
            <em>The Mathematics Behind the Fast Inverse Square Root Function Code</em> — Charles McEniry.
          </li>
          <li>
            Vídeo de referencia:{" "}
            <a 
              href="https://www.youtube.com/watch?v=0xyycrTekc4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-mant hover:underline"
            >
              El algoritmo "mágico" del juego Quake III: RAIZ CUADRADA INVERSA RÁPIDA
            </a>.
          </li>
        </ul>
      </div>
    </Section>
  );
}
