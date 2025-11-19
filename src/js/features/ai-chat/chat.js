function initializeAIChat() {
  // --- Lógica do Chat de IA ---
  const aiButton = document.querySelector(".floating-ai-button");
  const aiChat = document.getElementById("ai-chat");
  const closeChat = document.getElementById("close-chat");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");

  if (!aiButton || !aiChat || !closeChat || !chatMessages || !chatInput || !chatSend) {
    console.error("Elementos do chat não encontrados. A funcionalidade do chat de IA não será iniciada.");
    return;
  }

  aiButton.addEventListener("click", () => {
    aiChat.classList.toggle("hidden");
  });

  closeChat.addEventListener("click", () => {
    aiChat.classList.add("hidden");
  });

  chatSend.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  function addMessage(text, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", `chat-message--${sender}`);
    messageElement.textContent = text;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    chatInput.value = "";

    const loadingElement = document.createElement("div");
    loadingElement.classList.add("chat-message", "chat-message--loading");
    loadingElement.textContent = "Digitando...";
    chatMessages.appendChild(loadingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const aiResponse = await getAIResponse(message);
      loadingElement.remove();
      addMessage(aiResponse, "ai");
    } catch (error) {
      loadingElement.remove();
      addMessage("Desculpe, ocorreu um erro ao buscar a resposta. Tente novamente.", "ai");
      console.error("Erro na API de IA:", error);
    }
  }

  async function getAIResponse(userMessage) {
    const prompt = `
      Você é um assistente de IA especialista em impostos para desenvolvedores no Brasil, integrado a um site de simulação de regime tributário.
      Sua principal função é tirar dúvidas e dar dicas sobre o sistema tributário do site, que inclui MEI, Simples Nacional (Anexos III e V) e Lucro Presumido.

      **Instruções:**
      1.  **Seja Conciso e Direto:** Responda de forma clara e objetiva.
      2.  **Foco em Desenvolvedores:** Adapte suas respostas para o público de desenvolvedores de software.
      3.  **Use uma Linguagem Amigável:** Evite jargões contábeis muito complexos. Se precisar usar um termo técnico, explique-o de forma simples.
      4.  **Promova o Site:** Sempre que possível, mencione que os usuários podem usar o simulador para comparar os regimes.
      5.  **Segurança:** Deixe claro que suas respostas são informativas e não substituem a consultoria de um contador profissional.

      **Pergunta do usuário:** "${userMessage}"
    `;

    console.log("Gerando resposta para o prompt:", prompt);

    // SIMULAÇÃO DE CHAMADA DE API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const userMsg = userMessage.toLowerCase();

    if (userMsg.includes("mei")) {
      return "O MEI é uma ótima opção para começar, com um limite de faturamento de R$ 81.000/ano. A guia de imposto (DAS) tem um valor fixo, o que simplifica muito a vida! Você pode ver uma simulação detalhada em nosso site.";
    } else if (userMsg.includes("simples nacional")) {
      return "O Simples Nacional é um regime bem popular. Para desenvolvedores, o anexo (III ou V) depende do seu 'Fator R'. Calcule no nosso simulador para ver qual se aplica a você e quanto você pagaria de imposto.";
    } else if (userMsg.includes("lucro presumido")) {
      return "O Lucro Presumido pode ser vantajoso para faturamentos mais altos. Os impostos são calculados sobre uma presunção de lucro de 32% da sua receita. É um pouco mais complexo, mas nosso simulador te ajuda a ter uma ideia dos valores.";
    } else if (userMsg.includes("fator r")) {
        return "O Fator R é a divisão entre sua folha de pagamento (incluindo pró-labore) dos últimos 12 meses e sua receita bruta do mesmo período. Se o resultado for 28% ou mais, sua empresa se enquadra no Anexo III do Simples Nacional, que geralmente tem alíquotas menores. Caso contrário, ela vai para o Anexo V. Use nosso simulador para testar diferentes valores de pró-labore e ver o impacto!";
    } else {
      return "Olá! Sou seu assistente fiscal. 😊 Como posso te ajudar a entender melhor os regimes tributários para desenvolvedores? Você pode me perguntar sobre MEI, Simples Nacional ou Lucro Presumido. Use o simulador para cálculos precisos!";
    }
  }
}
