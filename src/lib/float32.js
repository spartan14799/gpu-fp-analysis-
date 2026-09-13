// Utilidades IEEE 754 (binary32) usadas por el inspector de bits.
// Un float32 se divide en 3 campos: signo (1 bit) · exponente (8 bits, sesgo 127) · mantisa (23 bits).

const BUF = new ArrayBuffer(4);
const F32 = new Float32Array(BUF);
const U32 = new Uint32Array(BUF);

/** Descompone un número en sus campos IEEE 754 binary32. */
export function inspectFloat32(value) {
  const num = Number.isFinite(value) ? value : 0;
  F32[0] = num;
  const bits = U32[0];

  const sign = (bits >>> 31) & 1;
  const exponentRaw = (bits >>> 23) & 0xff;
  const mantissaRaw = bits & 0x7fffff;

  const isZero = exponentRaw === 0 && mantissaRaw === 0;
  const isSubnormal = exponentRaw === 0 && mantissaRaw !== 0;
  const isSpecial = exponentRaw === 0xff; // Infinito o NaN
  const isNaN = isSpecial && mantissaRaw !== 0;
  const isInfinite = isSpecial && mantissaRaw === 0;

  const exponentValue = isSubnormal || isZero ? -126 : exponentRaw - 127;
  const leadingBit = isSubnormal || isZero ? 0 : 1;

  return {
    input: value,
    reconstructed: F32[0],
    bits,
    sign,
    exponentRaw,
    mantissaRaw,
    exponentValue,
    leadingBit,
    isZero,
    isSubnormal,
    isSpecial,
    isNaN,
    isInfinite,
    signBin: sign.toString(2),
    exponentBin: exponentRaw.toString(2).padStart(8, "0"),
    mantissaBin: mantissaRaw.toString(2).padStart(23, "0"),
    hex: "0x" + bits.toString(16).padStart(8, "0").toUpperCase(),
    nextValue: nextFloat32(F32[0]),
  };
}

/** El siguiente float32 representable en dirección de +infinito (para medir el "salto" de precisión). */
function nextFloat32(value) {
  if (!Number.isFinite(value)) return value;
  F32[0] = value;
  if (value >= 0) {
    U32[0] += 1;
  } else if (U32[0] === 0x80000000) {
    // -0 -> el siguiente hacia +inf es el subnormal positivo más pequeño
    U32[0] = 1;
  } else {
    U32[0] -= 1;
  }
  return F32[0];
}

/** Espaciado (ULP) entre floats representables consecutivos cerca de `value`. */
export function ulpAt(value) {
  const info = inspectFloat32(value);
  return Math.abs(info.nextValue - info.reconstructed);
}
