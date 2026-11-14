/** Public client settings only. Never put credentials in VITE_ variables. */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const NASA_PSI_URL = 'https://psi.nasa.gov/';
export const PSI_SEARCH_URL = 'https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation';
export const TYPE_MICRO = 'Microgravity Investigation';
export const TYPE_GROUND = 'Ground Investigation';
export const PAGES = new Set(['overview', 'explorer', 'intelligence', 'compare', 'assistant', 'insights', 'citations', 'about']);
export const PAGE_TITLES = {
  overview: 'Overview', explorer: 'Investigation explorer', intelligence: 'Research intelligence',
  citations: 'Source verification', compare: 'Compare studies', assistant: 'SI Research Studio',
  insights: 'Research pathways', about: 'About FLARE-X',
};
