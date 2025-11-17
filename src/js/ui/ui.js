
// ui.js
// Funções auxiliares da UI: displayMessage e displaySources usadas por chat.js e resultados do simulador

// Função para exibir mensagens no chat
function displayMessage(text, sender, sources = []) {
  const messagesContainer = document.getElementById('chatMessages');
  if (!messagesContainer) return; // Sai se o container de mensagens não existir
  const messageElement = document.createElement('div');
  messageElement.classList.add('message-bubble'); // Adiciona classe base para bolha de mensagem

  if (sender === 'user') {
    // Estilos para mensagens do usuário
    messageElement.classList.add('message-bubble--user');
    messageElement.textContent = text;
  } else {
    // Estilos para mensagens da IA
    messageElement.classList.add('message-bubble--ai');
    // Adiciona elemento de ícone Lucide (faíscas)
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'sparkles');
    icon.classList.add('icon');
    messageElement.appendChild(icon);
    const textNode = document.createTextNode(text);
    messageElement.appendChild(textNode);
  }

  messagesContainer.appendChild(messageElement); // Adiciona a mensagem ao container
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Rola para a mensagem mais recente

  // Exibe as fontes se for uma mensagem da IA com fontes
  if (sender === 'ai' && sources.length > 0) {
    displaySources(sources);
  } else if (sender === 'ai') {
    // Oculta as fontes se for uma mensagem da IA sem fontes
    const sourceDisplay = document.getElementById('sourceDisplay');
    const sourceList = document.getElementById('sourceList');
    if (sourceDisplay) sourceDisplay.classList.add('hidden');
    if (sourceList) sourceList.innerHTML = '';
  }
}

// Função para exibir as fontes consultadas
function displaySources(sources) {
  const sourceDisplay = document.getElementById('sourceDisplay');
  const sourceList = document.getElementById('sourceList');
  if (!sourceDisplay || !sourceList) return; // Sai se os elementos não existirem
  sourceList.innerHTML = ''; // Limpa a lista de fontes existente
  sources.forEach(source => {
    const li = document.createElement('li');
    if (source.uri && source.title) {
      // Cria um link clicável se houver URI e título
      li.innerHTML = `<a href="${source.uri}" target="_blank" class="link">${source.title}</a>`;
    } else {
      li.textContent = 'Fonte externa não especificada.'; // Texto padrão se faltar informação
    }
    sourceList.appendChild(li); // Adiciona a fonte à lista
  });
  sourceDisplay.classList.remove('hidden'); // Torna a seção de fontes visível
}
