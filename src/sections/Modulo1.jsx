import Section from "../components/Section.jsx";
import Formula from "../components/Formula.jsx";
import FloatInspector from "../components/FloatInspector.jsx";

const SUBTEMAS = [
  "El truco de bits: tratar el float como un entero",
  "La constante mágica 0x5F3759DF",
  "Una iteración de Newton-Raphson para refinar el resultado",
];

export default function Modulo1() {
  return (
    <Section
      id="modulo-1"
      index="02"
      accent="exp"
      variant="page"
      title="Optimización de bits y raíz cuadrada inversa"
      subtitle="El algoritmo detrás de fast inverse square root (Quake III, 1999): calcular 1/√x manipulando directamente los bits del exponente en lugar de dividir."
    >
      <p className="max-w-[65ch] text-ink-dim">
        1/√x aparece en cada normalización de vector en gráficos 3D —
        iluminación, reflexión, direcciones de cámara— y por años fue
        demasiado costosa para calcularla por fuerza bruta en cada
        fotograma. El truco: reinterpretar los bits del float como un
        entero, restar ese entero de una constante mágica, y refinar el
        resultado con una iteración de Newton-Raphson.
      </p>

      <div className="mt-6 overflow-x-auto rounded-sm border border-line bg-surface p-4">
        <Formula tex="y_{n+1} = y_n \left(1.5 - \tfrac{1}{2}\, x\, y_n^{2}\right)" block />
      </div>

      <div className="mt-8">
        <p className="font-mono text-xs text-ink-faint">en desarrollo</p>
        <ul className="mt-3 flex flex-col gap-2">
          {SUBTEMAS.map((s) => (
            <li
              key={s}
              className="rounded-sm border border-dashed border-line px-4 py-3 text-sm text-ink-dim"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 border-t border-line pt-8">
        <p className="max-w-[65ch] text-ink-dim">
          El truco solo funciona porque reinterpretar un float como entero
          es una operación válida y barata: los bits de exponente y
          mantisa, leídos como un entero, se comportan como una
          aproximación del logaritmo del número. Este inspector muestra
          esa misma descomposición de bits que el algoritmo manipula.
        </p>
        <div className="mt-6">
          <FloatInspector />
        </div>
      </div>
    </Section>
  );
}
