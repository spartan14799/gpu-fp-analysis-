import { useMemo, useState } from "react";

const F32 = Math.fround;
const RAD_TO_DEG = 180 / Math.PI;
const AXIS = (() => {
  const norm = Math.hypot(1, 2, 3);
  return [1 / norm, 2 / norm, 3 / norm];
})();

const SCENARIOS = [
  { id: "never", label: "Sin normalizar", interval: Infinity, color: "var(--color-sign)" },
  { id: "every10", label: "Cada 10", interval: 10, color: "var(--color-exp)" },
  { id: "every100", label: "Cada 100", interval: 100, color: "var(--color-exp)" },
  { id: "every1000", label: "Cada 1 000", interval: 1000, color: "var(--color-exp)" },
  { id: "every10000", label: "Cada 10 000", interval: 10000, color: "var(--color-exp)" },
  { id: "always", label: "En cada paso", interval: 1, color: "var(--color-mant)" },
];

const CHART = {
  width: 760,
  height: 300,
  left: 84,
  right: 22,
  top: 22,
  bottom: 48,
};

function fadd(a, b) {
  return F32(F32(a) + F32(b));
}

function fsub(a, b) {
  return F32(F32(a) - F32(b));
}

function fmul(a, b) {
  return F32(F32(a) * F32(b));
}

function multiplyF32([w, x, y, z], [a, b, c, d]) {
  return [
    fsub(fsub(fsub(fmul(w, a), fmul(x, b)), fmul(y, c)), fmul(z, d)),
    fsub(fadd(fadd(fmul(w, b), fmul(x, a)), fmul(y, d)), fmul(z, c)),
    fadd(fadd(fsub(fmul(w, c), fmul(x, d)), fmul(y, a)), fmul(z, b)),
    fadd(fsub(fadd(fmul(w, d), fmul(x, c)), fmul(y, b)), fmul(z, a)),
  ];
}

function normF32([w, x, y, z]) {
  const firstPair = fadd(fmul(w, w), fmul(x, x));
  const secondPair = fadd(fmul(y, y), fmul(z, z));
  return Math.sqrt(fadd(firstPair, secondPair));
}

function storedNorm(quaternion) {
  return Math.hypot(...quaternion);
}

function normalizeF32(quaternion) {
  const inverseNorm = F32(1 / normF32(quaternion));
  return quaternion.map((component) => fmul(component, inverseNorm));
}

function referenceQuaternion(step, incrementRadians) {
  const halfAngle = ((step * incrementRadians) / 2) % (2 * Math.PI);
  const sine = Math.sin(halfAngle);
  return [Math.cos(halfAngle), AXIS[0] * sine, AXIS[1] * sine, AXIS[2] * sine];
}

function angularErrorDegrees(quaternion, reference) {
  const norm = Math.hypot(...quaternion);
  const dot = Math.abs(
    quaternion.reduce((sum, component, index) => sum + (component / norm) * reference[index], 0),
  );
  return 2 * Math.acos(Math.min(1, Math.max(-1, dot))) * RAD_TO_DEG;
}

function runExperiment({ steps, incrementDegrees, normTolerance, angleTolerance }) {
  const incrementRadians = (incrementDegrees * Math.PI) / 180;
  const halfIncrement = incrementRadians / 2;
  const sine = Math.sin(halfIncrement);
  const increment = [
    F32(Math.cos(halfIncrement)),
    F32(AXIS[0] * sine),
    F32(AXIS[1] * sine),
    F32(AXIS[2] * sine),
  ];
  const sampleEvery = Math.max(1, Math.ceil(steps / 150));
  const states = SCENARIOS.map((scenario) => ({
    ...scenario,
    quaternion: [1, 0, 0, 0],
    maxNormDrift: 0,
    maxAngularError: 0,
    windowNormDrift: 0,
    firstNormFailure: null,
    firstAngleFailure: null,
  }));
  const samples = [
    {
      step: 0,
      values: Object.fromEntries(states.map((state) => [state.id, { norm: 0, angle: 0 }])),
    },
  ];

  for (let step = 1; step <= steps; step += 1) {
    const reference = referenceQuaternion(step, incrementRadians);
    const shouldSample = step % sampleEvery === 0 || step === steps;

    for (const state of states) {
      state.quaternion = multiplyF32(state.quaternion, increment);

      const driftBeforeCorrection = Math.abs(storedNorm(state.quaternion) - 1);
      state.maxNormDrift = Math.max(state.maxNormDrift, driftBeforeCorrection);
      state.windowNormDrift = Math.max(state.windowNormDrift, driftBeforeCorrection);
      if (state.firstNormFailure === null && driftBeforeCorrection > normTolerance) {
        state.firstNormFailure = step;
      }

      if (Number.isFinite(state.interval) && step % state.interval === 0) {
        state.quaternion = normalizeF32(state.quaternion);
      }

      const angleError = angularErrorDegrees(state.quaternion, reference);
      state.maxAngularError = Math.max(state.maxAngularError, angleError);
      state.currentAngularError = angleError;
      if (state.firstAngleFailure === null && angleError > angleTolerance) {
        state.firstAngleFailure = step;
      }
    }

    if (shouldSample) {
      samples.push({
        step,
        values: Object.fromEntries(
          states.map((state) => [
            state.id,
            { norm: state.windowNormDrift, angle: state.currentAngularError },
          ]),
        ),
      });
      states.forEach((state) => {
        state.windowNormDrift = 0;
      });
    }
  }

  const results = Object.fromEntries(
    states.map((state) => [
      state.id,
      {
        ...state,
        finalNormDrift: Math.abs(storedNorm(state.quaternion) - 1),
        finalAngularError: state.currentAngularError,
      },
    ]),
  );

  return { increment, results, samples };
}

