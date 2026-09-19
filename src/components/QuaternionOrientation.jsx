import { useEffect, useMemo, useRef, useState } from "react";

const WIDTH = 620;
const HEIGHT = 390;
const CX = 310;
const CY = 184;
const FOCAL = 420;
const CAMERA_DISTANCE = 7;

const VERTICES = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

const FACES = [
  { vertices: [0, 1, 2, 3], fill: "var(--color-surface-2)" },
  { vertices: [4, 5, 6, 7], fill: "var(--color-mant-dim)" },
  { vertices: [0, 4, 7, 3], fill: "var(--color-exp-dim)" },
  { vertices: [1, 5, 6, 2], fill: "var(--color-sign-dim)" },
  { vertices: [3, 2, 6, 7], fill: "var(--color-mant-dim)" },
  { vertices: [0, 1, 5, 4], fill: "var(--color-exp-dim)" },
];

const GRID_LINES = Array.from({ length: 9 }, (_, index) => {
  const offset = index - 4;
  return [
    [[offset, -1.55, -4], [offset, -1.55, 4]],
    [[-4, -1.55, offset], [4, -1.55, offset]],
  ];
}).flat();

function cross([ax, ay, az], [bx, by, bz]) {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}

function rotateByQuaternion(point, quaternion) {
  const [w, x, y, z] = quaternion;
  const vector = [x, y, z];
  const uv = cross(vector, point);
  const uuv = cross(vector, uv);
  return point.map((coordinate, index) => coordinate + 2 * (w * uv[index] + uuv[index]));
}

function project([x, y, z]) {
  const yaw = -0.65;
  const pitch = -0.38;
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);

  const cameraX = x * cosY - z * sinY;
  const yawZ = x * sinY + z * cosY;
  const cameraY = y * cosP - yawZ * sinP;
  const cameraZ = y * sinP + yawZ * cosP;
  const scale = FOCAL / (CAMERA_DISTANCE - cameraZ);

  return {
    x: CX + cameraX * scale,
    y: CY - cameraY * scale,
    depth: cameraZ,
  };
}

function normalizeAxis(axis) {
  const norm = Math.hypot(...axis);
  return norm < 0.001 ? [0, 1, 0] : axis.map((component) => component / norm);
}

function formatNumber(value) {
  const rounded = Math.abs(value) < 0.000005 ? 0 : value;
  return rounded.toFixed(5);
}

