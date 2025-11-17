// main.js
// Ponto de entrada principal da aplicação.
// Inicializa os módulos principais da aplicação após o carregamento do DOM.

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o gerenciador de tema
    if (typeof initializeTheme === 'function') {
      initializeTheme();
    }
  
    // Inicializa todos os event listeners da aplicação
    if (typeof initializeEventListeners === 'function') {
      initializeEventListeners();
    }
  
    // Inicializa os ícones Lucide
    if (window.lucide) {
      lucide.createIcons();
    }
  
    // Executa a simulação inicial
    if (typeof handleSimulation === 'function') {
      handleSimulation();
    }
  
    // Inicializa a navegação
    if (typeof initializeNavigation === 'function') {
      initializeNavigation();
    }
  
    // Exibe a mensagem de boas-vindas do chat
    if (typeof displayChatMessage === 'function') {
      displayChatMessage("Olá! Eu sou seu Assistente IA offline do DevPJ. Pergunte sobre CLT, PJ, Anexo III ou Anexo V.", 'ai');
    } else if (typeof initializeChat === 'function') {
      // Fallback para o caso de a função de chat ter um nome diferente
      initializeChat();
    }
  });