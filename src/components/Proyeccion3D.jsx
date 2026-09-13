import { useEffect, useRef, useState } from "react";
import Formula from "./Formula.jsx";

const WIDTH = 460;
const HEIGHT = 320;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const FOCAL = 300;
const CAMERA_D = 4;
const ROT_SPEED = 0.45; // rad/s

const VERTS = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

function project(p, angle) {
  const [x, y, z] = p;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x1 = x * cos + z * sin;
  const z1 = -x * sin + z * cos;
  const denom = z1 + CAMERA_D;
  return {
    x: CX + (FOCAL * x1) / denom,
    y: CY + (FOCAL * y) / denom,
    depth: z1,
  };
}

export default function Proyeccion3D() {
  const [angle, setAngle] = useState(0.6);
  const rafRef = useRef(null);
  const lastRef = useRef(0);

  useEffect(() => {
    const step = (ts) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setAngle((a) => a + dt * ROT_SPEED);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const projected = VERTS.map((p) => project(p, angle));

  return (
    <div className="w-full rounded-sm border border-line bg-surface p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-ink-dim">espacio 3D → pantalla 2D</p>
        <p className="font-mono text-[10px] text-ink-faint">rotación automática</p>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mx-auto mt-3 w-full max-w-sm">
        {EDGES.map(([a, b], i) => {
          const pa = projected[a];
          const pb = projected[b];
          const avgDepth = (pa.depth + pb.depth) / 2;
          const t = (avgDepth + 1.8) / 3.6; // 0 (lejos) .. 1 (cerca), aprox.
          const opacity = 0.35 + 0.55 * Math.min(Math.max(t, 0), 1);
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke="var(--color-mant)"
              strokeWidth="1.5"
              opacity={opacity}
            />
          );
        })}
        {projected.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--color-sign)" />
        ))}
      </svg>

      <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
        <div className="overflow-x-auto">
          <p className="mb-2 font-mono text-[11px] text-ink-faint">rotación (alrededor del eje Y)</p>
          <Formula tex="x' = x\cos\theta + z\sin\theta,\quad z' = z\cos\theta - x\sin\theta" />
        </div>
        <div className="overflow-x-auto">
          <p className="mb-2 font-mono text-[11px] text-ink-faint">proyección en perspectiva</p>
          <Formula tex="\text{pantalla}_x = \dfrac{f\, x'}{z' + d},\quad \text{pantalla}_y = \dfrac{f\, y}{z' + d}" />
        </div>
      </div>
    </div>
  );
}
