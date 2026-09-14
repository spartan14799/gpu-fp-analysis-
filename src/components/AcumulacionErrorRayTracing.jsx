import { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Layers
} from "lucide-react";

export default function AcumulacionErrorRayTracing() {
  const [bounces, setBounces] = useState(3);
  const [precisionMode, setPrecisionMode] = useState("fp16"); // "exact", "fp32", "fp16"
  const [useEpsilon, setUseEpsilon] = useState(false);
  const [viewMode, setViewMode] = useState("compare"); // "compare", "exact", "discrete"
  const [showMicroZoom, setShowMicroZoom] = useState(false);

  // Parámetros físicos de la escena SVG (600 x 300)
  const emitter = { x: 50, y: 155 };
  const topMirrorY = 55;
  const bottomMirrorY = 245;
  const wallX = 430;
  const wallThickness = 12;
  const wallTop = 50;
  const wallBottom = 250;

  // 1. Trayectoria Continua (Física Ideal Exacta R)
  const exactPoints = [
    emitter,
    { x: 195, y: topMirrorY },
    { x: 340, y: bottomMirrorY },
    { x: wallX, y: 118 },
    { x: 350, y: 40 }
  ];

  // 2. Desviación y Acumulación de Error Numérico (IEEE 754)
  const errorScale = precisionMode === "exact" ? 0 : precisionMode === "fp32" ? 0.35 : 1.0;
  
  // Deriva angular y desplazamiento en mantisa acumulado en cada rebote
  const drift1 = { x: 0, y: 0 };
  const drift2 = { x: 4 * errorScale, y: -2 * errorScale };
  const drift3 = { x: 10 * errorScale, y: 6 * errorScale };

  // Si no hay epsilon y el error es suficiente, el rayo cae detrás de la superficie y atraviesa la pared
  const rayLeaked = !useEpsilon && precisionMode !== "exact" && bounces >= 3;

  const wallImpactX = useEpsilon 
    ? wallX - 2 
    : wallX + (precisionMode === "exact" ? 0 : 16 * errorScale);

  const wallImpactY = 118 + drift3.y;

  const discretePoints = [
    emitter,
    { x: exactPoints[1].x + drift1.x, y: topMirrorY },
    { x: exactPoints[2].x + drift2.x, y: bottomMirrorY },
    { x: wallImpactX, y: wallImpactY },
    rayLeaked
      ? { x: 550, y: wallImpactY - 10 } // Atraviesa la pared hacia la habitación oscura
      : { x: 345 - 8 * errorScale, y: 45 + drift3.y } // Rebote frontal correcto amortiguado
  ];

  // Distancia de error euclidiana acumulada en el último rebote visible
  const activeBounces = Math.min(bounces, exactPoints.length - 1);
  const currentExact = exactPoints[activeBounces];
  const currentDiscrete = discretePoints[activeBounces];
  const accumulatedErrorUlp = precisionMode === "exact" 
    ? 0 
    : (Math.hypot(currentDiscrete.x - currentExact.x, currentDiscrete.y - currentExact.y) * 
        (precisionMode === "fp16" ? 32 : 8)).toFixed(1);

  return (
    <div className="flex flex-col gap-6 w-full border border-line rounded-sm p-5 sm:p-6 bg-surface mt-6">
      
      {/* Encabezado del componente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-sign font-bold uppercase tracking-wider">
              Simulación Interactiva
            </span>
            <span className="text-ink-faint text-xs">·</span>
            <span className="font-mono text-xs text-ink-dim">Trazado de Rayos & Acumulación de Error</span>
          </div>
          <h4 className="text-base sm:text-lg font-medium text-ink mt-1">
            Física Continua frente a Discretización IEEE 754
          </h4>
        </div>

        {/* Selector de modo de vista */}
        <div className="flex items-center bg-bg p-1 rounded-sm border border-line self-start sm:self-auto">
          <button
            onClick={() => setViewMode("compare")}
            className={`px-2.5 py-1 text-xs font-mono rounded-[2px] transition-colors ${
              viewMode === "compare" 
                ? "bg-surface-2 text-ink font-semibold" 
                : "text-ink-dim hover:text-ink"
            }`}
          >
            Comparativa
          </button>
          <button
            onClick={() => setViewMode("exact")}
            className={`px-2.5 py-1 text-xs font-mono rounded-[2px] transition-colors ${
              viewMode === "exact" 
                ? "bg-surface-2 text-mant font-semibold" 
                : "text-ink-dim hover:text-ink"
            }`}
          >
            Ideal Continuo
          </button>
          <button
            onClick={() => setViewMode("discrete")}
            className={`px-2.5 py-1 text-xs font-mono rounded-[2px] transition-colors ${
              viewMode === "discrete" 
                ? "bg-surface-2 text-sign font-semibold" 
                : "text-ink-dim hover:text-ink"
            }`}
          >
            Discreto FP
          </button>
        </div>
      </div>

      {/* Escena Gráfica Interactiva (SVG) */}
      <div className="relative w-full aspect-[2/1] min-h-[260px] sm:min-h-[320px] bg-bg border border-line rounded-sm overflow-hidden flex items-center justify-center select-none">
        
        {/* Cuadrícula sutil de fondo */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-ink-dim) 1px, transparent 0)",
            backgroundSize: "20px 20px"
          }}
        />

        <svg 
          viewBox="0 0 600 300" 
          className="w-full h-full object-contain"
        >
          <defs>
            {/* Gradiente para la habitación en sombra */}
            <linearGradient id="shadowZone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={rayLeaked ? "rgba(242, 102, 90, 0.25)" : "rgba(18, 24, 34, 0.95)"} />
              <stop offset="100%" stopColor={rayLeaked ? "rgba(242, 102, 90, 0.08)" : "rgba(11, 15, 20, 0.98)"} />
            </linearGradient>

            {/* Marcadores de flecha */}
            <marker id="arrow-exact" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--color-mant)" />
            </marker>
            <marker id="arrow-discrete" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--color-sign)" />
            </marker>
          </defs>

          {/* 1. Habitación Oscura (Detrás de la pared) */}
          <rect 
            x={wallX + wallThickness} 
            y={40} 
            width={150} 
            height={220} 
            fill="url(#shadowZone)"
            stroke="var(--color-line)"
            strokeDasharray="4 4"
            className="transition-colors duration-500"
          />
          <text 
            x={wallX + wallThickness + 75} 
            y={60} 
            textAnchor="middle" 
            className="font-mono text-[10px] fill-ink-faint uppercase tracking-wider"
          >
            Habitación en Sombra
          </text>

          {/* Sensor u objeto oculto en la sombra */}
          <circle 
            cx={540} 
            cy={110} 
            r={16} 
            fill={rayLeaked ? "rgba(242, 102, 90, 0.3)" : "rgba(42, 52, 68, 0.4)"}
            stroke={rayLeaked ? "var(--color-sign)" : "var(--color-line)"}
            strokeWidth={rayLeaked ? "2" : "1"}
            className="transition-all duration-300"
          />
          <text 
            x={540} 
            y={114} 
            textAnchor="middle" 
            className={`font-mono text-[9px] font-bold ${rayLeaked ? "fill-sign animate-pulse" : "fill-ink-faint"}`}
          >
            {rayLeaked ? "ILUMINADO" : "EN SOMBRA"}
          </text>

          {/* 2. Espejos / Reflectores (Superior e Inferior) */}
          {/* Espejo Superior */}
          <rect x={120} y={topMirrorY - 10} width={270} height={10} fill="var(--color-surface-2)" stroke="var(--color-line)" />
          <line x1={120} y1={topMirrorY} x2={390} y2={topMirrorY} stroke="var(--color-ink-dim)" strokeWidth="2" />
          <text x={255} y={topMirrorY - 14} textAnchor="middle" className="font-mono text-[9px] fill-ink-dim">
            SUPERFICIE REFLECTORA 1
          </text>

          {/* Espejo Inferior */}
          <rect x={240} y={bottomMirrorY} width={170} height={10} fill="var(--color-surface-2)" stroke="var(--color-line)" />
          <line x1={240} y1={bottomMirrorY} x2={410} y2={bottomMirrorY} stroke="var(--color-ink-dim)" strokeWidth="2" />
          <text x={325} y={bottomMirrorY + 22} textAnchor="middle" className="font-mono text-[9px] fill-ink-dim">
            SUPERFICIE REFLECTORA 2
          </text>

          {/* 3. Pared Delgada (Obstáculo Geométrico) */}
          <rect 
            x={wallX} 
            y={wallTop} 
            width={wallThickness} 
            height={wallBottom - wallTop} 
            fill="var(--color-surface-2)" 
            stroke="var(--color-line)"
            strokeWidth="1.5"
            rx="1"
          />
          {/* Rayado interno de la pared */}
          <line x1={wallX} y1={90} x2={wallX + wallThickness} y2={100} stroke="var(--color-line)" strokeWidth="1" />
          <line x1={wallX} y1={140} x2={wallX + wallThickness} y2={150} stroke="var(--color-line)" strokeWidth="1" />
          <line x1={wallX} y1={190} x2={wallX + wallThickness} y2={200} stroke="var(--color-line)" strokeWidth="1" />
          
          <text 
            x={wallX + wallThickness / 2} 
            y={wallTop - 8} 
            textAnchor="middle" 
            className="font-mono text-[9px] fill-ink font-bold"
          >
            Pared Delgada
          </text>

          {/* Capa de Tolerancia Epsilon (Margen de Amortiguación) si está activa */}
          {useEpsilon && (
            <g>
              <rect 
                x={wallX - 6} 
                y={wallTop - 2} 
                width={6} 
                height={wallBottom - wallTop + 4} 
                fill="rgba(242, 184, 75, 0.25)" 
                stroke="var(--color-exp)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text 
                x={wallX - 9} 
                y={190} 
                textAnchor="end" 
                className="font-mono text-[8px] fill-exp font-bold"
              >
                Margen ε
              </text>
            </g>
          )}

          {/* 4. Emisor de Rayos (Cámara / Fotón) */}
          <circle cx={emitter.x} cy={emitter.y} r={10} fill="var(--color-surface-2)" stroke="var(--color-line)" strokeWidth="2" />
          <circle cx={emitter.x} cy={emitter.y} r={4} fill="var(--color-ink)" />
          <text x={emitter.x} y={emitter.y + 22} textAnchor="middle" className="font-mono text-[9px] fill-ink-dim">
            FOTÓN / RAYO
          </text>

          {/* 5. Trazo: FÍSICA CONTINUA (Exacta R) - Color Mant/Cian */}
          {(viewMode === "compare" || viewMode === "exact") && (
            <g>
              {exactPoints.slice(0, activeBounces).map((p, i) => {
                const nextP = exactPoints[i + 1];
                if (!nextP) return null;
                return (
                  <line
                    key={`exact-${i}`}
                    x1={p.x}
                    y1={p.y}
                    x2={nextP.x}
                    y2={nextP.y}
                    stroke="var(--color-mant)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeOpacity={viewMode === "compare" ? "0.85" : "1"}
                  />
                );
              })}
              {exactPoints.slice(1, activeBounces + 1).map((p, i) => (
                <circle 
                  key={`exact-node-${i}`} 
                  cx={p.x} 
                  cy={p.y} 
                  r={3.5} 
                  fill="var(--color-bg)" 
                  stroke="var(--color-mant)" 
                  strokeWidth="2" 
                />
              ))}
            </g>
          )}

          {/* 6. Trazo: DISCRETO IEEE 754 (Con pérdida de precisión) - Color Sign/Coral */}
          {(viewMode === "compare" || viewMode === "discrete") && (
            <g>
              {discretePoints.slice(0, activeBounces).map((p, i) => {
                const nextP = discretePoints[i + 1];
                if (!nextP) return null;
                const isPenetrating = rayLeaked && i === 2;
                return (
                  <line
                    key={`discrete-${i}`}
                    x1={p.x}
                    y1={p.y}
                    x2={nextP.x}
                    y2={nextP.y}
                    stroke="var(--color-sign)"
                    strokeWidth={viewMode === "compare" ? "2" : "2.5"}
                    strokeDasharray={viewMode === "compare" ? "5 3" : "none"}
                    strokeLinecap="round"
                    className={isPenetrating ? "animate-pulse" : ""}
                  />
                );
              })}

              {/* Puntos de rebote discretos con halos de error */}
              {discretePoints.slice(1, activeBounces + 1).map((p, i) => {
                const exactP = exactPoints[i + 1] || exactPoints[i];
                const hasError = precisionMode !== "exact" && i > 0;
                return (
                  <g key={`discrete-node-${i}`}>
                    {hasError && viewMode === "compare" && (
                      <line 
                        x1={exactP.x} 
                        y1={exactP.y} 
                        x2={p.x} 
                        y2={p.y} 
                        stroke="var(--color-sign)" 
                        strokeWidth="1" 
                        strokeDasharray="2 2" 
                        opacity="0.6"
                      />
                    )}
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={hasError ? 4 : 3} 
                      fill="var(--color-sign)" 
                      stroke="var(--color-bg)" 
                      strokeWidth="1.5" 
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Alerta de Colisión / Fuga en la pared */}
          {rayLeaked && (
            <g className="animate-in fade-in zoom-in-90 duration-300">
              <circle cx={wallImpactX} cy={wallImpactY} r={12} fill="rgba(242, 102, 90, 0.3)" />
              <circle cx={wallImpactX} cy={wallImpactY} r={6} fill="var(--color-sign)" />
              <rect x={wallX - 96} y={wallImpactY - 26} width={88} height={18} rx="2" fill="var(--color-surface)" stroke="var(--color-sign)" />
              <text x={wallX - 52} y={wallImpactY - 14} textAnchor="middle" className="font-mono text-[8px] fill-sign font-bold">
                ¡FUGA DE LUZ!
              </text>
            </g>
          )}

          {/* Indicador de rebote amortiguado */}
          {!rayLeaked && useEpsilon && bounces >= 3 && (
            <g className="animate-in fade-in duration-300">
              <circle cx={wallImpactX} cy={wallImpactY} r={6} fill="var(--color-exp)" />
              <rect x={wallX - 106} y={wallImpactY - 26} width={98} height={18} rx="2" fill="var(--color-surface)" stroke="var(--color-exp)" />
              <text x={wallX - 57} y={wallImpactY - 14} textAnchor="middle" className="font-mono text-[8px] fill-exp font-bold">
                REBOTE AMORTIGUADO
              </text>
            </g>
          )}
        </svg>

        {/* Leyenda flotante en la escena */}
        <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm border border-line p-2.5 rounded-sm flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-mant rounded-full"></span>
            <span className="font-mono text-[10px] text-ink-dim">Física Continua (Sin error)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-sign border-dashed rounded-full"></span>
            <span className="font-mono text-[10px] text-ink-dim">IEEE 754 ({precisionMode.toUpperCase()})</span>
          </div>
          {useEpsilon && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-2 bg-exp/20 border border-exp border-dashed rounded-[1px]"></span>
              <span className="font-mono text-[10px] text-exp">Margen Tolerancia (ε)</span>
            </div>
          )}
        </div>
      </div>

      {/* Diagnóstico de Estado Numérico */}
      <div className={`p-4 rounded-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        rayLeaked 
          ? "bg-sign/10 border-sign/40 text-sign" 
          : useEpsilon 
            ? "bg-exp/10 border-exp/40 text-exp" 
            : "bg-surface-2 border-line text-mant"
      }`}>
        <div className="flex items-center gap-3">
          {rayLeaked ? (
            <AlertTriangle className="size-5 shrink-0 text-sign" />
          ) : (
            <ShieldCheck className="size-5 shrink-0 text-mant" />
          )}
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider">
              {rayLeaked 
                ? "Fallo crítico: El rayo atravesó la pared sólida (Light Leaking)" 
                : useEpsilon 
                  ? "Intersección amortiguada exitosamente mediante margen ε" 
                  : "Trayectoria matemáticamente ideal y coherente"}
            </p>
            <p className="text-xs text-ink-dim mt-0.5">
              {rayLeaked 
                ? "El error acumulado en la mantisa desplazó el punto de cálculo detrás de la superficie. La GPU concluyó que el rayo no colisionó con la cara frontal."
                : useEpsilon 
                  ? "Se añadió un sesgo hacia afuera de la normal (offset ε). El rayo rebota en la superficie sin penetrar ni auto-colisionar."
                  : "Espacio euclidiano analítico continuo. No hay pérdida de precisión decimal ni desvío."}
            </p>
          </div>
        </div>

        <div className="font-mono text-xs shrink-0 self-end sm:self-auto bg-bg/80 px-3 py-1.5 rounded-sm border border-line">
          <span className="text-ink-faint mr-2">Error Acumulado:</span>
          <span className={rayLeaked ? "text-sign font-bold" : "text-ink"}>
            ~{accumulatedErrorUlp} ULP
          </span>
        </div>
      </div>

      {/* Controles Interactivos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        
        {/* Control 1: Número de Rebotes */}
        <div className="p-4 bg-bg border border-line rounded-sm flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-ink-dim uppercase">Rebotes de Luz</span>
            <span className="font-mono text-xs font-bold text-ink bg-surface px-2 py-0.5 rounded-sm border border-line">
              {bounces} {bounces === 1 ? "rebote" : "rebotes"}
            </span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="4" 
            value={bounces} 
            onChange={(e) => setBounces(Number(e.target.value))}
            className="w-full accent-mant cursor-pointer"
          />
          <p className="text-[11px] text-ink-faint leading-tight">
            Cada rebote calcula una nueva intersección y refleja el vector, sumando errores de redondeo.
          </p>
        </div>

        {/* Control 2: Precisión IEEE 754 */}
        <div className="p-4 bg-bg border border-line rounded-sm flex flex-col justify-between gap-3">
          <span className="font-mono text-xs text-ink-dim uppercase">Precisión Numérica</span>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "exact", label: "Exacto" },
              { id: "fp32", label: "Float32" },
              { id: "fp16", label: "Float16" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPrecisionMode(mode.id)}
                className={`py-1.5 text-xs font-mono rounded-[2px] transition-all border ${
                  precisionMode === mode.id
                    ? "bg-surface-2 border-ink text-ink font-bold"
                    : "border-line text-ink-dim hover:text-ink"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-ink-faint leading-tight">
            {precisionMode === "exact" && "Matemática continua pura sin mantisa limitada."}
            {precisionMode === "fp32" && "23 bits de mantisa (~7 dígitos decimales). Error bajo pero persistente."}
            {precisionMode === "fp16" && "10 bits de mantisa (~3.3 dígitos decimales). Desviación acelerada."}
          </p>
        </div>

        {/* Control 3: Amortiguación (Ray Epsilon) */}
        <div className="p-4 bg-bg border border-line rounded-sm flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-ink-dim uppercase">Amortiguador (Bias)</span>
            <button
              onClick={() => setUseEpsilon(!useEpsilon)}
              className={`px-3 py-1 text-xs font-mono rounded-[2px] font-bold border transition-all ${
                useEpsilon 
                  ? "bg-exp/20 border-exp text-exp" 
                  : "bg-surface border-line text-ink-dim hover:border-ink-dim"
              }`}
            >
              {useEpsilon ? "ACTIVO (ε ON)" : "DESACTIVADO"}
            </button>
          </div>
          <p className="text-[11px] text-ink-faint leading-tight">
            Aplica un margen de tolerancia geométrico para absorber la imprecisión de la mantisa antes de evaluar la siguiente colisión.
          </p>
          <button 
            onClick={() => setShowMicroZoom(!showMicroZoom)}
            className="flex items-center justify-center gap-1.5 text-xs font-mono text-ink hover:text-mant transition-colors pt-1 border-t border-line"
          >
            <Eye className="size-3.5" />
            <span>{showMicroZoom ? "Ocultar zoom microscópico" : "Ver qué pasa a nivel de bits (Zoom)"}</span>
          </button>
        </div>

      </div>

      {/* Vista Aumentada / Explicación Microscópica (Acordeón / Zoom) */}
      {showMicroZoom && (
        <div className="mt-2 p-5 bg-bg border border-line rounded-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="size-4 text-exp" />
            <h5 className="font-mono text-xs font-bold uppercase text-ink tracking-wider">
              Anatomía de la Superficie: El por qué del fallo
            </h5>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Diagrama SVG esquemático a nivel micro */}
            <div className="w-full aspect-[16/9] border border-line rounded-sm bg-surface p-3 flex items-center justify-center">
              <svg viewBox="0 0 300 160" className="w-full h-full">
                {/* Superficie física */}
                <rect x={120} y={20} width={140} height={120} fill="var(--color-surface-2)" stroke="var(--color-line)" />
                <line x1={120} y1={20} x2={120} y2={140} stroke="var(--color-ink-dim)" strokeWidth="2" />
                <text x={190} y={85} textAnchor="middle" className="font-mono text-[9px] fill-ink-faint">
                  INTERIOR SÓLIDO
                </text>

                {/* Normal */}
                <line x1={120} y1={80} x2={70} y2={80} stroke="var(--color-ink-dim)" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x={75} y={72} className="font-mono text-[8px] fill-ink-dim">Vector Normal N</text>

                {/* Zona de error IEEE 754 */}
                <rect x={112} y={35} width={16} height={90} fill="rgba(242, 102, 90, 0.15)" stroke="var(--color-sign)" strokeWidth="1" strokeDasharray="2 2" />
                <text x={120} y={135} textAnchor="middle" className="font-mono text-[7px] fill-sign">
                  Incertidumbre de Mantisa
                </text>

                {/* Rayo incidente */}
                <line x1={30} y1={25} x2={123} y2={77} stroke="var(--color-sign)" strokeWidth="2" />
                
                {/* Punto sin compensar (Cae adentro) */}
                <circle cx={124} cy={77} r={4} fill="var(--color-sign)" />
                <text x={132} y={75} className="font-mono text-[8px] fill-sign font-bold">
                  P calculado (dentro!)
                </text>

                {/* Punto con Epsilon (Empujado afuera) */}
                {useEpsilon && (
                  <g>
                    <line x1={124} y1={77} x2={110} y2={77} stroke="var(--color-exp)" strokeWidth="1.5" markerEnd="url(#arrow-exact)" />
                    <circle cx={110} cy={77} r={4} fill="var(--color-exp)" />
                    <text x={95} y={95} className="font-mono text-[8px] fill-exp font-bold">
                      P + ε·N (seguro)
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Explicación Teórica vinculada a la intuición */}
            <div className="space-y-3 text-xs text-ink-dim leading-relaxed">
              <p>
                <strong className="text-ink">1. La trampa del redondeo:</strong> Al calcular la distancia de intersección resolviendo las ecuaciones analíticas de colisión, el valor final de posición se trunca a los bits disponibles de la mantisa.
              </p>
              <p>
                <strong className="text-ink">2. El salto de barrera:</strong> Si por redondeo el punto resultante queda por dentro de la cara externa, el siguiente rayo comenzará su trayectoria <em>dentro</em> de la pared. Al buscar la siguiente colisión, la GPU evalúa hacia adelante y se salta la pared por completo (fuga de luz o sombra ausente).
              </p>
              <p>
                <strong className="text-exp">3. El margen de tolerancia intuido:</strong> Justo como pensaste en tu intuición, en la práctica los motores de renderizado usan un <strong>Ray Epsilon (offset ε)</strong>. Antes de disparar el siguiente rayo, empujan el punto de origen una distancia microscópica hacia afuera sobre la normal de la superficie, garantizando que el nuevo rayo jamás quede atrapado en el sólido.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
