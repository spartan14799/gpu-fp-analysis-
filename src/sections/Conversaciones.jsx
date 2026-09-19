import Section from "../components/Section.jsx";
import { MessageSquare, Bot, User, Code2 } from "lucide-react";

export default function Conversaciones() {
  return (
    <Section
      id="conversaciones"
      index="08"
      accent="exp"
      variant="page"
      title="Uso de Inteligencia Artificial"
      subtitle="Documentación del trabajo en equipo junto a nuestro agente IA durante la investigación y desarrollo del proyecto."
    >
      <div className="space-y-12 max-w-5xl">
        
        {/* Metadatos del uso de IA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-surface border border-line rounded-sm">
            <h4 className="font-mono text-xs font-bold uppercase text-ink mb-2">Asistente Utilizado</h4>
            <ul className="list-disc pl-5 text-sm text-ink-dim space-y-1">
              <li>Gemini 3.1 Pro</li>
              <li>Antigravity</li>
              <li>ChatGPT 5.6 Sol</li>
            </ul>
          </div>
          <div className="p-4 bg-surface border border-line rounded-sm">
            <h4 className="font-mono text-xs font-bold uppercase text-ink mb-2">Propósito Principal</h4>
            <p className="text-sm text-ink-dim">
              Resolución de dudas teóricas iniciales, comprensión de conceptos abstractos (como la representación en memoria IEEE 754) y lluvia de ideas sobre cómo la arquitectura de hardware aplica aproximaciones numéricas a problemas físicos reales.
            </p>
          </div>
        </div>

        {/* Verificación y Corrección */}
        <div className="p-5 bg-surface-2 border border-line rounded-sm">
          <h4 className="font-mono text-xs font-bold uppercase text-ink mb-3 flex items-center gap-2">
            <Code2 className="size-4 text-sign" />
            Lo que tuvimos que verificar y corregir
          </h4>
          <ul className="list-disc pl-5 text-sm text-ink-dim space-y-2">
            <li>
              <strong>Público Objetivo ("Para Dummies"):</strong> La IA solía generar textos teóricos excesivamente densos o matemáticamente abrumadores sobre el estándar IEEE 754. Tuvimos que pedirle iterativamente que bajara el nivel para que la teoría pudiera ser entendida por cualquier persona sin formación en arquitectura de computadores.
            </li>
            <li>
              <strong>Certeza de las afirmaciones teóricas:</strong> Cuando exploramos las soluciones matemáticas al problema del trazado de rayos, la IA nos guió inicialmente por ideas como que "engrosar la superficie" corregiría el error de cálculo. Al verificar la teoría analítica, descubrimos que esto en realidad aumentaba la probabilidad de error, teniendo nosotros que guiar a la IA hacia la respuesta correcta del épsilon de desplazamiento.
            </li>
          </ul>
        </div>

        {/* Cita de la conversación */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-medium text-ink flex items-center gap-2">
            <MessageSquare className="size-5 text-exp" />
            El punto de partida (Nuestra primera interacción)
          </h3>
          <p className="text-sm text-ink-dim max-w-[65ch]">
            Esta fue la chispa que inició toda nuestra investigación sobre cómo la arquitectura gráfica aborda el Análisis Numérico. De aquí extrajimos la inspiración para todo nuestro trabajo.
          </p>
          
          <div className="flex flex-col gap-4 mt-6">
            {/* Mensaje del Usuario */}
            <div className="flex gap-4 p-4 rounded-lg bg-surface border border-line/50 self-start max-w-[85%]">
              <div className="mt-1 bg-mant/20 p-1.5 rounded-full h-fit">
                <User className="size-4 text-mant" />
              </div>
              <div>
                <p className="text-sm text-ink font-medium mb-1">Nosotros</p>
                <p className="text-sm text-ink-dim whitespace-pre-wrap">
                  ¿Como funcionan las GPU para hacer los graficos 3d en videojuegos, que operaciones hacen con los puntos puntos flotantes y que optimizaciones hay en estas?
                </p>
              </div>
            </div>

            {/* Mensaje de Gemini */}
            <div className="flex gap-4 p-4 rounded-lg bg-surface-2 border border-line self-end max-w-[90%]">
              <div className="mt-1 bg-exp/20 p-1.5 rounded-full h-fit">
                <Bot className="size-4 text-exp" />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-ink font-medium">Gemini</p>
                <div className="text-sm text-ink-dim leading-relaxed space-y-4">
                  <p>Las GPU procesan los entornos tridimensionales convirtiendo geometría basada en puntos en una cuadrícula de píxeles bidimensionales en la pantalla mediante una secuencia paralela de etapas denominada pipeline de renderizado.</p>
                  
                  <p className="font-medium text-ink">Operaciones con Puntos Flotantes (FLOPS)</p>
                  <p>Las GPU son procesadores masivamente paralelos basados en arquitecturas SIMD (Single Instruction, Multiple Data). Ejecutan la misma instrucción matemática sobre miles de puntos flotantes (usualmente precisión simple FP32 o precisión reducida FP16) de manera simultánea:</p>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Fused Multiply-Add (FMA):</strong> Ejecuta la operación R=(A×B)+C en un solo ciclo de reloj a nivel de hardware.</li>
                    <li><strong>Normalización e Inverso de Raíz Cuadrada:</strong> Convertir vectores a longitud unitaria exige calcular 1/x. Las GPU contienen unidades específicas (Special Function Units) diseñadas para aproximar esta operación.</li>
                  </ul>

                  <p className="font-medium text-ink mt-4">Optimizaciones en GPU y Motores Gráficos</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Precisión Mixta (FP16 / INT8):</strong> Emplea 16 bits en lugar de 32 bits en elementos que no requieren alta precisión (efectos de partículas, color post-procesado). Duplica el rendimiento de procesamiento.</li>
                    <li><strong>Renderizado Híbrido con Ray Tracing:</strong> La GPU utiliza núcleos dedicados (RT Cores) que aceleran las pruebas de intersección rayo-triángulo organizadas en estructuras de datos conocidas como BVH (Bounding Volume Hierarchy).</li>
                  </ul>
                  
                  <p className="italic border-l-2 border-line pl-3 mt-4">
                    ¿Te gustaría profundizar en cómo funciona alguna etapa específica, como las matrices de proyección o la arquitectura de los Tensor Cores/RT Cores en el hardware actual?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Section>
  );
}
