import { ChevronRight, ExternalLink } from 'lucide-react';
import { valueOrMissing } from '../../utils/formatters.js';

function EvidenceCard({ item, onOpenRecord }) {
  const numeric = item.numeric_conditions || {};
  const display = valueOrMissing;
  return (
    <article className="assistant-evidence-card">
      <div className="assistant-evidence-heading">
        <span className="record-id">{item.id}</span>
        <span className="assistant-evidence-type">{item.type === 'Ground Investigation' ? 'GROUND' : 'MICROGRAVITY'}</span>
        {item.citation_verification === 'official_PSI_title_DOI_confirmed' && <span className="assistant-evidence-verified">PSI title/DOI checked</span>}
      </div>
      <h3>{item.title}</h3>
      <div className="assistant-evidence-excerpts">
        {item.excerpts.map((excerpt) => (
          <div key={excerpt.field} className="assistant-evidence-excerpt">
            <span>{excerpt.field === 'objective' ? 'OBJECTIVE' : 'APPROACH'} · {excerpt.completeness === 'truncated_catalogue_excerpt' ? 'TRUNCATED EXCERPT' : 'PROVIDED SOURCE SUMMARY'}</span>
            <p>{excerpt.text}</p>
          </div>
        ))}
      </div>
      <details className="assistant-structured">
        <summary>Inspect documented fields <ChevronRight size={13}/></summary>
        <dl>
          <div><dt>Fuel / material</dt><dd>{display(item.fuel_material)}</dd></div>
          <div><dt>Platform</dt><dd>{display(item.platform)}</dd></div>
          <div><dt>Oxygen</dt><dd>{display(numeric.oxygen)}</dd></div>
          <div><dt>Pressure</dt><dd>{display(numeric.pressure)}</dd></div>
          <div><dt>Airflow</dt><dd>{display(numeric.airflow)}</dd></div>
          <div><dt>Documented conditions</dt><dd>{display(item.documented_conditions)}</dd></div>
        </dl>
      </details>
      <div className="assistant-evidence-actions">
        <button type="button" onClick={() => onOpenRecord(item.id)}>
          View local record <ChevronRight size={14}/>
        </button>
        <a href={item.source_url} target="_blank" rel="noreferrer">
          {item.citation_verification === 'official_PSI_title_DOI_confirmed' ? 'Confirmed PSI page' : item.source_is_record_page ? 'PSI page (from catalogue)' : 'PSI repository'} <ExternalLink size={13}/>
        </a>
      </div>
      {!item.source_is_record_page && <p className="assistant-source-hint">A record-specific source URL was not captured. Find this ID on PSI to access “Cite this Investigation”.</p>}
    </article>
  );
}


export { EvidenceCard };
