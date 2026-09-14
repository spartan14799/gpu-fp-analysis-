import { useEffect, useState } from "react";

export default function PrecisionVsParalelismo() {
  const [gpuCores, setGpuCores] = useState(Array(64).fill(0));

  // Simular actividad rápida y aleatoria en los núcleos de la GPU
  useEffect(() => {
    const interval = setInterval(() => {
      setGpuCores(prev => prev.map(() => Math.random() > 0.6 ? 1 : 0));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full mt-6">
      
      {/* Sección 1: Hardware (CPU vs GPU) */}
      <div className="flex flex-col md:flex-row gap-6 w-full border border-line rounded-sm p-6 bg-surface">
        {/* Lado CPU */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-xs text-ink-dim uppercase">Precisión y Cuello de Botella</span>
            <span className="font-medium text-ink">CPU + Float64</span>
          </div>
          
          <div className="flex-1 min-h-[220px] border border-line rounded-sm p-4 flex flex-col items-center justify-center relative bg-bg">
            <div className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-line rounded-sm relative flex items-center justify-center overflow-hidden">
               <div className="absolute inset-1 bg-ink-faint/20 rounded-[2px] overflow-hidden">
                  <div 
                    className="w-full bg-ink-dim h-full" 
                    style={{ animation: 'cpu-progress 3s ease-in-out infinite', transformOrigin: "bottom" }}
                  ></div>
               </div>
               <span className="z-10 font-mono text-[10px] font-bold text-bg bg-ink px-1.5 py-0.5 rounded-[2px]">1 NÚCLEO</span>
            </div>
            
            <div className="mt-8 w-full max-w-[200px] space-y-3">
              <div className="h-1 bg-line w-full rounded-full overflow-hidden">
                <div 
                  className="h-full bg-ink-dim w-full" 
                  style={{ animation: 'cpu-loading 3s linear infinite', transformOrigin: "left" }}
                ></div>
              </div>
              <p className="font-mono text-[10px] text-center text-ink-faint">Procesando 1 polígono complejo...</p>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="hidden md:flex w-px bg-line self-stretch"></div>

        {/* Lado GPU */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-xs text-ink-dim uppercase">Velocidad en Tiempo Real</span>
            <span className="font-medium text-ink">GPU + Float16</span>
          </div>
          
          <div className="flex-1 min-h-[220px] border border-line rounded-sm p-4 flex flex-col items-center justify-center bg-bg relative">
            <div className="grid grid-cols-8 gap-[2px] w-full max-w-[200px]">
              {gpuCores.map((active, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-[2px] transition-all duration-75 ${
                    active ? 'bg-ink scale-100' : 'bg-ink-faint/30 scale-95'
                  }`}
                ></div>
              ))}
            </div>
            
            <div className="mt-8 w-full max-w-[200px] space-y-3">
               <div className="flex justify-between font-mono text-[10px] text-ink-faint px-1">
                  <span>Miles de operaciones simples</span>
               </div>
               <div className="grid grid-cols-4 gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className="h-1 bg-ink-dim w-full rounded-full animate-pulse" 
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Trade-off Matemático (Curva vs Polígono) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full border-t border-line pt-8">
        
        {/* Tarjeta Izquierda (Curva - Float64) */}
        <div className="flex flex-col items-center p-6 border border-line rounded-sm bg-bg relative overflow-hidden group">
          <div className="absolute top-4 left-4 flex flex-col">
            <span className="font-mono text-xs text-ink-dim uppercase">Precisión Analítica</span>
            <span className="font-medium text-ink">Curva Perfecta</span>
          </div>
          
          <div className="mt-12 h-[200px] flex items-center justify-center w-full">
            <svg viewBox="0 0 100 100" className="w-full max-w-[200px] h-auto overflow-visible">
              {/* Curva matemática */}
              <path d="M 10 90 C 30 20, 70 20, 90 90" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink" />
              {/* Vectores Normal y Tangente (detalles técnicos) */}
              <line x1="20" y1="37.5" x2="80" y2="37.5" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-ink-dim" />
              <line x1="50" y1="37.5" x2="50" y2="0" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-ink-dim" />
              <circle cx="50" cy="37.5" r="2" fill="currentColor" className="text-ink" />
              {/* Rayo de luz analítico pesado */}
              <path d="M 10 0 L 50 37.5 L 90 0" fill="none" stroke="currentColor" strokeWidth="2" className="text-sign ray-slow" style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }} />
            </svg>
          </div>
          
          <div className="mt-6 w-full max-w-[280px] p-4 bg-surface border border-line rounded-sm">
            <p className="font-mono text-[11px] text-ink-dim leading-relaxed">
              <span className="text-sign font-bold mr-2">&gt;</span>
              Calculando derivada...<br/>
              <span className="text-sign font-bold mr-2">&gt;</span>
              Float64...<br/>
              <span className="text-ink font-bold mr-2 animate-pulse">&gt;</span>
              Costo computacional masivo.
            </p>
          </div>
        </div>

        {/* Tarjeta Derecha (Mesh - Float16) */}
        <div className="flex flex-col items-center p-6 border border-line rounded-sm bg-bg relative overflow-hidden group">
          <div className="absolute top-4 left-4 flex flex-col">
            <span className="font-mono text-xs text-ink-dim uppercase">Aproximación Poligonal</span>
            <span className="font-medium text-ink">Mesh Rudimentario</span>
          </div>
          
          <div className="mt-12 h-[200px] flex items-center justify-center w-full">
            <svg viewBox="0 0 100 100" className="w-full max-w-[200px] h-auto overflow-visible">
              {/* Aproximación de malla */}
              <polyline points="10,90 25,55 50,37.5 75,55 90,90" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ink" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="25" cy="55" r="2" fill="currentColor" className="text-ink-dim" />
              <circle cx="50" cy="37.5" r="2" fill="currentColor" className="text-ink-dim" />
              <circle cx="75" cy="55" r="2" fill="currentColor" className="text-ink-dim" />
              {/* Múltiples rayos veloces */}
              <path d="M -5 15 L 25 55 L -5 80" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mant ray-fast" style={{ animationDelay: '0s' }} />
              <path d="M 25 0 L 50 37.5 L 75 0" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mant ray-fast" style={{ animationDelay: '0.3s' }} />
              <path d="M 105 15 L 75 55 L 105 80" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mant ray-fast" style={{ animationDelay: '0.6s' }} />
            </svg>
          </div>
          
          <div className="mt-6 w-full max-w-[280px] p-4 bg-surface border border-line rounded-sm">
            <p className="font-mono text-[11px] text-ink-dim leading-relaxed">
              <span className="text-mant font-bold mr-2">&gt;</span>
              Intersección lineal simple...<br/>
              <span className="text-mant font-bold mr-2">&gt;</span>
              Float16...<br/>
              <span className="text-ink font-bold mr-2 animate-pulse">&gt;</span>
              Cálculo paralelo instantáneo.
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes cpu-loading {
          0% { transform: scaleX(0); }
          90% { transform: scaleX(1); }
          100% { transform: scaleX(1); opacity: 0; }
        }
        @keyframes cpu-progress {
          0% { transform: scaleY(0); }
          80% { transform: scaleY(1); }
          90% { transform: scaleY(1); opacity: 0; }
          100% { transform: scaleY(0); opacity: 0; }
        }
        
        .ray-slow {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: draw-slow 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes draw-slow {
          0% { stroke-dashoffset: 200; opacity: 0; }
          20% { opacity: 1; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          80% { stroke-dashoffset: 0; opacity: 0; }
          100% { stroke-dashoffset: 200; opacity: 0; }
        }
        
        .ray-fast {
          stroke-dasharray: 150;
          stroke-dashoffset: 150;
          animation: draw-fast 1.2s linear infinite;
        }
        @keyframes draw-fast {
          0% { stroke-dashoffset: 150; opacity: 0; }
          10% { opacity: 1; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          90% { opacity: 1; }
          100% { stroke-dashoffset: -150; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
