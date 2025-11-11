// chat.js
// Implementação do chat amigável para offline:
// - No modo offline, o chat usará respostas pré-definidas.
// - O código mantém a mesma estrutura da API para que você possa habilitar chamadas Gemini online posteriormente.

// Configuração da API (mantida para referência; o modo offline usa respostas pré-definidas)
const API_MODEL = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent`;
// Coloque sua chave aqui se você habilitar o modo online posteriormente:
const apiKey = "SUA_CHAVE_AQUI";

// Instrução do sistema para o modo online (mantida como referência)
const SYSTEM_INSTRUCTION = "Você é um assistente financeiro simpático e prestativo, especializado em tributação e regimes CLT/PJ para desenvolvedores no Brasil. Baseie suas respostas em informações atualizadas. Responda em português, de forma clara e concisa.";

// Exibe uma mensagem no chat (delegação para displayMessage da ui.js se presente)
function displayChatMessage(text, sender='ai', sources=[]) {
  // Reutiliza displayMessage de ui.js se disponível, caso contrário, implementa um fallback mínimo
  if (typeof displayMessage === 'function') {
    displayMessage(text, sender, sources);
    return;
  }
  const container = document.getElementById('chatMessages');
  const el = document.createElement('div');
  el.className = 'message-bubble ' + (sender === 'user' ? 'message-bubble--user' : 'message-bubble--ai');
  el.textContent = text;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

// Respostas pré-definidas para o modo offline (mapeamento simples)
const CANNED_RESPONSES = {
  "olá": "Olá! Sou o Assistente IA offline do CodeConta. Posso explicar as diferenças entre CLT e PJ, anexo III x V, e como o pró-labore afeta o INSS.",
  "anexo iii": "O Anexo III costuma ter alíquotas iniciais menores para empresas de serviços com fator R >= 28%.",
  "anexo v": "O Anexo V tem alíquotas iniciais maiores quando o fator R < 28%, o que pode reduzir o líquido em comparação ao Anexo III.",
  "clt": "CLT implica contribuições ao INSS pela folha, IRPF retido na fonte e benefícios trabalhistas (férias, 13º, FGTS não incluso aqui).",
  "pj": "PJ (Simples) paga DAS mensal, mais INSS sobre pró-labore e IRPF sobre pró-labore. Pode ser vantajoso dependendo do faturamento e pró-labore."
};

// Simula uma resposta da IA usando respostas pré-definidas (modo offline)
async function fetchAIAssistanceOffline(prompt) {
  setLoading(true); // Ativa o indicador de carregamento
  // Normalização simples do prompt
  const normalized = prompt.toLowerCase();
  // Seleciona uma resposta pré-definida por correspondência de palavra-chave
  for (const key of Object.keys(CANNED_RESPONSES)) {
    if (normalized.includes(key)) {
      await new Promise(r => setTimeout(r, 500)); // Simula latência
      displayChatMessage(CANNED_RESPONSES[key], 'ai');
      setLoading(false); // Desativa o indicador de carregamento
      return;
    }
  }
  // Resposta padrão se nenhuma correspondência for encontrada
  await new Promise(r => setTimeout(r, 700));
  displayChatMessage("Desculpe — modo offline: não encontrei informação específica. Pergunte algo sobre CLT, PJ, Anexo III ou Anexo V.", 'ai');
  setLoading(false); // Desativa o indicador de carregamento
}

// handleSend: função acionada pela UI para enviar mensagens
function handleSend() {
  const inputElement = document.getElementById('chatInput');
  if (!inputElement) return; // Sai se o input não existir
  const prompt = inputElement.value.trim(); // Obtém o texto do input
  if (!prompt) return; // Sai se o prompt estiver vazio
  // Exibe a mensagem do usuário
  displayChatMessage(prompt, 'user');
  inputElement.value = ''; // Limpa o input
  // Chama o assistente offline
  fetchAIAssistanceOffline(prompt);
}
