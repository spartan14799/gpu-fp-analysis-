import Section from "../components/Section.jsx";
import PantallaPersonaje from "../components/PantallaPersonaje.jsx";
import Proyeccion3D from "../components/Proyeccion3D.jsx";

export default function IntuicionInicial() {
  return (
    <Section
      id="intuicion"
      index="01"
      accent="sign"
      title="Intuición inicial"
      subtitle="Antes de llegar al estándar IEEE 754, partimos de una intuición más cercana a los gráficos por computadora que a la representación binaria."
    >
      <p className="max-w-[65ch] text-ink-dim">
        Nuestra intuición inicial es que, de manera similar a como funcionan
        los gráficos 2D, el problema consiste en asignar coordenadas a la
        pantalla y en usar funciones físicas de cinemática —como la
        aceleración— para calcular la velocidad y el movimiento de los
        personajes: su desplazamiento y su salto.
      </p>

      <div className="mt-6">
        <p className="mb-3 font-mono text-xs text-ink-dim">
          pantalla 2D — coordenadas y movimiento de un personaje
        </p>
        <PantallaPersonaje />
      </div>

      <p className="mt-10 max-w-[65ch] text-ink-dim">
        Llevar esta idea a tres dimensiones consiste en proyectar un
        espacio 3D sobre una pantalla de dos dimensiones: convertir cada
        coordenada tridimensional en la posición 2D de la pantalla donde
        debe dibujarse su color. Esto exige definir una función de
        proyección que, para cada punto del espacio 3D, determine el
        píxel correspondiente en la superficie 2D.
      </p>

      <div className="mt-6">
        <p className="mb-3 font-mono text-xs text-ink-dim">
          intento de proyección — de un espacio 3D a la pantalla 2D
        </p>
        <Proyeccion3D />
      </div>
    </Section>
  );
}
