import { ExternalLink } from 'lucide-react';
import { NASA_PSI_URL } from '../../config/constants.js';

export function Footer() {
  return (
    <footer className="page-footer">
      <span>FLARE-X <span className="footer-dot">·</span> Research intelligence prototype</span>
      <span>Catalogue source: NASA Physical Sciences Informatics <a href={NASA_PSI_URL} target="_blank" rel="noreferrer">psi.nasa.gov <ExternalLink size={11}/></a></span>
    </footer>
  );
}
