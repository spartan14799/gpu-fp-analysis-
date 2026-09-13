import { useMemo, useState } from "react";
import BitField from "./BitField.jsx";
import Formula from "./Formula.jsx";
import { inspectFloat32 } from "../lib/float32.js";

const PRESETS = [0.1, 3.14159, 16777217, 1e20, 1 / 3];

function formatSignificant(n) {
  if (!Number.isFinite(n)) return String(n);
  const s = n.toPrecision(9);
  if (s.includes("e")) {
    const [mantissa, exp] = s.split("e");
    const trimmed = mantissa.includes(".")
      ? mantissa.replace(/0+$/, "").replace(/\.$/, "")
      : mantissa;
    return `${trimmed}e${exp}`;
  }
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
}

export default function FloatInspector() {
  const [raw, setRaw] = useState("3.14159");

  const parsed = useMemo(() => {
    const n = Number.parseFloat(raw);
    return Number.isNaN(n) ? 0 : n;
  }, [raw]);

  const info = useMemo(() => inspectFloat32(parsed), [parsed]);
  const gap = Math.abs(info.nextValue - info.reconstructed);

  return (
    <div className="w-full rounded-sm border border-line bg-surface p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="float-in" className="font-mono text-xs text-ink-dim">
          valor decimal
        </label>
        <span className="font-mono text-[10px] text-ink-faint">binary32</span>
      </div>

      <input
        id="float-in"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        inputMode="decimal"
        spellCheck={false}
        className="mt-1 w-full border-b border-line bg-transparent pb-2 font-display text-2xl text-ink outline-none focus-visible:border-mant sm:text-3xl"
      />

      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setRaw(String(p))}
            className="rounded-sm border border-line px-2 py-1 font-mono text-[11px] text-ink-dim transition-colors hover:border-mant hover:text-ink"
          >
            {formatSignificant(p)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <BitField
          values={{
            sign: info.signBin,
            exponent: info.exponentBin,
            mantissa: info.mantissaBin,
          }}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 font-mono text-xs sm:grid-cols-4">
        <div>
          <dt className="text-ink-faint">hex</dt>
          <dd className="mt-0.5 text-ink">{info.hex}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">exponente real</dt>
          <dd className="mt-0.5 text-exp">
            {info.exponentRaw} − 127 = {info.exponentValue}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">valor almacenado</dt>
          <dd className="mt-0.5 text-ink" title={String(info.reconstructed)}>
            {formatSignificant(info.reconstructed)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">salto al siguiente float</dt>
          <dd className="mt-0.5 text-mant">{gap === 0 ? "0" : gap.toExponential(3)}</dd>
        </div>
      </dl>

      <div className="mt-4 overflow-x-auto border-t border-line pt-4">
        <Formula
          tex={`\\text{valor} = (-1)^{${info.sign}} \\times 1.M \\times 2^{(${info.exponentRaw} - 127)}`}
          block
        />
      </div>
    </div>
  );
}