function scientific(value) {
  if (value === 0) return "0";
  if (value >= 0.01 && value < 1000) return value.toPrecision(3);
  return value.toExponential(2);
}

function integer(value) {
  return new Intl.NumberFormat("es-CO").format(value);
}

function pathFor(samples, scenarioId, metric, xScale, yScale, floor) {
  return samples
    .map((sample, index) => {
      const value = Math.max(sample.values[scenarioId][metric], floor);
      return `${index === 0 ? "M" : "L"}${xScale(sample.step).toFixed(2)},${yScale(value).toFixed(2)}`;
    })
    .join(" ");
}

function ErrorChart({ samples, steps, scenarios, metric, inspectedStep }) {
  const floor = metric === "angle" ? 1e-7 : 1e-9;
  const values = samples.flatMap((sample) =>
    scenarios.map((scenario) => Math.max(sample.values[scenario.id][metric], floor)),
  );
  const minPower = Math.floor(Math.log10(Math.min(...values)));
  const maxPower = Math.max(minPower + 1, Math.ceil(Math.log10(Math.max(...values))));
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const xScale = (value) => CHART.left + (value / steps) * plotWidth;
  const yScale = (value) => {
    const ratio = (Math.log10(value) - minPower) / (maxPower - minPower);
    return CHART.top + (1 - ratio) * plotHeight;
  };
  const yPowers = Array.from({ length: Math.min(7, maxPower - minPower + 1) }, (_, index) => {
    if (maxPower - minPower <= 6) return minPower + index;
    return Math.round(minPower + (index * (maxPower - minPower)) / 6);
  });
  const xTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      className="w-full"
      role="img"
      aria-label={
        metric === "angle"
          ? "Error angular acumulado según el número de rotaciones"
          : "Desviación máxima de la norma según el número de rotaciones"
      }
    >
      {yPowers.map((power) => {
        const value = 10 ** power;
        const y = yScale(value);
        return (
          <g key={power}>
            <line
              x1={CHART.left}
              y1={y}
              x2={CHART.width - CHART.right}
              y2={y}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
            <text
              x={CHART.left - 10}
              y={y + 4}
              textAnchor="end"
              fill="var(--color-ink-faint)"
              fontFamily="var(--font-mono)"
              fontSize="11"
            >
              1e{power}
            </text>
          </g>
        );
      })}

      {xTicks.map((ratio) => {
        const value = Math.round(steps * ratio);
        const x = xScale(value);
        return (
          <g key={ratio}>
            <line
              x1={x}
              y1={CHART.top}
              x2={x}
              y2={CHART.height - CHART.bottom}
              stroke="var(--color-line)"
              strokeWidth="1"
              opacity="0.55"
            />
            <text
              x={x}
              y={CHART.height - 20}
              textAnchor="middle"
              fill="var(--color-ink-faint)"
              fontFamily="var(--font-mono)"
              fontSize="11"
            >
              {integer(value)}
            </text>
          </g>
        );
      })}

      {scenarios.map((scenario) => (
        <path
          key={scenario.id}
          d={pathFor(samples, scenario.id, metric, xScale, yScale, floor)}
          fill="none"
          stroke={scenario.color}
          strokeWidth={scenario.id === "selected" ? 2.5 : 2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      <line
        x1={xScale(inspectedStep)}
        y1={CHART.top}
        x2={xScale(inspectedStep)}
        y2={CHART.height - CHART.bottom}
        stroke="var(--color-ink)"
        strokeWidth="1"
        strokeDasharray="4 5"
        opacity="0.7"
      />
      <text
        x="16"
        y={CHART.top + plotHeight / 2}
        transform={`rotate(-90 16 ${CHART.top + plotHeight / 2})`}
        textAnchor="middle"
        fill="var(--color-ink-dim)"
        fontFamily="var(--font-mono)"
        fontSize="11"
      >
        {metric === "angle" ? "error angular (grados, escala log)" : "|‖q‖ − 1| (escala log)"}
      </text>
      <text
        x={CHART.left + plotWidth / 2}
        y={CHART.height - 2}
        textAnchor="middle"
        fill="var(--color-ink-dim)"
        fontFamily="var(--font-mono)"
        fontSize="11"
      >
        actualizaciones de orientación
      </text>
    </svg>
  );
}

export default function QuaternionErrorLab() {
  const [incrementDegrees, setIncrementDegrees] = useState(0.1);
  const [steps, setSteps] = useState(100000);
  const [normalizationInterval, setNormalizationInterval] = useState(1000);
  const [normTolerance, setNormTolerance] = useState(1e-4);
  const [angleTolerance, setAngleTolerance] = useState(0.1);
  const [metric, setMetric] = useState("angle");
  const [inspection, setInspection] = useState(100);

  const experiment = useMemo(
    () => runExperiment({ steps, incrementDegrees, normTolerance, angleTolerance }),
    [steps, incrementDegrees, normTolerance, angleTolerance],
  );
  const selectedId = `every${normalizationInterval}`;
  const chartScenarios = [
    { id: "never", label: "Sin normalizar", color: "var(--color-sign)" },
    { id: selectedId, label: `Cada ${integer(normalizationInterval)}`, color: "var(--color-exp)" },
    { id: "always", label: "Cada paso", color: "var(--color-mant)" },
  ];
  const inspectedIndex = Math.round((inspection / 100) * (experiment.samples.length - 1));
  const inspectedSample = experiment.samples[inspectedIndex];
  const never = experiment.results.never;
  const selected = experiment.results[selectedId];
  const always = experiment.results.always;
  const candidates = [10000, 1000, 100, 10, 1]
    .map((interval) => experiment.results[`every${interval}`] ?? experiment.results.always)
    .filter(
      (result) =>
        result.maxNormDrift <= normTolerance && result.maxAngularError <= angleTolerance,
    );
  const neverMeetsTolerance =
    never.maxNormDrift <= normTolerance && never.maxAngularError <= angleTolerance;
  const recommendation = candidates[0];
  const normReduction = never.maxNormDrift / Math.max(selected.maxNormDrift, Number.EPSILON);
  const normChange =
    ((selected.maxNormDrift - never.maxNormDrift) /
      Math.max(never.maxNormDrift, Number.EPSILON)) *
    100;
  const angularChange =
    ((selected.maxAngularError - never.maxAngularError) /
      Math.max(never.maxAngularError, Number.EPSILON)) *
    100;

  return (
    <div className="mt-6 overflow-hidden rounded-sm border border-line bg-surface">
      <div className="border-b border-line p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-mant">
              Laboratorio binary32
            </p>
            <h4 className="mt-1 font-display text-lg font-medium text-ink">
              Error de orientación bajo rotaciones repetidas
            </h4>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-ink-dim">
            Eje fijo u = (1, 2, 3)/√14. Cada suma y multiplicación del producto de Hamilton
            se redondea explícitamente a Float32.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="font-mono text-[11px] text-ink-dim">
            giro por paso
            <select
              value={incrementDegrees}
              onChange={(event) => setIncrementDegrees(Number(event.target.value))}
              className="mt-1.5 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink"
            >
              {[0.01, 0.1, 0.5, 1, 5].map((value) => (
                <option key={value} value={value}>{value}°</option>
              ))}
            </select>
          </label>
          <label className="font-mono text-[11px] text-ink-dim">
            número de movimientos
            <select
              value={steps}
              onChange={(event) => setSteps(Number(event.target.value))}
              className="mt-1.5 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink"
            >
              {[1000, 10000, 50000, 100000, 250000].map((value) => (
                <option key={value} value={value}>{integer(value)}</option>
              ))}
            </select>
          </label>
          <label className="font-mono text-[11px] text-ink-dim">
            comparar normalización cada
            <select
              value={normalizationInterval}
              onChange={(event) => setNormalizationInterval(Number(event.target.value))}
              className="mt-1.5 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink"
            >
              {[10, 100, 1000, 10000].map((value) => (
                <option key={value} value={value}>{integer(value)} pasos</option>
              ))}
            </select>
          </label>
          <label className="font-mono text-[11px] text-ink-dim">
            tolerancia de norma
            <select
              value={normTolerance}
              onChange={(event) => setNormTolerance(Number(event.target.value))}
              className="mt-1.5 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink"
            >
              {[1e-6, 1e-5, 1e-4, 1e-3].map((value) => (
                <option key={value} value={value}>{value.toExponential(0)}</option>
              ))}
            </select>
          </label>
          <label className="font-mono text-[11px] text-ink-dim">
            tolerancia angular
            <select
              value={angleTolerance}
              onChange={(event) => setAngleTolerance(Number(event.target.value))}
              className="mt-1.5 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink"
            >
              {[0.001, 0.01, 0.1, 1].map((value) => (
                <option key={value} value={value}>{value}°</option>
              ))}
            </select>
          </label>
          <div>
            <p className="font-mono text-[11px] text-ink-dim">métrica de la gráfica</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMetric("angle")}
                className={`rounded-sm border px-3 py-2 font-mono text-xs transition-colors ${
                  metric === "angle" ? "border-ink bg-surface-2 text-ink" : "border-line text-ink-dim"
                }`}
              >
                Ángulo
              </button>
              <button
                type="button"
                onClick={() => setMetric("norm")}
                className={`rounded-sm border px-3 py-2 font-mono text-xs transition-colors ${
                  metric === "norm" ? "border-ink bg-surface-2 text-ink" : "border-line text-ink-dim"
                }`}
              >
                Norma
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Series de la gráfica">
          {chartScenarios.map((scenario) => (
            <div key={scenario.id} className="flex items-center gap-2 font-mono text-[11px] text-ink-dim">
              <span className="h-0.5 w-6" style={{ background: scenario.color }} />
              {scenario.label}
            </div>
          ))}
        </div>

        <div className="mt-3 overflow-x-auto">
          <div className="min-w-[620px]">
            <ErrorChart
              samples={experiment.samples}
              steps={steps}
              scenarios={chartScenarios}
              metric={metric}
              inspectedStep={inspectedSample.step}
            />
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-ink-dim">
            <label htmlFor="quaternion-inspection">inspeccionar evolución</label>
            <span>{integer(inspectedSample.step)} pasos</span>
          </div>
          <input
            id="quaternion-inspection"
            type="range"
            min="0"
            max="100"
            value={inspection}
            onChange={(event) => setInspection(Number(event.target.value))}
            className="mt-2 w-full accent-mant"
          />
        </div>

        <div className="mt-5 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3" aria-live="polite">
          {chartScenarios.map((scenario) => {
            const value = inspectedSample.values[scenario.id][metric];
            return (
              <div key={scenario.id} className="bg-bg p-3">
                <p className="font-mono text-[10px] text-ink-faint">{scenario.label}</p>
                <p className="mt-1 font-mono text-sm text-ink">
                  {scientific(value)} {metric === "angle" ? "°" : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-line bg-bg p-4 sm:p-6">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-dim">
          Peores errores observados durante {integer(steps)} movimientos
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-dim">
          Cada tarjeta corresponde a una estrategia de normalización. Los valores máximos son los
          errores más grandes encontrados en cualquier momento de la trayectoria, aunque después hayan
          disminuido. Un límite se incumple en el primer paso en que el error de norma supera
          {" "}<strong className="text-ink">{scientific(normTolerance)}</strong> o el error angular
          supera <strong className="text-ink">{scientific(angleTolerance)}°</strong>.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["Sin normalizar", "La norma no se corrige durante la trayectoria.", never],
            [
              `Cada ${integer(normalizationInterval)} pasos`,
              `La norma se corrige después de cada ${integer(normalizationInterval)} movimientos.`,
              selected,
            ],
            ["En cada paso", "La norma se corrige después de cada movimiento.", always],
          ].map(([label, description, result]) => {
            const meetsBoth =
              result.maxNormDrift <= normTolerance && result.maxAngularError <= angleTolerance;
            return (
            <div key={label} className="rounded-sm border border-line bg-surface p-4">
              <p className="font-mono text-xs text-ink">{label}</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-dim">{description}</p>
              <p className={`mt-3 font-mono text-[10px] uppercase ${meetsBoth ? "text-mant" : "text-sign"}`}>
                {meetsBoth ? "Cumple ambas tolerancias" : "Incumple al menos una tolerancia"}
              </p>
              <dl className="mt-4 space-y-3 font-mono text-[11px] text-ink-dim">
                <div className="flex justify-between gap-3">
                  <dt>mayor error de norma</dt>
                  <dd className="text-right text-ink">{scientific(result.maxNormDrift)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>mayor error angular</dt>
                  <dd className="text-right text-ink">{scientific(result.maxAngularError)}°</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>límite de norma</dt>
                  <dd className="text-right text-ink">
                    {result.firstNormFailure === null
                      ? "no se superó"
                      : `superado en el paso ${integer(result.firstNormFailure)}`}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>límite angular</dt>
                  <dd className="text-right text-ink">
                    {result.firstAngleFailure === null
                      ? "no se superó"
                      : `superado en el paso ${integer(result.firstAngleFailure)}`}
                  </dd>
                </div>
              </dl>
            </div>
            );
          })}
        </div>

        <div className="mt-5 border-l-2 border-mant bg-surface px-4 py-3" aria-live="polite">
          <p className="font-mono text-[11px] uppercase text-mant">Lectura del experimento</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-dim">
            La comparación toma como punto de partida el caso sin normalización. Así se puede medir qué
            cambió al corregir la norma cada {integer(normalizationInterval)} pasos.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-sm border border-line bg-bg p-3">
              <p className="font-mono text-[10px] uppercase text-sign">Error de norma</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                El máximo pasó de <strong className="text-ink">{scientific(never.maxNormDrift)}</strong>
                {" "}sin normalizar a
                {" "}<strong className="text-ink">{scientific(selected.maxNormDrift)}</strong> al
                normalizar cada {integer(normalizationInterval)} pasos. El error sin normalización fue
                {" "}<strong className="text-ink">{scientific(normReduction)} veces</strong> el error
                del caso normalizado. Esto equivale a
                {normChange <= 0 ? " una reducción de " : " un aumento de "}
                <strong className="text-ink">{scientific(Math.abs(normChange))}%</strong>.
              </p>
            </div>
            <div className="rounded-sm border border-line bg-bg p-3">
              <p className="font-mono text-[10px] uppercase text-exp">Error angular</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                El máximo pasó de
                {" "}<strong className="text-ink">{scientific(never.maxAngularError)}°</strong> a
                {" "}<strong className="text-ink">{scientific(selected.maxAngularError)}°</strong>.
                Respecto al caso sin normalización, el cambio fue de
                {" "}<strong className="text-ink">{scientific(Math.abs(angularChange))}%</strong>
                {angularChange <= 0 ? " menos" : " más"} error angular.
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            Una reducción grande del error de norma no implica una reducción igual del error angular.
            Normalizar ajusta la longitud del cuaternión, pero no reconstruye la orientación analítica
            de referencia. Por eso las dos métricas pueden cambiar en proporciones muy diferentes.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            {neverMeetsTolerance ? (
              <>
                En el caso sin normalización, el máximo error de norma fue
                {" "}<strong className="text-ink">{scientific(never.maxNormDrift)}</strong> frente al
                límite <strong className="text-ink">{scientific(normTolerance)}</strong>, y el máximo
                error angular fue <strong className="text-ink">{scientific(never.maxAngularError)}°</strong>
                {" "}frente al límite <strong className="text-ink">{scientific(angleTolerance)}°</strong>.
                Como ambos valores cumplen las tolerancias, no fue necesario normalizar durante los
                {" "}{integer(steps)} pasos evaluados.
              </>
            ) : recommendation ? (
              <>
                Entre los intervalos ensayados, el mayor que cumple simultáneamente las dos tolerancias
                es <strong className="text-ink">cada {integer(recommendation.interval)} pasos</strong>.
                Con ese intervalo, el máximo error de norma es
                {" "}<strong className="text-ink">{scientific(recommendation.maxNormDrift)}</strong>
                {" "}y el máximo error angular es
                {" "}<strong className="text-ink">{scientific(recommendation.maxAngularError)}°</strong>.
                Los intervalos más largos que se probaron incumplieron al menos uno de los dos límites.
              </>
            ) : always.maxAngularError > angleTolerance ? (
              <>
                Ni normalizando en cada paso se satisface la tolerancia angular. Hace falta reducir el
                tamaño del paso, reconstruir desde una referencia o utilizar mayor precisión.
              </>
            ) : (
              <>
                La tolerancia de norma es más estricta que la desviación introducida por una sola
                actualización Float32; se necesita mayor precisión para cumplirla.
              </>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}
