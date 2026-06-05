const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;
const DISPLAY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** Exibe data como DD/MM/YYYY (aceita YYYY-MM-DD ou ISO datetime). */
export function formatDate(value: string): string {
  const match = value.match(ISO_DATE);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Exibe data e hora como DD/MM/YYYY, HH:mm. */
export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Converte DD/MM/YYYY para YYYY-MM-DD (formato da API). */
export function toApiDate(display: string): string {
  const trimmed = display.trim();
  const match = trimmed.match(DISPLAY_DATE);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  if (ISO_DATE.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  return trimmed;
}
