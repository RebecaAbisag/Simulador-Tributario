// helpers.js (simulator)
// Funções utilitárias para a funcionalidade de simulador.

// Formata um valor numérico para o formato de moeda BRL (Real Brasileiro).
function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
