import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import IntuicionInicial from "./sections/IntuicionInicial.jsx";
import Modulo1 from "./sections/Modulo1.jsx";
import Modulo2 from "./sections/Modulo2.jsx";
import Modulo3 from "./sections/Modulo3.jsx";
import RotacionesOrientacion from "./sections/RotacionesOrientacion.jsx";
import Resultados from "./sections/Resultados.jsx";
import Conclusiones from "./sections/Conclusiones.jsx";
import Conversaciones from "./sections/Conversaciones.jsx";

// HashRouter: el sitio se sirve como archivos estáticos (GitHub Pages,
// npm run preview) sin configurar reescritura de rutas en el servidor.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="intuicion" element={<IntuicionInicial />} />
          <Route path="modulo-1" element={<Modulo1 />} />
          <Route path="modulo-2" element={<Modulo2 />} />
          <Route path="modulo-3" element={<Modulo3 />} />
          <Route path="rotaciones" element={<RotacionesOrientacion />} />
          <Route path="resultados" element={<Resultados />} />
          <Route path="conclusiones" element={<Conclusiones />} />
          <Route path="conversaciones" element={<Conversaciones />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