export default function QuaternionOrientation() {
  const [axis, setAxis] = useState([0.35, 0.85, 0.4]);
  const [angle, setAngle] = useState(55);
  const [playing, setPlaying] = useState(false);
  const animationRef = useRef(null);
  const previousTimeRef = useRef(null);

  useEffect(() => {
    if (!playing) {
      previousTimeRef.current = null;
      cancelAnimationFrame(animationRef.current);
      return undefined;
    }

    const animate = (time) => {
      if (previousTimeRef.current !== null) {
        const elapsed = (time - previousTimeRef.current) / 1000;
        setAngle((current) => {
          const next = current + elapsed * 35;
          return next > 180 ? next - 360 : next;
        });
      }
      previousTimeRef.current = time;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [playing]);

  const unitAxis = useMemo(() => normalizeAxis(axis), [axis]);
  const radians = (angle * Math.PI) / 180;
  const halfSin = Math.sin(radians / 2);
  const quaternion = [
    Math.cos(radians / 2),
    unitAxis[0] * halfSin,
    unitAxis[1] * halfSin,
    unitAxis[2] * halfSin,
  ];
  const quaternionNorm = Math.hypot(...quaternion);
  const projectedVertices = VERTICES.map((vertex) =>
    project(rotateByQuaternion(vertex, quaternion)),
  );
  const visibleFaces = FACES.map((face) => ({
    ...face,
    depth:
      face.vertices.reduce((sum, index) => sum + projectedVertices[index].depth, 0) /
      face.vertices.length,
  })).sort((a, b) => a.depth - b.depth);

  const axisStart = project(unitAxis.map((component) => component * -2.05));
  const axisEnd = project(unitAxis.map((component) => component * 2.05));

  const setAxisComponent = (index, value) => {
    setAxis((current) => current.map((component, i) => (i === index ? value : component)));
  };

  const values = [
    ["θ", `${angle.toFixed(1)}°`],
    ["w", formatNumber(quaternion[0])],
    ["x", formatNumber(quaternion[1])],
    ["y", formatNumber(quaternion[2])],
    ["z", formatNumber(quaternion[3])],
    ["‖q‖", quaternionNorm.toFixed(6)],
  ];

  return (
    <div className="w-full overflow-hidden rounded-sm border border-line bg-surface">
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
        <div className="relative min-w-0 border-b border-line p-3 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs text-ink-dim">orientación del sólido</p>
            <p className="font-mono text-[10px] text-ink-faint">línea punteada: eje unitario u</p>
          </div>

          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="mt-2 w-full"
            role="img"
            aria-labelledby="quaternion-title quaternion-description"
          >
            <title id="quaternion-title">Sólido orientado mediante un cuaternión</title>
            <desc id="quaternion-description">
              Un cubo tridimensional cambia de orientación según el eje y el ángulo seleccionados.
            </desc>

            {GRID_LINES.map(([start, end], index) => {
              const a = project(start);
              const b = project(end);
              return (
                <line
                  key={index}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="var(--color-line)"
                  strokeWidth="1"
                  opacity="0.55"
                />
              );
            })}

            {visibleFaces.map((face, index) => (
              <polygon
                key={index}
                points={face.vertices
                  .map((vertexIndex) => {
                    const point = projectedVertices[vertexIndex];
                    return `${point.x},${point.y}`;
                  })
                  .join(" ")}
                fill={face.fill}
                fillOpacity="0.78"
                stroke="var(--color-ink-dim)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            ))}

            <line
              x1={axisStart.x}
              y1={axisStart.y}
              x2={axisEnd.x}
              y2={axisEnd.y}
              stroke="var(--color-exp)"
              strokeWidth="2"
              strokeDasharray="7 6"
            />
            <circle cx={CX} cy={CY} r="4" fill="var(--color-sign)" />
            <circle cx={axisEnd.x} cy={axisEnd.y} r="4" fill="var(--color-exp)" />
            <text
              x={axisEnd.x + 9}
              y={axisEnd.y - 7}
              fill="var(--color-exp)"
              fontFamily="var(--font-mono)"
              fontSize="13"
            >
              u
            </text>
          </svg>

          <div className="grid grid-cols-3 gap-px overflow-hidden border border-line bg-line sm:grid-cols-6">
            {values.map(([label, value]) => (
              <div key={label} className="bg-bg px-3 py-2.5">
                <span className="block font-mono text-[10px] text-ink-faint">{label}</span>
                <span className="mt-0.5 block font-mono text-xs text-ink">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="quaternion-angle" className="font-mono text-xs text-ink-dim">
                ángulo θ
              </label>
              <span className="font-mono text-xs text-ink">{angle.toFixed(1)}°</span>
            </div>
            <input
              id="quaternion-angle"
              type="range"
              min="-180"
              max="180"
              step="1"
              value={angle}
              onChange={(event) => {
                setPlaying(false);
                setAngle(Number(event.target.value));
              }}
              className="w-full accent-mant"
            />
            <p className="mt-2 font-mono text-[10px] text-ink-faint">
              {radians.toFixed(3)} radianes
            </p>
          </div>

          <fieldset>
            <legend className="mb-3 font-mono text-xs text-ink-dim">
              vector que define el eje
            </legend>
            {axis.map((component, index) => {
              const labels = ["uₓ", "uᵧ", "u_z"];
              const ids = ["quaternion-axis-x", "quaternion-axis-y", "quaternion-axis-z"];
              return (
                <div key={ids[index]} className="mb-4">
                  <div className="mb-1 flex items-center justify-between">
                    <label htmlFor={ids[index]} className="font-mono text-xs text-ink-faint">
                      {labels[index]}
                    </label>
                    <span className="font-mono text-xs text-ink">{component.toFixed(2)}</span>
                  </div>
                  <input
                    id={ids[index]}
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={component}
                    onChange={(event) => setAxisComponent(index, Number(event.target.value))}
                    className="w-full accent-exp"
                  />
                </div>
              );
            })}
          </fieldset>

          <div className="mt-2 flex flex-wrap gap-2 border-t border-line pt-5">
            <button
              type="button"
              onClick={() => setPlaying((current) => !current)}
              className="rounded-sm border border-mant-dim bg-mant-dim/20 px-4 py-2 font-mono text-xs text-mant transition-colors hover:bg-mant-dim/35"
            >
              {playing ? "Pausar giro" : "Animar giro"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setAxis([0.35, 0.85, 0.4]);
                setAngle(55);
              }}
              className="rounded-sm border border-line px-4 py-2 font-mono text-xs text-ink-dim transition-colors hover:border-ink-dim hover:text-ink"
            >
              Restablecer
            </button>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink-dim">
            Los valores <span className="font-mono text-ink">x, y, z</span> son la parte
            vectorial del cuaternión; describen el eje escalado por el ángulo, no la posición
            cartesiana del sólido.
          </p>
        </div>
      </div>
    </div>
  );
}
