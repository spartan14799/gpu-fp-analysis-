import Section from "../components/Section.jsx";
import Formula from "../components/Formula.jsx";
import QuaternionErrorLab from "../components/QuaternionErrorLab.jsx";

const SOURCES = [
  {
    author: "J. Solà",
    year: "2017",
    title: "Quaternion kinematics for the error-state Kalman filter",
    detail: "arXiv:1711.02508",
    url: "https://arxiv.org/abs/1711.02508",
  },
  {
    author: "J. Diebel",
    year: "2006",
    title: "Representing Attitude: Euler Angles, Unit Quaternions, and Rotation Vectors",
    detail: "Stanford University technical report",
    url: "https://www.astro.rug.nl/software/kapteyn-beta/_downloads/attitude.pdf",
  },
  {
    author: "K. Shoemake",
    year: "1985",
    title: "Animating Rotation with Quaternion Curves",
    detail: "SIGGRAPH, pp. 245–254. DOI: 10.1145/325334.325242",
    url: "https://doi.org/10.1145/325334.325242",
  },
  {
    author: "D. Goldberg",
    year: "1991",
    title: "What Every Computer Scientist Should Know About Floating-Point Arithmetic",
    detail: "ACM Computing Surveys 23(1), 5–48. DOI: 10.1145/103162.103163",
    url: "https://doi.org/10.1145/103162.103163",
  },
  {
    author: "IEEE",
    year: "2019",
    title: "IEEE Standard for Floating-Point Arithmetic",
    detail: "IEEE 754-2019",
    url: "https://standards.ieee.org/ieee/754/6210/",
  },
  {
    author: "NVIDIA",
    year: "2026",
    title: "CUDA Programming Guide: Floating-Point Computation",
    detail: "Formato, redondeo, FMA y conformidad IEEE 754 en CUDA",
    url: "https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/mathematical-functions.html",
  },
  {
    author: "P. Betsch y R. Siebert",
    year: "2009",
    title: "Rigid body dynamics in terms of quaternions: Hamiltonian formulation and conserving numerical integration",
    detail: "International Journal for Numerical Methods in Engineering 79(4), 444–473",
    url: "https://doi.org/10.1002/nme.2586",
  },
];

