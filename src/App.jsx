import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import Modulo1 from "./sections/Modulo1.jsx";
import Modulo2 from "./sections/Modulo2.jsx";
import Modulo3 from "./sections/Modulo3.jsx";
import Resultados from "./sections/Resultados.jsx";

// HashRouter: el sitio se sirve como archivos estáticos (GitHub Pages,
// npm run preview) sin configurar reescritura de rutas en el servidor.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="modulo-1" element={<Modulo1 />} />
          <Route path="modulo-2" element={<Modulo2 />} />
          <Route path="modulo-3" element={<Modulo3 />} />
          <Route path="resultados" element={<Resultados />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
