import { AlertCircle, Database } from 'lucide-react';

export function CoveragePanel({ coverage }) {
  if (!coverage) return null;
  return <section className="intel-panel intel-coverage">
    <div className="intel-panel-top"><div><div className="intel-eyebrow">FIELD COMPLETENESS / {coverage.total} CATALOGUE RECORDS</div><h2>Where the supplied excerpts provide details</h2><p>Documented fields are counted separately from fields that were not recorded in this local capture.</p></div><Database size={24}/></div>
    <div className="intel-coverage-legend"><span className="dot documented"/> Documented in supplied record <span className="dot absent"/> Not documented in supplied record</div>
    <div className="intel-coverage-rows">{coverage.fields.map((field) => <div className="intel-coverage-row" key={field.key}>
      <div className="intel-coverage-label"><strong>{field.label}</strong><span>{field.documented} of {coverage.total} records</span></div>
      <div className="intel-coverage-track" role="img" aria-label={`${field.label}: ${field.documented} documented, ${field.not_documented} not documented`}><div className="intel-coverage-fill" style={{ width: `${coverage.total ? 100 * field.documented / coverage.total : 0}%` }}/></div>
      <span className="intel-coverage-count">{field.documented}/{coverage.total}</span>
    </div>)}</div><div className="intel-method"><AlertCircle size={17}/><p>{coverage.notice} In particular, a populated platform can describe a ground-based computational investigation, not a direct flight experiment. Numerical condition fields do not represent every possible test in a project.</p></div>
  </section>;
}

