// helpers.js
// Funções utilitárias e helpers compartilhados para toda a aplicação.

// Formata um valor numérico para o formato de moeda BRL (Real Brasileiro).
function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Função de fetch com retentativa exponencial (mantida para paridade, mas não usada no modo offline).
// Tenta realizar uma requisição HTTP, com múltiplas retentativas em caso de falha temporária (status 429).
async function exponentialBackoffFetch(url, options, maxRetries = 5, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 429) return response; // Retorna se a requisição for bem-sucedida ou erro diferente de 429
      await new Promise(r => setTimeout(r, delay * (2 ** i))); // Espera exponencialmente antes de retentar
    } catch (err) {
      await new Promise(r => setTimeout(r, delay * (2 ** i))); // Espera exponencialmente em caso de erro de rede
    }
  }
  throw new Error("Falha na chamada da API após várias tentativas."); // Lança erro se todas as retentativas falharem
}

// setLoading: gerencia o estado de carregamento da UI do chat.
// Desabilita o botão de envio e o input, e exibe/oculta um loader.
function setLoading(isLoading) {
  const button = document.getElementById('sendButton');
  const input = document.getElementById('chatInput');
  const loader = document.getElementById('loadingIndicator');
  if (!button || !input || !loader) return; // Sai se os elementos não existirem

  button.disabled = isLoading; // Desabilita/habilita o botão de envio
  input.disabled = isLoading;   // Desabilita/habilita o input de texto
  loader.classList.toggle('hidden', !isLoading); // Alterna a visibilidade do loader

  const icon = button.querySelector('i[data-lucide]');
  if (icon) {
    if (isLoading) {
      icon.setAttribute('data-lucide', 'loader'); // Altera o ícone para loader
      icon.classList.add('icon--spin'); // Adiciona animação de rotação
    } else {
      icon.setAttribute('data-lucide', 'send'); // Altera o ícone de volta para enviar
      icon.classList.remove('icon--spin'); // Remove animação de rotação
    }
    if (window.lucide) lucide.createIcons(); // Recria os ícones Lucide para aplicar as mudanças
  }
}