export default function RotacionesOrientacion() {
  return (
    <Section
      id="rotaciones"
      index="05"
      accent="exp"
      variant="page"
      title="Rotaciones y orientación"
      subtitle="Cuaterniones unitarios, propagación del error binary32 y el papel real de la normalización periódica."
    >
      <div className="border-l-2 border-exp bg-surface px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-exp">
          Pregunta de investigación
        </p>
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-dim">
          ¿Cómo se acumula el error de orientación al actualizar en una GPU, durante muchos
          pasos, el cuaternión de un único cuerpo rígido con aritmética IEEE 754 binary32
          (Float32), y qué efecto tiene normalizarlo periódicamente?
        </p>
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl font-medium text-ink">
          1. La matemática de los cuaterniones
        </h3>
        <p className="mt-4 max-w-[70ch] leading-relaxed text-ink-dim">
          Un cuaternión extiende los números complejos con tres unidades imaginarias. Se puede
          escribir con cuatro números reales o como una parte escalar y una parte vectorial:
        </p>
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-surface p-4">
          <Formula
            block
            tex={String.raw`q=w+xi+yj+zk=(w,\mathbf v),\qquad \mathbf v=(x,y,z)`}
          />
          <Formula
            block
            tex={String.raw`i^2=j^2=k^2=ijk=-1`}
          />
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          El producto de Hamilton combina productos punto y cruz y no es conmutativo: cambiar el
          orden de los cuaterniones puede cambiar el resultado. Esta operación compone rotaciones
          sin convertirlas primero en matrices.
        </p>
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-bg p-4">
          <Formula
            block
            tex={String.raw`(a,\mathbf u)\otimes(b,\mathbf v)=\left(ab-\mathbf u\cdot\mathbf v,\;a\mathbf v+b\mathbf u+\mathbf u\times\mathbf v\right)`}
          />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-sm border border-line bg-surface p-4">
            <p className="font-mono text-xs text-exp">Conjugado</p>
            <div className="mt-2 overflow-x-auto"><Formula tex={String.raw`q^*=(w,-\mathbf v)`} /></div>
          </div>
          <div className="rounded-sm border border-line bg-surface p-4">
            <p className="font-mono text-xs text-exp">Norma</p>
            <div className="mt-2 overflow-x-auto"><Formula tex={String.raw`\lVert q\rVert=\sqrt{w^2+x^2+y^2+z^2}`} /></div>
          </div>
          <div className="rounded-sm border border-line bg-surface p-4">
            <p className="font-mono text-xs text-exp">Inverso</p>
            <div className="mt-2 overflow-x-auto"><Formula tex={String.raw`q^{-1}=q^*/\lVert q\rVert^2`} /></div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl font-medium text-ink">
          2. ¿Por qué son importantes y qué problema resuelven?
        </h3>
        <p className="mt-4 max-w-[70ch] leading-relaxed text-ink-dim">
          La posición responde dónde está el centro del cuerpo; la orientación responde hacia dónde
          apuntan sus ejes locales. Los <strong className="text-ink">ángulos de Euler</strong> la
          describen mediante tres escalares y tienen una interpretación intuitiva, pero el resultado
          depende del orden de los giros y existen configuraciones singulares conocidas como
          <em> gimbal lock</em>. Una <strong className="text-ink">matriz de rotación</strong> permite
          transformar vectores directamente y tampoco presenta esa singularidad, pero almacena nueve
          escalares para representar solamente tres grados de libertad; además, debe conservar columnas
          unitarias y mutuamente ortogonales, equivalentes a seis restricciones, junto con{" "}
          <Formula tex={String.raw`\det(R)=1`} />. Los errores numéricos pueden romper estas propiedades
          y obligar a reortogonalizar la matriz. Finalmente, un <strong className="text-ink">cuaternión
          unitario</strong> utiliza cuatro escalares, permite componer e interpolar orientaciones sin
          <em> gimbal lock</em>, pero debe satisfacer <Formula tex={String.raw`\lVert q\rVert=1`} /> y
          tiene doble cobertura: <Formula tex={String.raw`q`} /> y <Formula tex={String.raw`-q`} />
          representan la misma orientación.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[11px] uppercase text-ink-faint">
                <th className="px-3 py-3 font-normal">Representación</th>
                <th className="px-3 py-3 font-normal">Datos almacenados</th>
                <th className="px-3 py-3 font-normal">Ventaja</th>
                <th className="px-3 py-3 font-normal">Costo o restricción</th>
              </tr>
            </thead>
            <tbody className="text-ink-dim">
              <tr className="border-b border-line">
                <td className="px-3 py-3 text-ink">Ángulos de Euler</td>
                <td className="px-3 py-3">3 escalares</td>
                <td className="px-3 py-3">Interpretación directa</td>
                <td className="px-3 py-3">Orden y singularidades</td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-3 py-3 text-ink">Matriz de rotación</td>
                <td className="px-3 py-3">9 escalares</td>
                <td className="px-3 py-3">Aplicación directa a vectores</td>
                <td className="px-3 py-3">6 restricciones de ortogonalidad</td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-3 py-3 text-ink">Cuaternión unitario</td>
                <td className="px-3 py-3">4 escalares</td>
                <td className="px-3 py-3">Composición compacta y sin gimbal lock</td>
                <td className="min-w-[270px] px-3 py-3">
                  <span className="whitespace-nowrap">
                    Restricción <Formula tex={String.raw`\lVert q\rVert=1`} />
                  </span>{" "}
                  <span className="whitespace-nowrap">y doble cobertura</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl font-medium text-ink">
          3. Cuaterniones unitarios como orientaciones 3D
        </h3>
        <p className="mt-4 max-w-[70ch] leading-relaxed text-ink-dim">
          Sea <Formula tex={String.raw`\mathbf u=(u_x,u_y,u_z)`} /> un eje unitario y sea{" "}
          <Formula tex={String.raw`\theta`} />{" "}el ángulo de giro. La pareja eje–ángulo se codifica
          usando la mitad del ángulo:
        </p>
        <div className="mt-5 overflow-x-auto border-l-2 border-mant bg-surface px-4 py-5">
          <Formula
            block
            tex={String.raw`q=\left(\cos\frac{\theta}{2},\;u_x\sin\frac{\theta}{2},\;u_y\sin\frac{\theta}{2},\;u_z\sin\frac{\theta}{2}\right),\qquad \lVert q\rVert=1`}
          />
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Un vector espacial <Formula tex={String.raw`\mathbf p`} /> se convierte en el cuaternión
          puro <Formula tex={String.raw`p=(0,\mathbf p)`} /> y se rota mediante conjugación. Para un
          cuaternión unitario, el conjugado también es el inverso:
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="overflow-x-auto rounded-sm border border-line bg-bg p-4">
            <p className="mb-2 font-mono text-[11px] uppercase text-ink-faint">Aplicar el giro</p>
            <Formula block tex={String.raw`p'=q\otimes p\otimes q^*`} />
          </div>
          <div className="overflow-x-auto rounded-sm border border-line bg-bg p-4">
            <p className="mb-2 font-mono text-[11px] uppercase text-ink-faint">Componer un incremento</p>
            <Formula block tex={String.raw`q_{n+1}=q_n\otimes\Delta q`} />
          </div>
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          El conjunto <Formula tex={String.raw`SO(3)`} /> —el grupo ortogonal especial de dimensión
          tres— contiene todas las matrices reales de <Formula tex={String.raw`3\times3`} /> que
          representan rotaciones puras alrededor del origen:{" "}
          <Formula tex={String.raw`R^{\mathsf T}R=I`} />{" "}y <Formula tex={String.raw`\det(R)=1`} />.
          Estas matrices conservan las longitudes, los ángulos y la orientación del espacio, por lo
          que no incluyen reflexiones.
        </p>

        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Los cuaterniones unitarios satisfacen
          {" "}<Formula tex={String.raw`w^2+x^2+y^2+z^2=1`} />. Geométricamente, sus cuatro
          componentes son puntos sobre una esfera unitaria en cuatro dimensiones, denominada
          {" "}<Formula tex={String.raw`S^3`} />. Sin embargo, hay dos puntos de esa esfera para cada
          rotación de <Formula tex={String.raw`SO(3)`} />: el cuaternión
          {" "}<Formula tex={String.raw`q`} />{" "}y su opuesto
          {" "}<Formula tex={String.raw`-q`} />.
        </p>

        <div className="mt-5 rounded-sm border border-line bg-surface p-4 sm:p-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-mant">
            ¿Por qué representan la misma orientación?
          </p>
          <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-ink-dim">
            En la fórmula eje–ángulo, reemplazar <Formula tex={String.raw`\theta`} /> por
            {" "}<Formula tex={String.raw`\theta+2\pi`} /> equivale a añadir una vuelta completa de
            {" "}<Formula tex={String.raw`360^\circ`} />. La orientación física no cambia, pero el seno
            y el coseno del semiángulo cambian de signo, de modo que:
          </p>
          <div className="mt-4 overflow-x-auto">
            <Formula
              block
              tex={String.raw`q(\theta+2\pi)=\left(\cos\left(\frac{\theta}{2}+\pi\right),\;\mathbf u\sin\left(\frac{\theta}{2}+\pi\right)\right)=-q(\theta)`}
            />
          </div>
          <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-ink-dim">
            Esta correspondencia de dos cuaterniones por cada rotación se llama
            <strong className="text-ink"> doble cobertura</strong>. Si
            {" "}<Formula tex={String.raw`q_2=-q_1`} />, su distancia ordinaria como vectores de cuatro
            componentes sería <Formula tex={String.raw`\lVert q_1-q_2\rVert=2`} />, lo que sugeriría
            erróneamente que son muy diferentes. En cambio,
            {" "}<Formula tex={String.raw`|q_1\cdot q_2|=1`} />{" "}y el error angular es cero:
          </p>
          <div className="mt-4 overflow-x-auto">
            <Formula
              block
              tex={String.raw`\varepsilon_\theta=2\arccos\!\left(|q_1\cdot q_2|\right)=2\arccos(1)=0`}
            />
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl font-medium text-ink">
          4. Dónde aparece Float32 y cómo se propaga el error
        </h3>
        <p className="mt-4 max-w-[70ch] leading-relaxed text-ink-dim">
          IEEE 754 binary32 almacena un bit de signo, ocho de exponente y 23 bits explícitos de
          fracción. Los números normales tienen además un bit inicial implícito, de modo que la
          precisión efectiva es de 24 bits significativos. En el intervalo
          {" "}<Formula tex={String.raw`[1,2)`} />, dos números Float32 consecutivos están separados por
          {" "}<Formula tex={String.raw`2^{-23}`} />:
        </p>
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-bg p-4">
          <Formula
            block
            tex={String.raw`1,\qquad 1+2^{-23},\qquad 1+2\cdot2^{-23},\qquad\ldots`}
          />
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Cuando un resultado exacto cae entre dos valores representables, el modo usual
          <em> redondeo al más cercano, empates al par</em> selecciona el más próximo. La distancia
          máxima hasta ese valor es la mitad del intervalo anterior. Por eso la unidad de redondeo de
          binary32 es:
        </p>
        <div className="mt-5 overflow-x-auto border-l-2 border-exp bg-surface px-4 py-5">
          <Formula
            block
            tex={String.raw`u=\frac{1}{2}\,2^{-23}=2^{-24}\approx5.96\times10^{-8}`}
          />
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Para una operación elemental cuyo resultado es normal y no produce desbordamiento se
          tiene que:
        </p>
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-surface p-4">
          <Formula
            block
            tex={String.raw`\operatorname{fl}(a\circ b)=(a\circ b)(1+\delta),\qquad |\delta|\le u,\qquad \circ\in\{+,-,\times,/\}`}
          />
        </div>
        <div className="mt-4 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          <div className="bg-surface p-4">
            <p className="font-mono text-[11px] text-exp">{String.raw`fl(a ○ b)`}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Es el valor que finalmente queda almacenado en Float32 después de redondear.
            </p>
          </div>
          <div className="bg-surface p-4">
            <p className="font-mono text-[11px] text-exp">{String.raw`a ○ b`}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Es el resultado matemático exacto antes de limitarlo a 24 bits significativos.
            </p>
          </div>
          <div className="bg-surface p-4">
            <p className="font-mono text-[11px] text-exp">{String.raw`○`}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Representa cualquiera de las operaciones básicas: suma, resta, multiplicación o división.
            </p>
          </div>
          <div className="bg-surface p-4">
            <p className="font-mono text-[11px] text-exp">{String.raw`δ`}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Es el error relativo de esa operación particular. Puede ser positivo, negativo o cero,
              pero su magnitud no supera <Formula tex={String.raw`u`} /> bajo las condiciones indicadas.
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Ahora bien, supongamos que <Formula tex={String.raw`q_n`} /> es la orientación después de
          {" "}<Formula tex={String.raw`n`} /> movimientos y que en el siguiente paso queremos aplicar
          un giro pequeño de ángulo <Formula tex={String.raw`\Delta\theta`} /> alrededor del eje
          unitario <Formula tex={String.raw`\mathbf u`} />. Ese movimiento se representa mediante el
          cuaternión incremental:
        </p>
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-surface p-4">
          <Formula
            block
            tex={String.raw`\Delta q=\left(\cos\frac{\Delta\theta}{2},\;\mathbf u\sin\frac{\Delta\theta}{2}\right)`}
          />
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          En aritmética exacta, la orientación del paso siguiente se obtiene al componer la orientación
          actual <Formula tex={String.raw`q_n`} /> con el giro incremental
          {" "}<Formula tex={String.raw`\Delta q`} /> mediante el producto de Hamilton
          {" "}<Formula tex={String.raw`\otimes`} />. La ecuación
          {" "}<Formula tex={String.raw`q_{n+1}=q_n\otimes\Delta q`} /> supone que las componentes y
          todas las operaciones se representan sin error. En una GPU, cada componente se almacena en
          Float32 y se aproxima al valor IEEE 754 binary32 representable más cercano.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="overflow-x-auto rounded-sm border border-line bg-bg p-4">
            <p className="mb-2 font-mono text-[11px] uppercase text-ink-faint">Aritmética exacta</p>
            <Formula block tex={String.raw`q_{n+1}=q_n\otimes\Delta q`} />
          </div>
          <div className="overflow-x-auto rounded-sm border border-sign-dim bg-bg p-4">
            <p className="mb-2 font-mono text-[11px] uppercase text-sign">Aritmética Float32</p>
            <Formula
              block
              tex={String.raw`\widehat q_{n+1}=\operatorname{fl}_{32}\!\left(\widehat q_n\otimes\widehat{\Delta q}\right)`}
            />
          </div>
        </div>

        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Para ver el trabajo de una actualización, escribamos
          {" "}<Formula tex={String.raw`\widehat q_n=(w,x,y,z)`} />{" "}y
          {" "}<Formula tex={String.raw`\widehat{\Delta q}=(a,b,c,d)`} />. El producto de Hamilton
          calcula las cuatro componentes nuevas así:
        </p>
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-surface p-4">
          <Formula
            block
            tex={String.raw`\begin{aligned}
              w'&=wa-xb-yc-zd,\\
              x'&=wb+xa+yd-zc,\\
              y'&=wc-xd+ya+zb,\\
              z'&=wd+xc-yb+za.
            \end{aligned}`}
          />
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Cada fila contiene cuatro multiplicaciones y tres sumas o restas. Las cuatro filas requieren
          en total <strong className="text-ink">16 multiplicaciones y 12 sumas o restas</strong>. En
          <code className="font-mono text-xs text-ink">Float32</code>, el resultado de cada operación
          elemental se aproxima al número binary32 más cercano. Por eso una sola actualización
          introduce varios redondeos.
        </p>

        <div className="mt-5 overflow-x-auto border-l-2 border-sign bg-bg px-4 py-5">
          <Formula
            block
            tex={String.raw`\widehat q_{n+1}=\operatorname{fl}_{32}\!\left(\widehat q_n\otimes\widehat{\Delta q}\right)=q_{n+1}+E_{n+1}`}
          />
        </div>
        <div className="mt-4 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          <div className="bg-surface p-4 text-sm leading-relaxed text-ink-dim">
            <Formula tex={String.raw`q_{n+1}`} /> es la orientación ideal que produciría la aritmética
            exacta.
          </div>
          <div className="bg-surface p-4 text-sm leading-relaxed text-ink-dim">
            <Formula tex={String.raw`E_{n+1}`} /> es la diferencia total entre la orientación calculada
            y almacenada en Float32 y la orientación exacta que se obtendría al realizar el mismo
            movimiento sin errores de redondeo.
          </div>
        </div>

        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          El punto clave es que <Formula tex={String.raw`E_{n+1}`} /> no contiene únicamente el redondeo
          recién producido. La entrada <Formula tex={String.raw`\widehat q_n=q_n+E_n`} /> ya contiene el
          error de los pasos anteriores. Si <Formula tex={String.raw`\delta q`} /> representa el error al
          almacenar el incremento y <Formula tex={String.raw`r_{n+1}`} /> los nuevos redondeos del producto,
          una aproximación de primer orden es:
        </p>
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-surface p-4">
          <Formula
            block
            tex={String.raw`E_{n+1}\approx E_n\otimes\Delta q+q_n\otimes\delta q+r_{n+1}`}
          />
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          El primer término transporta el error anterior, el segundo recoge el error con el que se
          almacenó el giro incremental y el tercero añade los redondeos de la actualización actual.
          Cada contribución suele ser pequeña, del orden de <Formula tex={String.raw`u`} /> multiplicado
          por la magnitud de los operandos.
        </p>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Esta diferencia total puede alterar el cuaternión de dos maneras distintas. Un cuaternión
          unitario es un punto de la esfera <Formula tex={String.raw`S^3`} /> dentro de
          {" "}<Formula tex={String.raw`\mathbb R^4`} />. Si <Formula tex={String.raw`q_{\mathrm{ref}}`} />
          es la orientación exacta y
          {" "}<Formula tex={String.raw`E=\widehat q-q_{\mathrm{ref}}`} />, podemos separar localmente
          el error en una componente paralela al radio de la esfera y otra perpendicular a ese radio:
        </p>
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-surface p-4">
          <Formula
            block
            tex={String.raw`E_{\mathrm{rad}}=(q_{\mathrm{ref}}^{\mathsf T}E)q_{\mathrm{ref}},\qquad
              E_{\mathrm{tan}}=E-E_{\mathrm{rad}},\qquad
              q_{\mathrm{ref}}^{\mathsf T}E_{\mathrm{tan}}=0`}
          />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-line bg-surface p-4">
            <p className="font-mono text-xs uppercase text-sign">Error radial</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Desplaza el cuaternión hacia dentro o hacia fuera de <Formula tex={String.raw`S^3`} /> y,
              por tanto, modifica su norma. Se mide mediante
              {" "}<Formula tex={String.raw`\big|\lVert\widehat q\rVert-1\big|`} />. Si la norma deja
              de ser uno, el conjugado ya no es igual al inverso, pues
              {" "}<Formula tex={String.raw`\widehat q^{-1}=\widehat q^*/\lVert\widehat q\rVert^2`} />.
              En consecuencia, aplicar la fórmula de rotación como si el cuaternión siguiera siendo
              unitario puede introducir un cambio de escala. La normalización corrige directamente
              este desplazamiento radial.
            </p>
          </div>
          <div className="rounded-sm border border-line bg-surface p-4">
            <p className="font-mono text-xs uppercase text-exp">Error tangencial</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Desplaza el cuaternión a lo largo de la superficie de <Formula tex={String.raw`S^3`} />.
              Aunque su norma permanezca igual a uno, el nuevo punto puede representar una orientación
              diferente. Normalizar solo cambia la distancia al origen y conserva la dirección de
              {" "}<Formula tex={String.raw`\widehat q`} /> en <Formula tex={String.raw`\mathbb R^4`} />;
              por eso este error angular permanece después de restaurar la norma.
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-[70ch] leading-relaxed text-ink-dim">
          Después de varias actualizaciones, el cuaternión calculado
          {" "}<Formula tex={String.raw`\widehat q`} /> puede quedar dentro o fuera de la esfera
          unitaria. Para imponer de nuevo la condición <Formula tex={String.raw`\lVert q\rVert=1`} />,
          se dividen sus cuatro componentes por su norma. Esta operación conserva la dirección de
          {" "}<Formula tex={String.raw`\widehat q`} /> en <Formula tex={String.raw`\mathbb R^4`} /> y
          cambia únicamente su distancia al origen. Geométricamente, es una proyección radial sobre
          {" "}<Formula tex={String.raw`S^3`} />.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="overflow-x-auto rounded-sm border border-line bg-bg p-4">
            <p className="mb-2 font-mono text-[11px] uppercase text-ink-faint">Normalización</p>
            <Formula
              block
              tex={String.raw`\widehat q_{\mathrm{unit}}=\dfrac{\widehat q}{\lVert\widehat q\rVert}`}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Aquí <Formula tex={String.raw`\widehat q`} /> es el cuaternión obtenido después de las
              rotaciones en Float32 y
              {" "}<Formula tex={String.raw`\lVert\widehat q\rVert=\sqrt{w^2+x^2+y^2+z^2}`} />. Al
              dividir cada componente por esa misma longitud, el resultado vuelve a tener norma uno,
              salvo el pequeño redondeo de la propia normalización.
            </p>
          </div>
          <div className="overflow-x-auto rounded-sm border border-line bg-bg p-4">
            <p className="mb-2 font-mono text-[11px] uppercase text-ink-faint">
              Error angular restante
            </p>
            <Formula
              block
              tex={String.raw`\varepsilon_\theta=2\arccos\!\left(\min\left(1,\left|\widehat q_{\mathrm{unit}}\cdot q_{\mathrm{ref}}\right|\right)\right)`}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Aquí <Formula tex={String.raw`q_{\mathrm{ref}}`} /> es la orientación que debería
              obtenerse según el cálculo de referencia y <Formula tex={String.raw`\varepsilon_\theta`} />
              es la diferencia angular en radianes. Si el producto punto absoluto vale uno, ambas
              orientaciones coinciden. Si vale cero, difieren en <Formula tex={String.raw`\pi`} />
              radianes, es decir, <Formula tex={String.raw`180^\circ`} />.
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Como ambos cuaterniones de la segunda fórmula son unitarios, el valor absoluto de su producto
          punto es <Formula tex={String.raw`\cos(\varepsilon_\theta/2)`} />. Se usa el valor absoluto
          porque <Formula tex={String.raw`q`} /> y <Formula tex={String.raw`-q`} /> representan la misma
          orientación. El factor <Formula tex={String.raw`2`} /> aparece porque un cuaternión almacena
          la mitad del ángulo de rotación. Finalmente,
          {" "}<Formula tex={String.raw`\min(1,\cdot)`} /> evita que un redondeo que produzca un valor
          apenas mayor que uno haga que <Formula tex={String.raw`\arccos`} /> quede fuera de su dominio.
        </p>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Los siguientes dos casos muestran con precisión qué puede corregir la normalización:
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-line bg-surface p-4">
            <p className="font-mono text-[11px] uppercase text-sign">Solo cambia la longitud</p>
            <Formula
              block
              tex={String.raw`\widehat q=\alpha q_{\mathrm{ref}},\ \alpha>0
                \quad\Longrightarrow\quad
                \widehat q_{\mathrm{unit}}=q_{\mathrm{ref}}`}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Si el error únicamente multiplicó el cuaternión por un factor, normalizar recupera la
              orientación de referencia. Este es un error radial puro.
            </p>
          </div>
          <div className="rounded-sm border border-line bg-surface p-4">
            <p className="font-mono text-[11px] uppercase text-exp">Cambia la dirección</p>
            <Formula
              block
              tex={String.raw`\lVert\widehat q\rVert=1,\ \widehat q\ne\pm q_{\mathrm{ref}}
                \quad\Longrightarrow\quad
                \widehat q_{\mathrm{unit}}=\widehat q,\ \varepsilon_\theta>0`}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Si el cuaternión ya tiene norma uno pero apunta a otro lugar de
              {" "}<Formula tex={String.raw`S^3`} />, normalizar no lo modifica. El error tangencial y
              la orientación equivocada permanecen.
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          FMA es la abreviatura de <em>fused multiply-add</em>, o multiplicación y suma fusionadas. Esta
          instrucción calcula una expresión de la forma <Formula tex={String.raw`ab+c`} /> como una sola
          operación. La multiplicación y la suma se evalúan internamente antes de redondear el resultado
          final a Float32.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="overflow-x-auto rounded-sm border border-line bg-bg p-4">
            <p className="mb-2 font-mono text-[11px] uppercase text-ink-faint">
              Operaciones separadas
            </p>
            <Formula
              block
              tex={String.raw`p=\operatorname{fl}_{32}(ab),\qquad
                r=\operatorname{fl}_{32}(p+c)`}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Primero se redondea el producto y después se redondea la suma. Ocurren dos redondeos.
            </p>
          </div>
          <div className="overflow-x-auto rounded-sm border border-exp-dim bg-bg p-4">
            <p className="mb-2 font-mono text-[11px] uppercase text-exp">Instrucción FMA</p>
            <Formula block tex={String.raw`r=\operatorname{fl}_{32}(ab+c)`} />
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Se conserva el resultado intermedio con precisión suficiente y solo se redondea una vez,
              al final de la operación fusionada.
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Una GPU puede utilizar FMA en varias sumas del producto de Hamilton. Esto suele disminuir el
          error de redondeo intermedio, aunque el resultado continúa almacenándose en Float32. Por ello,
          FMA reduce parte del error numérico, pero no hace exactas las rotaciones ni corrige por sí sola
          el error acumulado.
        </p>
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl font-medium text-ink">
          5. Experimento: ¿cada cuántos movimientos debemos normalizar?
        </h3>
        <p className="mt-4 max-w-[70ch] leading-relaxed text-ink-dim">
          El objetivo del laboratorio es aislar el error producido al actualizar repetidamente un
          cuaternión en Float32. Todos los casos parten de la identidad
          {" "}<Formula tex={String.raw`q_0=(1,0,0,0)`} /> y reciben exactamente el mismo giro en cada
          paso. La única diferencia entre ellos es la frecuencia con la que se normaliza el cuaternión.
          De este modo, cualquier cambio entre las trayectorias puede atribuirse al redondeo acumulado
          y al intervalo de normalización.
        </p>

        <h4 className="mt-7 font-display text-base font-medium text-ink">Movimiento que se repite</h4>
        <p className="mt-3 max-w-[70ch] leading-relaxed text-ink-dim">
          Se utiliza el eje fijo <Formula tex={String.raw`\mathbf u=(1,2,3)/\sqrt{14}`} /> y un ángulo
          por paso <Formula tex={String.raw`\Delta\theta`} /> elegido por el usuario. Las tres
          componentes del eje son distintas de cero para que intervengan todos los términos del
          producto de Hamilton. El movimiento elemental es el cuaternión
        </p>
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-surface p-4">
          <Formula
            block
            tex={String.raw`\Delta q=\left(\cos\frac{\Delta\theta}{2},\;
              \frac{1}{\sqrt{14}}\sin\frac{\Delta\theta}{2},\;
              \frac{2}{\sqrt{14}}\sin\frac{\Delta\theta}{2},\;
              \frac{3}{\sqrt{14}}\sin\frac{\Delta\theta}{2}\right)`}
          />
        </div>

        <div className="mt-6 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          <div className="bg-surface p-4">
            <p className="font-mono text-[10px] uppercase text-mant">1 · Referencia analítica</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Como el eje y el ángulo son constantes, la orientación esperada después de
              {" "}<Formula tex={String.raw`n`} /> pasos puede calcularse directamente como
              {" "}<Formula tex={String.raw`q_{\mathrm{ref}}(n)=
                (\cos(n\Delta\theta/2),\,\mathbf u\sin(n\Delta\theta/2))`} />. Se evalúa en binary64 y
              no mediante <Formula tex={String.raw`n`} /> productos sucesivos, por lo que no acumula la
              misma cadena de redondeos que se quiere estudiar.
            </p>
          </div>
          <div className="bg-surface p-4">
            <p className="font-mono text-[10px] uppercase text-sign">2 · Trayectoria Float32</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Las componentes de <Formula tex={String.raw`\Delta q`} /> se redondean una vez a
              binary32. Después se aplica la recurrencia
              {" "}<Formula tex={String.raw`\widehat q_{n+1}=operatorname{fl}_{32}
                (\widehat q_n\otimes\widehat{\Delta q})`} />. Cada multiplicación, suma y resta se
              redondea explícitamente a Float32, de manera que el error de una actualización entra como
              dato de la siguiente.
            </p>
          </div>
          <div className="bg-surface p-4">
            <p className="font-mono text-[10px] uppercase text-exp">3 · Casos comparados</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Se ejecutan trayectorias sin normalizar, normalizando cada
              {" "}<Formula tex={String.raw`10,100,1000`} /> o <Formula tex={String.raw`10\,000`} />
              pasos y normalizando después de cada movimiento. Todas usan el mismo incremento y el
              mismo número de pasos. Así se cambia una sola variable experimental: el intervalo de
              normalización.
            </p>
          </div>
        </div>

        <h4 className="mt-8 font-display text-base font-medium text-ink">Qué se mide</h4>
        <p className="mt-3 max-w-[70ch] leading-relaxed text-ink-dim">
          En cada actualización se registran dos errores diferentes. El error de norma detecta cuánto
          se alejó el cuaternión de <Formula tex={String.raw`S^3`} />. El error angular compara la
          dirección del cuaternión calculado con la referencia analítica y, por ello, detecta una
          orientación equivocada incluso cuando la norma vale uno.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="overflow-x-auto rounded-sm border border-line bg-bg p-4">
            <p className="mb-2 font-mono text-[11px] uppercase text-sign">Error de norma</p>
            <Formula block tex={String.raw`d_r(n)=\left|\lVert\widehat q_n\rVert-1\right|`} />
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Se mide antes de aplicar la normalización programada. Por eso muestra la mayor desviación
              alcanzada durante cada intervalo, incluso si inmediatamente después se corrige la norma.
            </p>
          </div>
          <div className="overflow-x-auto rounded-sm border border-line bg-bg p-4">
            <p className="mb-2 font-mono text-[11px] uppercase text-exp">Error de orientación</p>
            <Formula
              block
              tex={String.raw`d_\theta(n)=2\arccos\!\left(
                \left|\frac{\widehat q_n}{\lVert\widehat q_n\rVert}\cdot q_{\mathrm{ref}}(n)\right|
              \right)`}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Para medir solo la dirección, se normaliza una copia del estado al calcular esta métrica.
              El resultado se presenta en grados y no modifica el cuaternión que continúa la simulación.
            </p>
          </div>
        </div>

        <h4 className="mt-8 font-display text-base font-medium text-ink">
          Simulación
        </h4>
        <p className="mt-3 max-w-[70ch] leading-relaxed text-ink-dim">
          Una tolerancia es el mayor error que la aplicación está dispuesta a aceptar. El laboratorio
          permite fijar por separado el límite para el error de norma
          {" "}<Formula tex={String.raw`\tau_r`} /> y el límite para el error angular
          {" "}<Formula tex={String.raw`\tau_\theta`} />. Un intervalo de normalización solo se considera
          adecuado si respeta ambos límites durante toda la simulación.
        </p>

        <div className="mt-5 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
          <div className="bg-surface p-4">
            <p className="font-mono text-[10px] uppercase text-mant">1 · Probar cada intervalo</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Para <Formula tex={String.raw`k\in\{1,10,100,1000,10\,000\}`} />, se ejecutan
              {" "}<Formula tex={String.raw`N`} /> movimientos y se normaliza después de cada
              {" "}<Formula tex={String.raw`k`} /> pasos. También se ejecuta un caso sin normalización
              para saber si la corrección era necesaria dentro de ese número de movimientos.
            </p>
          </div>
          <div className="bg-surface p-4">
            <p className="font-mono text-[10px] uppercase text-sign">2 · Conservar el peor error</p>
            <Formula
              block
              tex={String.raw`\begin{aligned}
                D_r(k)&=\max_{1\le n\le N}d_r(n),\\[4pt]
                D_\theta(k)&=\max_{1\le n\le N}d_\theta(n).
              \end{aligned}`}
            />
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Se usan los máximos y no solo los errores del último paso, porque un error puede superar
              el límite en un momento intermedio y disminuir después. También se registra el primer paso
              en el que ocurre cada incumplimiento.
            </p>
          </div>
          <div className="bg-surface p-4">
            <p className="font-mono text-[10px] uppercase text-exp">3 · Aceptar o descartar</p>
            <Formula
              block
              tex={String.raw`\begin{aligned}
                D_r(k)&\le\tau_r,\\[4pt]
                D_\theta(k)&\le\tau_\theta.
              \end{aligned}`}
            />
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Las dos desigualdades deben cumplirse. Entre los intervalos aceptados se recomienda el
              mayor <Formula tex={String.raw`k`} />, porque normaliza con menor frecuencia y satisface
              las precisiones exigidas.
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-[70ch] leading-relaxed text-ink-dim">
          Por ejemplo, normalizar cada <Formula tex={String.raw`1000`} /> pasos se descarta si mantiene
          bien la norma pero supera la tolerancia angular. Si el caso sin normalización cumple ambos
          límites, el laboratorio informa que no fue necesario corregir durante los
          {" "}<Formula tex={String.raw`N`} /> movimientos evaluados. La recomendación solo es válida
          para el eje, el ángulo por paso, el número de movimientos y las tolerancias seleccionadas.
        </p>

        <QuaternionErrorLab />
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="font-display text-xl font-medium text-ink">
          Bibliografía y referencias académicas
        </h3>
        <ol className="mt-5 space-y-3">
          {SOURCES.map((source, index) => (
            <li key={source.url} className="flex gap-3 text-sm leading-relaxed text-ink-dim">
              <span className="shrink-0 font-mono text-[11px] text-mant">[{index + 1}]</span>
              <p>
                {source.author} ({source.year}).{" "}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink underline decoration-line underline-offset-2 hover:decoration-mant"
                >
                  {source.title}
                </a>
                . {source.detail}.
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
