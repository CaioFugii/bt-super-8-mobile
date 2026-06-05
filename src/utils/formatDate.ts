const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;
const DISPLAY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function isCalendarDate(day: number, month: number, year: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function isValidDisplayDate(value: string): boolean {
  const match = value.trim().match(DISPLAY_DATE);
  if (!match) return false;
  return isCalendarDate(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  );
}

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

export function parseDisplayDate(display: string): string | null {
  const trimmed = display.trim();
  if (!isValidDisplayDate(trimmed)) return null;
  const match = trimmed.match(DISPLAY_DATE)!;
  return `${match[3]}-${match[2]}-${match[1]}`;
}
