// Fuente única de verdad para la navegación.
// kind:"anchor"  -> vive en la landing ("/"), se llega haciendo scroll.
// kind:"route"   -> es una página independiente, se llega navegando.
export const SECTIONS = [
  { id: "inicio", index: "00", label: "Inicio", accent: "ink", kind: "anchor" },
  { id: "intuicion", index: "01", label: "Intuición inicial", accent: "sign", kind: "route", path: "/intuicion" },
  { id: "modulo-1", index: "02", label: "Bits y rsqrt inversa", accent: "exp", kind: "route", path: "/modulo-1" },
  { id: "modulo-2", index: "03", label: "Trazado de Rayos", accent: "mant", kind: "route", path: "/modulo-2" },
  { id: "modulo-3", index: "04", label: "Integrante 3", accent: "mant", kind: "route", path: "/modulo-3" },
  { id: "resultados", index: "05", label: "Resultados", accent: "sign", kind: "route", path: "/resultados" },
];
