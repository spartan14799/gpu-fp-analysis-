import { useEffect, useState, useRef } from "react";

export default function BVHVisualizer() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep((s) => (s + 1) % 6);
      }, 1800);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleStepClick = (i) => {
    setStep(i);
    setIsPlaying(false); // Detener autoplay si el usuario interactúa
  };

  const nextStep = () => {
    setStep((s) => (s + 1) % 6);
    setIsPlaying(false);
  };

  const prevStep = () => {
    setStep((s) => (s - 1 + 6) % 6);
    setIsPlaying(false);
  };

  return (
    <div className="w-full flex flex-col items-start mt-6">
      {/* Controles de reproducción arriba del gráfico para mejor acceso */}
      <div className="w-full max-w-[65ch] flex justify-between items-center mb-4 bg-surface border border-line p-2 rounded-sm">
        <span className="text-xs font-mono text-ink-dim uppercase">Visualizador BVH</span>
        <div className="flex gap-2">
          <button onClick={prevStep} className="px-3 py-1 bg-surface-2 border border-line hover:text-ink text-ink-dim rounded-sm text-xs font-bold font-mono">
            {"<"} ANT
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className={`px-4 py-1 border rounded-sm text-xs font-bold font-mono transition-colors ${isPlaying ? 'bg-mant/20 text-mant border-mant' : 'bg-surface-2 border-line text-ink-dim hover:text-ink'}`}
          >
            {isPlaying ? "PAUSA ||" : "REPRODUCIR >"}
          </button>
          <button onClick={nextStep} className="px-3 py-1 bg-surface-2 border border-line hover:text-ink text-ink-dim rounded-sm text-xs font-bold font-mono">
            SIG {">"}
          </button>
        </div>
      </div>

      <div className="w-full max-w-[65ch] aspect-[2/1] bg-bg border border-line rounded-sm relative overflow-hidden flex items-center justify-center p-6">
        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
          {/* Geometría: Triángulos */}
          <polygon points="30,15 40,10 33,25" fill="none" stroke="currentColor" strokeWidth="0.4" className={`text-ink transition-opacity duration-300 ${step >= 4 ? "opacity-100" : "opacity-30"}`} />
          <polygon points="45,15 50,25 33,25" fill="none" stroke="currentColor" strokeWidth="0.4" className={`text-ink transition-opacity duration-300 ${step >= 4 ? "opacity-100" : "opacity-30"}`} />
          
          <polygon points="60,35 70,30 65,45" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-ink opacity-20" />
          <polygon points="75,35 80,45 65,45" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-ink opacity-20" />

          {/* Cajas BVH */}
          <rect x="25" y="5" width="60" height="42" fill="none" stroke="currentColor" className={step >= 1 ? "text-mant" : "text-line"} strokeWidth="0.6" strokeDasharray="1 1" />
          <text x="25" y="4" fontSize="3" fill="currentColor" className="text-ink-dim font-mono">BVH Raíz</text>

          <rect x="27" y="7" width="26" height="22" fill={step >= 2 ? "var(--color-mant)" : "transparent"} fillOpacity="0.1" stroke="currentColor" className={step >= 2 ? "text-mant" : "text-transparent"} strokeWidth="0.5" />
          
          <rect x="57" y="27" width="26" height="19" fill={step >= 2 ? "var(--color-sign)" : "transparent"} fillOpacity="0.1" stroke="currentColor" className={step >= 2 ? "text-sign" : "text-transparent"} strokeWidth="0.5" opacity={step >= 2 ? 0.6 : 1} />
          {step >= 2 && <line x1="57" y1="27" x2="83" y2="46" stroke="currentColor" className="text-sign opacity-50" strokeWidth="0.5" />}
          {step >= 2 && <line x1="83" y1="27" x2="57" y2="46" stroke="currentColor" className="text-sign opacity-50" strokeWidth="0.5" />}

          {/* Rayo Trazado */}
          {step >= 1 && (
            <line 
              x1="0" 
              y1="20" 
              x2={step === 1 ? "25" : step === 2 ? "27" : step >= 3 ? "31.5" : "0"} 
              y2="20" 
              stroke="currentColor" 
              className="text-exp" 
              strokeWidth="0.8" 
              style={{ transition: 'all 0.4s ease-out' }}
            />
          )}

          {/* Hit Point */}
          {step >= 5 && (
            <circle cx="31.5" cy="20" r="1.2" fill="currentColor" className="text-exp animate-pulse" />
          )}

          <g className="font-mono text-[2.5px] fill-current">
            {step === 1 && <text x="5" y="18" className="text-exp">1. Intersección con Raíz</text>}
            {step === 2 && <text x="5" y="18" className="text-mant">2. Evaluar Hijos</text>}
            {step === 2 && <text x="70" y="25" className="text-sign">DESCARTADO (Miles de tris)</text>}
            {step === 3 && <text x="5" y="18" className="text-exp">3. Intersecta Hoja BVH</text>}
            {step === 4 && <text x="5" y="18" className="text-exp">4. Test Rayo-Triángulo</text>}
            {step === 5 && <text x="5" y="18" className="text-exp font-bold">5. HIT CONFIRMADO</text>}
          </g>
        </svg>
      </div>

      {/* Caja de explicación para Dummies */}
      <div className="w-full max-w-[65ch] mt-6 p-4 border border-line bg-surface-2 rounded-sm relative min-h-[140px] flex items-center">
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h4 className="text-ink font-bold mb-2">Paso 0: El mundo dentro de una caja</h4>
            <p className="text-sm text-ink-dim leading-relaxed">
              La GPU tiene toda la geometría del mundo (un personaje, una casa, etc.) guardada en la memoria, envuelta en una caja gigante invisible llamada "Caja Raíz". Hasta este momento no hemos calculado ninguna matemática pesada.
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h4 className="text-exp font-bold mb-2">Paso 1: Rayo vs Raíz (La pregunta barata)</h4>
            <p className="text-sm text-ink-dim leading-relaxed">
              La cámara dispara un rayo. En vez de calcular los miles de triángulos, la GPU hace la pregunta matemática más barata posible (una AABB, resta y multiplicación simple): <em>¿El rayo toca la caja gigante?</em> Si es NO, ignora todo. Si es SÍ, investigamos adentro.
            </p>
          </div>
        )}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h4 className="text-mant font-bold mb-2">Paso 2: Dividir y Conquistar (Descarte masivo)</h4>
            <p className="text-sm text-ink-dim leading-relaxed">
              La caja raíz se divide en cajas más pequeñas. La GPU descubre que el rayo pasa de largo por la <span className="text-sign font-medium">caja derecha</span> (se descarta y nos ahorramos calcular cientos de polígonos que hay allí) y que sí atraviesa la caja izquierda.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h4 className="text-exp font-bold mb-2">Paso 3: Llegando a la Hoja</h4>
            <p className="text-sm text-ink-dim leading-relaxed">
              La GPU repite el proceso de meter cajas dentro de cajas jerárquicamente hasta llegar a la más pequeña posible (el <em>nodo hoja</em>). Esta cajita ya no se divide más y es la que verdaderamente contiene la geometría (los triángulos individuales).
            </p>
          </div>
        )}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h4 className="text-exp font-bold mb-2">Paso 4: ¡Momento del cálculo pesado!</h4>
            <p className="text-sm text-ink-dim leading-relaxed">
              Solo ahora, para los poquitos triángulos que quedaron dentro de esta cajita diminuta, la GPU usa sus <strong>RT Cores</strong> (hardware dedicado) y máxima precisión geométrica (<code>Float32</code>) para resolver la matemática compleja (el sistema de ecuaciones de Möller-Trumbore).
            </p>
          </div>
        )}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h4 className="text-exp font-bold mb-2 animate-pulse">Paso 5: ¡Hit Confirmado!</h4>
            <p className="text-sm text-ink-dim leading-relaxed">
              ¡El láser perforó el triángulo! La GPU guarda la distancia exacta y el material de la superficie. A partir de aquí, degrada inteligentemente sus cálculos a <code>Float16</code> para mezclar el color, las sombras y los reflejos de forma rapidísima, pintando el píxel final en tu pantalla.
            </p>
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 w-full max-w-[65ch]">
        {[
          "Inicio", 
          "Rayo vs Raíz", 
          "Evaluar Nodos", 
          "Rayo vs Hoja", 
          "Test Triángulo", 
          "Impacto (Hit)"
        ].map((label, i) => (
          <button 
            key={i} 
            onClick={() => handleStepClick(i)}
            className={`h-10 flex flex-col items-center justify-center text-[9px] font-mono border rounded-sm transition-colors ${
              step === i 
                ? 'bg-surface border-mant text-ink shadow-[0_0_10px_rgba(79,209,197,0.2)]' 
                : 'border-line text-ink-dim hover:bg-surface hover:text-ink'
            }`}
          >
            <span className="opacity-50">Paso {i}</span>
            <span className="font-bold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
