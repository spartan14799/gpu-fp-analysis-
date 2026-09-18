import { useState, useMemo } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Sliders,
  Sparkles
} from "lucide-react";
import Formula from "./Formula.jsx";
import BitField from "./BitField.jsx";
import { inspectFloat32, ulpAt } from "../lib/float32.js";

const f32 = Math.fround;

export default function LaboratorioRebotePlano() {
  // Parámetros interactivos
  const [scaleMode, setScaleMode] = useState("large"); // "local" (X=5) o "large" (X=50000)
  const [incidentAngleDeg, setIncidentAngleDeg] = useState(45); // 15° a 75°
  const [offsetStrategy, setOffsetStrategy] = useState("adaptive"); // "none", "fixed", "adaptive"

  // Base de coordenadas según escala seleccionada
  const originBaseX = scaleMode === "large" ? 50000.0 : 5.0;
  const originBaseY = scaleMode === "large" ? 25.0 : 4.0;
  const p0BaseX = scaleMode === "large" ? 50010.0 : 7.0;

  // Cálculos analíticos (Float64 de alta precisión) vs Float32 (GPU IEEE 754)
  const simulation = useMemo(() => {
    const rad = (incidentAngleDeg * Math.PI) / 180;
    // Inclinación leve de 4° en la normal para emular una superficie 3D arbitraria
    const tiltRad = (4 * Math.PI) / 180;
    const Nx_f64 = Math.sin(tiltRad);
    const Ny_f64 = Math.cos(tiltRad);
    const Nz_f64 = 0;

    // 1. Vectores continuos analíticos (R)
    const Ox_exact = originBaseX;
    const Oy_exact = originBaseY;
    const Dx_exact = Math.cos(rad);
    const Dy_exact = -Math.sin(rad);
    const Dz_exact = 0.05;
    const len_exact = Math.sqrt(Dx_exact * Dx_exact + Dy_exact * Dy_exact + Dz_exact * Dz_exact);
    const Dxn_exact = Dx_exact / len_exact;
    const Dyn_exact = Dy_exact / len_exact;
    const Dzn_exact = Dz_exact / len_exact;

    const dotDN_exact = Dxn_exact * Nx_f64 + Dyn_exact * Ny_f64 + Dzn_exact * Nz_f64;
    const dotDiffN_exact = (p0BaseX - Ox_exact) * Nx_f64 + (0 - Oy_exact) * Ny_f64;
    const t_exact = dotDiffN_exact / dotDN_exact;

    const Phit_x_exact = Ox_exact + t_exact * Dxn_exact;
    const Phit_y_exact = Oy_exact + t_exact * Dyn_exact;

    // 2. Simulación estricta en GPU: Operaciones en Float32 (binary32)
    const Nx_f32 = f32(Math.sin(tiltRad));
    const Ny_f32 = f32(Math.cos(tiltRad));
    const Nz_f32 = f32(0);

    const Ox_f32 = f32(originBaseX);
    const Oy_f32 = f32(originBaseY);
    const P0x_f32 = f32(p0BaseX);
    const P0y_f32 = f32(0);

    const Dx_f32 = f32(Math.cos(rad));
    const Dy_f32 = f32(-Math.sin(rad));
    const Dz_f32 = f32(0.05);
    const len_f32 = f32(Math.sqrt(f32(f32(Dx_f32 * Dx_f32) + f32(Dy_f32 * Dy_f32) + f32(Dz_f32 * Dz_f32))));
    const Dxn_f32 = f32(Dx_f32 / len_f32);
    const Dyn_f32 = f32(Dy_f32 / len_f32);
    const Dzn_f32 = f32(Dz_f32 / len_f32);

    const dotDN_f32 = f32(f32(Dxn_f32 * Nx_f32) + f32(Dyn_f32 * Ny_f32) + f32(Dzn_f32 * Nz_f32));
    const dotDiffN_f32 = f32(f32((P0x_f32 - Ox_f32) * Nx_f32) + f32((P0y_f32 - Oy_f32) * Ny_f32));
    const t_f32 = f32(dotDiffN_f32 / dotDN_f32);

    const Phit_x_f32 = f32(Ox_f32 + f32(t_f32 * Dxn_f32));
    const Phit_y_f32 = f32(Oy_f32 + f32(t_f32 * Dyn_f32));
    const Phit_z_f32 = f32(t_f32 * Dzn_f32);

    // Evaluación en la ecuación del plano: (P_hit - P0) · N
    const residual_error = f32(
      f32(f32((Phit_x_f32 - P0x_f32) * Nx_f32) + f32((Phit_y_f32 - P0y_f32) * Ny_f32)) + 
      f32(Phit_z_f32 * Nz_f32)
    );

    // ULP en el punto de impacto
    const ulp_x = ulpAt(Phit_x_f32);
    const ulp_y = ulpAt(Phit_y_f32);

    // Mitigación: Epsilon fijo tradicional (1e-4)
    const fixedEps = f32(0.0001);
    // Verificamos si en la coordenada mayor (X) el epsilon fijo produce algún cambio
    const fixedCandidateX = f32(Phit_x_f32 + f32(fixedEps * Nx_f32));
    const fixedEpsAbsorbed = (fixedCandidateX === Phit_x_f32) && (scaleMode === "large");

    // Mitigación: Cota adaptativa de Pharr, Jakob & Humphreys (PBRT v4)
    const epsMach = 5.960464477539063e-8; // 2^-24
    const gamma3 = (3 * epsMach) / (1 - 3 * epsMach);
    const deltaX = gamma3 * (Math.abs(Ox_f32) + Math.abs(t_f32 * Dxn_f32));
    const deltaY = gamma3 * (Math.abs(Oy_f32) + Math.abs(t_f32 * Dyn_f32));
    const deltaZ = gamma3 * Math.abs(t_f32 * Dzn_f32);

    // d_safe = |deltaP · N| + 2 ULP
    const d_safe = f32(
      Math.abs(deltaX * Nx_f32) + 
      Math.abs(deltaY * Ny_f32) + 
      Math.abs(deltaZ * Nz_f32) + 
      ulp_x * 0.5 + ulp_y
    );

    // Origen secundario y prueba de auto-colisión:
    let appliedOffset = 0;
    let isOffsetEffective = false;

    if (offsetStrategy === "fixed") {
      appliedOffset = fixedEps;
      isOffsetEffective = !fixedEpsAbsorbed;
    } else if (offsetStrategy === "adaptive") {
      appliedOffset = d_safe;
      isOffsetEffective = true;
    }

    // Hay auto-intersección si el punto cayó por debajo del plano (residual < 0) y no hay offset efectivo
    const hasSelfIntersection = (residual_error < 0) && (!isOffsetEffective);

    return {
      exact: { t: t_exact, Phit_x: Phit_x_exact, Phit_y: Phit_y_exact },
      f32: {
        t: t_f32,
        Phit_x: Phit_x_f32,
        Phit_y: Phit_y_f32,
        residual_error,
        ulp_x,
        ulp_y,
        fixedEps,
        fixedEpsAbsorbed,
        d_safe,
        appliedOffset,
        isOffsetEffective,
        hasSelfIntersection,
        bitInfoX: inspectFloat32(Phit_x_f32)
      }
    };
  }, [scaleMode, incidentAngleDeg, offsetStrategy, originBaseX, originBaseY, p0BaseX]);

  const { exact, f32: res } = simulation;

  // Parámetros geométricos para el SVG dinámico:
  const rad = (incidentAngleDeg * Math.PI) / 180;
  const hitX = 300;
  const hitY = 150;
  const rayLen = 125;

  // Origen del rayo incidente en pantalla (arriba a la izquierda del punto de impacto)
  const inX = hitX - rayLen * Math.sin(rad);
  const inY = hitY - rayLen * Math.cos(rad);

  // Destino del rayo reflejado en pantalla (arriba a la derecha)
  const outX = hitX + rayLen * Math.sin(rad);
  const outY = hitY - rayLen * Math.cos(rad);

  // Desplazamiento visual en pantalla según la estrategia de mitigación
  const visualOffsetPx = offsetStrategy === "adaptive" ? 9 : (offsetStrategy === "fixed" && !res.fixedEpsAbsorbed ? 6 : 0);
  const startReflY = res.hasSelfIntersection ? hitY + 3 : hitY - visualOffsetPx;

  return (
    <div className="flex flex-col gap-6 w-full rounded-sm border border-line bg-surface p-5 sm:p-6 my-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase text-mant">
              Laboratorio de Silicio
            </span>
            <span className="text-ink-faint text-xs">·</span>
            <span className="font-mono text-xs text-ink-dim">Aritmética IEEE 754 en Ray-Plane Hit</span>
          </div>
          <h4 className="text-lg font-medium text-ink mt-1">
            Inspección de Precisión, Absorción de Mantisa y Auto-intersección
          </h4>
        </div>

        {/* Selector de Escala */}
        <div className="flex items-center bg-bg p-1 rounded-sm border border-line self-start sm:self-auto">
          <button
            onClick={() => setScaleMode("local")}
            className={`px-3 py-1 text-xs font-mono rounded-[2px] transition-colors ${
              scaleMode === "local" 
                ? "bg-surface-2 text-mant font-semibold" 
                : "text-ink-dim hover:text-ink"
            }`}
          >
            Escala Local (X=5)
          </button>
          <button
            onClick={() => setScaleMode("large")}
            className={`px-3 py-1 text-xs font-mono rounded-[2px] transition-colors ${
              scaleMode === "large" 
                ? "bg-surface-2 text-exp font-semibold" 
                : "text-ink-dim hover:text-ink"
            }`}
          >
            Mundo Abierto (X=50,000)
          </button>
        </div>
      </div>

      {/* Controles de Parámetros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Control Ángulo */}
        <div className="p-4 bg-bg border border-line rounded-sm flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Sliders className="size-3.5 text-mant" />
              <span className="font-mono text-xs text-ink-dim uppercase">Ángulo de Incidencia (θ)</span>
            </div>
            <span className="font-mono text-xs font-bold text-ink bg-surface px-2.5 py-0.5 rounded-sm border border-line">
              {incidentAngleDeg}° {incidentAngleDeg >= 65 ? "(Ángulo Rasante)" : ""}
            </span>
          </div>
          <input 
            type="range" 
            min="15" 
            max="75" 
            value={incidentAngleDeg} 
            onChange={(e) => setIncidentAngleDeg(Number(e.target.value))}
            className="w-full accent-mant cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-ink-faint">
            <span>15° (Normal)</span>
            <span>45°</span>
            <span>75° (Rasante)</span>
          </div>
        </div>

        {/* Control Estrategia de Offset */}
        <div className="p-4 bg-bg border border-line rounded-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-ink-dim uppercase">Mitigación de Error (Offset)</span>
            <span className="font-mono text-[10px] text-ink-faint">Estrategia aplicada</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "none", label: "Sin Offset (0)" },
              { id: "fixed", label: "Fijo (1e-4)" },
              { id: "adaptive", label: "Adaptativo (PBRT)" }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setOffsetStrategy(st.id)}
                className={`py-1.5 text-xs font-mono rounded-[2px] transition-all border ${
                  offsetStrategy === st.id
                    ? "bg-surface-2 border-ink text-ink font-bold"
                    : "border-line text-ink-dim hover:text-ink"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-ink-faint">
            {offsetStrategy === "none" && "Dispara el rayo secundario exactamente en el P_hit calculado por la GPU."}
            {offsetStrategy === "fixed" && "Aplica un desplazamiento estático constante de ε = 0.0001 en la normal."}
            {offsetStrategy === "adaptive" && "Calcula el offset seguro dinámico con la cota de error de Pharr et al."}
          </p>
        </div>
      </div>

      {/* Gráfico Visual 2D del Rebote DINÁMICO */}
      <div className="relative w-full aspect-[2.4/1] min-h-[230px] bg-bg border border-line rounded-sm overflow-hidden flex items-center justify-center select-none p-4">
        <svg viewBox="0 0 600 240" className="w-full h-full">
          <defs>
            <linearGradient id="planeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(42, 52, 68, 0.6)" />
              <stop offset="100%" stopColor="rgba(18, 24, 34, 0.95)" />
            </linearGradient>
            <marker id="arrow-ray" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--color-mant)" />
            </marker>
            <marker id="arrow-refl" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill={res.hasSelfIntersection ? "var(--color-sign)" : "var(--color-exp)"} />
            </marker>
          </defs>

          {/* Plano Infinito (Suelo) */}
          <rect x={30} y={hitY} width={540} height={75} fill="url(#planeGrad)" stroke="var(--color-line)" strokeWidth="1.5" />
          <line x1={20} y1={hitY} x2={580} y2={hitY} stroke="var(--color-ink-dim)" strokeWidth="2" />
          <text x={50} y={hitY + 30} className="font-mono text-[10px] fill-ink-dim">
            SUPERFICIE PLANA (Y = 0)
          </text>
          
          {/* Vector Normal Vertical */}
          <line x1={hitX} y1={hitY} x2={hitX} y2={hitY - 80} stroke="var(--color-ink)" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow-ray)" />
          <text x={hitX + 8} y={hitY - 65} className="font-mono text-[9px] fill-ink font-bold">
            Normal N
          </text>

          {/* Arco del ángulo de incidencia */}
          <path
            d={`M ${hitX - 25 * Math.sin(rad)} ${hitY - 25 * Math.cos(rad)} A 25 25 0 0 1 ${hitX} ${hitY - 25}`}
            fill="none"
            stroke="var(--color-exp)"
            strokeWidth="1.5"
          />
          <text x={hitX - 16} y={hitY - 30} className="font-mono text-[9px] fill-exp font-bold">
            {incidentAngleDeg}°
          </text>

          {/* Rayo Incidente Dinámico R(t) */}
          <line 
            x1={inX} 
            y1={inY} 
            x2={hitX} 
            y2={hitY} 
            stroke="var(--color-mant)" 
            strokeWidth="2.5" 
            markerEnd="url(#arrow-ray)" 
          />
          <circle cx={inX} cy={inY} r={4} fill="var(--color-mant)" />
          <text x={inX - 24} y={inY - 6} className="font-mono text-[10px] fill-mant font-bold">
            Origen O
          </text>

          {/* Rayo Reflejado Secundario Dinámico */}
          {res.hasSelfIntersection ? (
            /* Rayo atrapado en auto-colisión (Shadow Acne) */
            <g>
              <line 
                x1={hitX} 
                y1={startReflY} 
                x2={hitX + 80} 
                y2={startReflY + 20} 
                stroke="var(--color-sign)" 
                strokeWidth="2.5" 
                strokeDasharray="4 2"
                className="animate-pulse"
              />
              <circle cx={hitX} cy={startReflY} r={5} fill="var(--color-sign)" />
              <text x={hitX + 15} y={startReflY + 30} className="font-mono text-[9px] fill-sign font-bold">
                ¡Auto-intersección! (P_hit cayó bajo el plano)
              </text>
            </g>
          ) : (
            /* Rebote exitoso hacia arriba */
            <g>
              <line 
                x1={hitX} 
                y1={startReflY} 
                x2={outX} 
                y2={outY} 
                stroke={offsetStrategy === "adaptive" ? "var(--color-mant)" : "var(--color-exp)"} 
                strokeWidth="2.5" 
                markerEnd="url(#arrow-refl)" 
              />
              {visualOffsetPx > 0 && (
                <circle cx={hitX} cy={startReflY} r={3.5} fill="var(--color-exp)" />
              )}
            </g>
          )}

          {/* Indicador de impacto */}
          <circle cx={hitX} cy={hitY} r={4} fill="var(--color-bg)" stroke="var(--color-ink)" strokeWidth="2" />
          <text x={hitX} y={hitY + 16} textAnchor="middle" className="font-mono text-[9px] fill-ink">
            P_hit
          </text>
        </svg>

        {/* Alerta flotante de diagnóstico */}
        <div className="absolute bottom-3 left-3 bg-surface/95 backdrop-blur border border-line p-2.5 rounded-sm flex items-center gap-3">
          {res.hasSelfIntersection ? (
            <AlertTriangle className="size-5 text-sign shrink-0" />
          ) : (
            <CheckCircle2 className="size-5 text-mant shrink-0" />
          )}
          <div>
            <span className="font-mono text-xs font-bold block">
              {res.hasSelfIntersection
                ? (offsetStrategy === "fixed" && res.fixedEpsAbsorbed
                    ? "¡Fallo! ε = 0.0001 absorbido por mantisa (Auto-intersección activa)"
                    : "¡Fallo! Auto-intersección (Shadow Acne detectado)")
                : (offsetStrategy === "adaptive"
                    ? "✓ Origen secundario protegido con cota adaptativa (PBRT)"
                    : offsetStrategy === "fixed"
                      ? "✓ Offset fijo efectivo a escala local"
                      : "Punto calculado sobre o por encima de la superficie")}
            </span>
            <span className="font-mono text-[10px] text-ink-dim block mt-0.5">
              Residual <Formula tex={String.raw`(P_{\text{hit}}^* - P_0) \cdot N`} /> ={" "}
              <strong className={res.residual_error < 0 ? "text-sign" : "text-mant"}>
                {res.residual_error.toExponential(4)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Panel de Comparación de Datos Aritméticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tarjeta 1: Coordenada X e Inspector IEEE 754 */}
        <div className="p-4 bg-bg border border-line rounded-sm flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-ink-dim font-bold">P_hit.X en Memoria</span>
              <span className="font-mono text-[10px] text-mant">binary32</span>
            </div>
            <p className="font-mono text-lg text-ink font-semibold mt-1">
              {res.Phit_x.toLocaleString("en-US", { maximumFractionDigits: 3 })}
            </p>
            <p className="font-mono text-[11px] text-ink-faint">
              Hex: <span className="text-ink">{res.bitInfoX.hex}</span> · ULP: <span className="text-exp">{res.ulp_x.toExponential(2)}</span>
            </p>
          </div>

          <div className="pt-2 border-t border-line">
            <span className="font-mono text-[9px] text-ink-faint uppercase block mb-1">Bits en Silicio (S · E · M):</span>
            <BitField values={res.bitInfoX} size="sm" showLabels={false} />
          </div>
        </div>

        {/* Tarjeta 2: Error Residual Dinámico */}
        <div className="p-4 bg-bg border border-line rounded-sm flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-ink-dim font-bold">Error Residual del Plano</span>
              <span className={`font-mono text-[10px] font-bold ${res.residual_error < 0 ? "text-sign" : "text-mant"}`}>
                {res.residual_error < 0 ? "DEBAJO (Negativo)" : "ENCIMA (Positivo)"}
              </span>
            </div>
            <p className={`font-mono text-lg font-semibold mt-1 ${res.residual_error < 0 ? "text-sign" : "text-mant"}`}>
              {res.residual_error.toExponential(4)}
            </p>
            <p className="font-mono text-[11px] text-ink-dim">
              {res.residual_error < 0 
                ? "P_hit cayó físicamente detrás del plano" 
                : "P_hit cayó sobre o fuera de la superficie"}
            </p>
          </div>

          <div className="pt-2 border-t border-line text-[11px] text-ink-faint">
            Distancia teórica: <span className="text-ink font-mono">t = {res.t.toFixed(2)}</span> (exacta: {exact.t.toFixed(2)})
          </div>
        </div>

        {/* Tarjeta 3: Análisis de Mitigación Dinámica */}
        <div className="p-4 bg-bg border border-line rounded-sm flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-ink-dim font-bold">Offset Aplicado</span>
              <span className={`font-mono text-[10px] font-bold ${res.isOffsetEffective ? "text-mant" : "text-sign"}`}>
                {res.isOffsetEffective ? "EFECTIVO" : "INSUFICIENTE"}
              </span>
            </div>
            <p className="font-mono text-lg text-ink font-semibold mt-1">
              {offsetStrategy === "none" && "+0.0000 (Desactivado)"}
              {offsetStrategy === "fixed" && `+${res.fixedEps.toExponential(2)}`}
              {offsetStrategy === "adaptive" && `+${res.d_safe.toExponential(3)}`}
            </p>
            <p className="font-mono text-[11px] text-ink-dim">
              {offsetStrategy === "fixed" && res.fixedEpsAbsorbed && (
                <span className="text-sign font-bold">
                  ¡Absorbido! (50,000 + 0.0001 ≡ 50,000 en FP32)
                </span>
              )}
              {offsetStrategy === "fixed" && !res.fixedEpsAbsorbed && (
                <span className="text-mant">Epsilon estático suficiente para escala local.</span>
              )}
              {offsetStrategy === "adaptive" && (
                <span className="text-mant font-bold flex items-center gap-1">
                  <Sparkles className="size-3" /> Cota dinámica &gt; 2 ULP calculada.
                </span>
              )}
              {offsetStrategy === "none" && (
                <span className="text-ink-faint">Sin desplazamiento de seguridad.</span>
              )}
            </p>
          </div>

          <div className="pt-2 border-t border-line text-[11px] text-ink-faint">
            ULP local en coordenadas: <span className="font-mono text-ink">~{res.ulp_x.toExponential(2)}</span>
          </div>
        </div>

      </div>

      {/* Nota técnica de silicio */}
      <div className="p-3 bg-surface-2 border border-line rounded-sm flex items-start gap-2.5 text-xs text-ink-dim">
        <Info className="size-4 text-mant shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-ink">Lección de silicio:</strong> En precisión simple (<code className="text-mant">binary32</code>), a coordenadas de mundo abierto (<Formula tex={String.raw`X \approx 50\,000`} />), el salto entre números consecutivos (<Formula tex={String.raw`\text{ulp}`} />) es de <code className="text-exp font-mono">~0.0039</code>. Al mover el ángulo de incidencia, verás que el residual alterna entre valores positivos y negativos. Cuando el residual es negativo y el offset es nulo o queda absorbido, el nuevo rayo rebota dentro de la superficie (auto-intersección). Solo la cota adaptativa de Pharr et al. escala el margen dinámicamente según la magnitud de las coordenadas.
        </p>
      </div>
    </div>
  );
}
