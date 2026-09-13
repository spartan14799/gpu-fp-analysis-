import Section from "../components/Section.jsx";

/**
 * Plantilla para las páginas que el equipo aún no ha definido.
 * Reemplazar `title`/`subtitle`/children en Modulo2.jsx, Modulo3.jsx y
 * Resultados.jsx a medida que cada integrante defina su contenido.
 */
export default function PlaceholderModule({ id, index, accent, title, subtitle }) {
  return (
    <Section id={id} index={index} accent={accent} variant="page" title={title} subtitle={subtitle}>
      <div className="rounded-sm border border-dashed border-line px-5 py-8 text-sm text-ink-faint">
        Contenido por definir.
      </div>
    </Section>
  );
}
