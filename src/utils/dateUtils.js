/**
 * Formata com segurança strings de data (YYYY-MM-DD ou ISO) para o padrão brasileiro DD/MM/AAAA.
 * Evita o bug de fuso horário (UTC vs Local) onde "2026-07-27" vira "26/07/2026".
 */
export function formatDateBR(dateStr) {
  if (!dateStr) return '';
  
  // Se a string contiver a data no formato YYYY-MM-DD
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const dateOnly = dateStr.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
}
