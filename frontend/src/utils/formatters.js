/** Consistent, scientifically cautious handling of missing catalogue values. */
export const MISSING_VALUE = 'Not available in the provided source';

export function valueOrMissing(value) {
  if (value === null || value === undefined || value === '') return MISSING_VALUE;
  if (Array.isArray(value)) return value.length ? value.join(', ') : MISSING_VALUE;
  if (typeof value === 'object' && 'value' in value) {
    if (value.value === null || value.value === undefined || value.value === '') return MISSING_VALUE;
    return `${value.value}${value.unit ? ` ${value.unit}` : ''}`;
  }
  return String(value);
}

export function sourceText(value) {
  if (!value) return MISSING_VALUE;
  if (typeof value === 'object' && 'text' in value) return value.text || MISSING_VALUE;
  return valueOrMissing(value);
}

export function compactId(id) { return (id || '').replace('PSI-', ''); }
