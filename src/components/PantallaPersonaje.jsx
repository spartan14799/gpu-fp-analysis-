import { useEffect, useRef, useState } from "react";
import Formula from "./Formula.jsx";

const WIDTH = 640;
const HEIGHT = 300;
const GROUND_Y = 250;
const START_X = 60;
const PAD_X = 40;

function computeDuration(vy0, g) {
  return Math.max((2 * vy0) / g, 0.2);
}

export default function PantallaPersonaje() {
  const [vx, setVx] = useState(90);
  const [vy0, setVy0] = useState(230);
  const [g, setG] = useState(420);

  const [x0, setX0] = useState(START_X);
  const [t, setT] = useState(0);
  const [jumping, setJumping] = useState(false);
  const [trail, setTrail] = useState([]);

  const rafRef = useRef(null);
  const startRef = useRef(0);

  const duration = computeDuration(vy0, g);
  const x = x0 + vx * t;
  const y = GROUND_Y - (vy0 * t - 0.5 * g * t * t);

  function jump() {
    if (jumping) return;
    const base = x0 + vx * duration > WIDTH - PAD_X ? START_X : x0;
    setX0(base);
    setJumping(true);
    setT(0);
    setTrail([]);
    startRef.current = 0;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const clamped = Math.min(elapsed, duration);
      setT(clamped);
      setTrail((prev) => [
        ...prev,
        { x: base + vx * clamped, y: GROUND_Y - (vy0 * clamped - 0.5 * g * clamped * clamped) },
      ]);
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setJumping(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const gridLines = [];
  for (let gx = PAD_X; gx <= WIDTH - PAD_X; gx += 40) gridLines.push(gx);
  const gridRows = [];
  for (let gy = 20; gy <= GROUND_Y; gy += 40) gridRows.push(gy);

  return (
    <div className="w-full rounded-sm border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-ink-dim">v_x</span>
          <input
            type="number"
            value={vx}
            onChange={(e) => setVx(Number(e.target.value))}
            className="w-20 border-b border-line bg-transparent py-1 font-mono text-sm text-ink outline-none focus-visible:border-mant"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-ink-dim">v_y0</span>
          <input
            type="number"
            value={vy0}
            onChange={(e) => setVy0(Number(e.target.value))}
            className="w-20 border-b border-line bg-transparent py-1 font-mono text-sm text-ink outline-none focus-visible:border-mant"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-ink-dim">g</span>
          <input
            type="number"
            value={g}
            onChange={(e) => setG(Number(e.target.value))}
            className="w-20 border-b border-line bg-transparent py-1 font-mono text-sm text-ink outline-none focus-visible:border-mant"
          />
        </label>

        <button
          onClick={jump}
          disabled={jumping}
          className="ml-auto rounded-sm border border-line px-3 py-2 font-mono text-sm text-ink transition-colors hover:border-sign disabled:opacity-40"
        >
          Saltar →
        </button>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-4 w-full">
        {/* cuadrícula: la pantalla como espacio de coordenadas */}
        {gridLines.map((gx) => (
          <line key={gx} x1={gx} y1={10} x2={gx} y2={GROUND_Y} stroke="var(--color-line)" strokeWidth="0.5" />
        ))}
        {gridRows.map((gy) => (
          <line key={gy} x1={PAD_X} y1={gy} x2={WIDTH - PAD_X} y2={gy} stroke="var(--color-line)" strokeWidth="0.5" />
        ))}

        {/* origen y ejes de pantalla (y crece hacia abajo) */}
        <line x1={PAD_X} y1={10} x2={PAD_X} y2={GROUND_Y} stroke="var(--color-ink-faint)" strokeWidth="1" />
        <line x1={PAD_X} y1={GROUND_Y} x2={WIDTH - PAD_X} y2={GROUND_Y} stroke="var(--color-ink-faint)" strokeWidth="1" />
        <text x={PAD_X + 4} y={24} className="fill-ink-faint font-mono text-[10px]">
          (0,0)
        </text>
        <text x={WIDTH - PAD_X - 4} y={GROUND_Y + 16} textAnchor="end" className="fill-ink-faint font-mono text-[10px]">
          x →
        </text>
        <text x={PAD_X - 8} y={GROUND_Y - 4} textAnchor="end" className="fill-ink-faint font-mono text-[10px]">
          ↓ y
        </text>

        {/* rastro de la trayectoria */}
        {trail.length > 1 && (
          <polyline
            points={trail.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="var(--color-mant)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.6"
          />
        )}

        {/* personaje */}
        <circle cx={x} cy={y} r="9" fill="var(--color-sign)" />
        <circle cx={x} cy={y - 13} r="4" fill="var(--color-sign)" opacity="0.7" />
      </svg>

      <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
        <div className="overflow-x-auto">
          <p className="mb-2 font-mono text-[11px] text-ink-faint">desplazamiento horizontal</p>
          <Formula tex="x(t) = x_0 + v_x\, t" />
        </div>
        <div className="overflow-x-auto">
          <p className="mb-2 font-mono text-[11px] text-ink-faint">salto (cinemática con aceleración)</p>
          <Formula tex="y(t) = y_0 - \left(v_{y0}\, t - \tfrac{1}{2} g\, t^{2}\right)" />
        </div>
      </div>
    </div>
  );
}
