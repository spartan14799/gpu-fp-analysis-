import { Outlet } from "react-router-dom";
import NavRail from "./NavRail.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <NavRail />
      <main className="pt-16 lg:ml-60 lg:pt-0">
        <Outlet />
        <footer className="border-t border-line px-6 py-8 sm:px-10 lg:px-16">
          <p className="font-mono text-[11px] text-ink-faint">
            Análisis de punto flotante (IEEE 754) y optimizaciones en GPU ·
            Universidad Nacional de Colombia
          </p>
        </footer>
      </main>
    </div>
  );
}
