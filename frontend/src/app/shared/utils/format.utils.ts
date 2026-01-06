export function formatMonto(valor: number | string): string {
  const numero = Number(valor);

  if (isNaN(numero)) return '0,00';

  return new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(numero);
}

export function formatMontoConSimbolo(valor: number | string): string {
  const numero = Number(valor);

  if (isNaN(numero)) return '$0,00';

  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}
