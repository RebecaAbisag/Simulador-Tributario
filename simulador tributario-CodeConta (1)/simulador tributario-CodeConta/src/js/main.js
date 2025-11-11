// main.js
// Inicializa a UI, vincula eventos e inicia o simulador e o chat offline

document.addEventListener('DOMContentLoaded', () => {
  // Alternador de tema
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const themeIcon = themeToggle.querySelector('i');

  // Função para aplicar o tema selecionado
  const applyTheme = (theme) => {
    body.classList.remove('light-mode', 'clean-mode'); // Remove classes de tema existentes
    if (theme === 'light') {
      body.classList.add('light-mode'); // Aplica tema claro
      themeIcon.setAttribute('data-lucide', 'zap'); // Ícone de raio para tema claro
    } else if (theme === 'clean') {
      body.classList.add('clean-mode'); // Aplica tema limpo
      themeIcon.setAttribute('data-lucide', 'zap'); // Ícone de raio para tema limpo
    } else {
      // Tema escuro (padrão)
      themeIcon.setAttribute('data-lucide', 'zap'); // Ícone de raio para tema escuro
    }
    if (window.lucide) lucide.createIcons(); // Recria os ícones Lucide para aplicar as mudanças
  };

  // Carrega o tema salvo no localStorage ou detecta a preferência do sistema
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    applyTheme(savedTheme); // Aplica o tema salvo
  } else if (prefersDark) {
    applyTheme('dark'); // Aplica tema escuro se for a preferência do sistema
  } else {
    applyTheme('light'); // Aplica tema claro como padrão
  }

  // Event listener para o botão de alternar tema
  themeToggle.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    let newTheme;
    if (currentTheme === 'dark') {
      newTheme = 'light';
    } else if (currentTheme === 'light') {
      newTheme = 'clean';
    } else {
      newTheme = 'dark';
    }
    console.log('currentTheme:', currentTheme, 'newTheme:', newTheme); // Log para depuração
    applyTheme(newTheme); // Aplica o novo tema
    localStorage.setItem('theme', newTheme); // Salva o novo tema no localStorage
  });

  // Alternador do menu mobile
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden'); // Alterna a visibilidade do menu mobile
      const icon = mobileMenuButton.querySelector('i[data-lucide]');
      if (mobileMenu.classList.contains('hidden')) {
        icon.setAttribute('data-lucide', 'menu'); // Ícone de menu quando oculto
      } else {
        icon.setAttribute('data-lucide', 'x'); // Ícone de fechar quando visível
      }
      if (window.lucide) lucide.createIcons(); // Recria os ícones
    });
    // Fecha o menu mobile ao clicar em um link
    document.querySelectorAll('#mobile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        const menuIcon = document.querySelector('#mobile-menu-button i[data-lucide]');
        if (menuIcon) menuIcon.setAttribute('data-lucide', 'menu');
        if (window.lucide) lucide.createIcons();
      });
    });
  }

  // Manipuladores de envio e entrada do formulário
  const form = document.getElementById('calculatorForm');
  if (form) {
    // Ao enviar o formulário, previne o comportamento padrão e calcula
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateAndDisplay();
    });
  }

  // Adiciona um event listener para os botões de "saber mais"
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-details-btn')) {
      const targetId = e.target.dataset.target;
      const detailsContainer = document.getElementById(targetId);
      if (detailsContainer) {
        detailsContainer.classList.toggle('hidden');
      }
    }
  });

  // Botão de reset
  const resetBtn = document.getElementById('resetButton');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('calculatorForm').reset(); // Reseta o formulário
      document.getElementById('rendaExterior').value = '0'; // Limpa o campo rendaExterior
      document.querySelectorAll('.comparison-card').forEach(card => card.classList.remove('best-option')); // Remove destaque da melhor opção
      const warn = document.getElementById('proLaboreWarning');
      if (warn) warn.classList.add('hidden'); // Oculta aviso de pró-labore

      // Limpa a seção de resultados
      document.getElementById('bestOptionName').textContent = '...';
      document.getElementById('bestOptionValue').textContent = 'R$ 0,00';
      document.getElementById('comparisonSavings').textContent = 'R$ 0,00'; // Resetar o texto de economia
      document.getElementById('meiDAS').textContent = 'R$ 0,00';
      document.getElementById('meiLiquido').textContent = 'R$ 0,00';
      document.getElementById('pjSimplesDAS').textContent = 'R$ 0,00';
      document.getElementById('pjSimplesINSS').textContent = 'R$ 0,00';
      document.getElementById('pjSimplesLiquido').textContent = 'R$ 0,00';
      document.getElementById('lpIRPJCSLL').textContent = 'R$ 0,00';
      document.getElementById('lpPISCOFINS').textContent = 'R$ 0,00';
      document.getElementById('lpINSS').textContent = 'R$ 0,00';
      document.getElementById('lpLiquido').textContent = 'R$ 0,00';

      // Oculta a seção de indicações
      const indicacoesSection = document.getElementById('indicacoes');
      if (indicacoesSection) {
        indicacoesSection.classList.add('hidden');
      }
    });
  }

  // Manipuladores de chat
  const sendBtn = document.getElementById('sendButton');
  const chatInput = document.getElementById('chatInput');
  if (sendBtn) sendBtn.addEventListener('click', handleSend); // Envia mensagem ao clicar no botão
  if (chatInput) {
    // Envia mensagem ao pressionar Enter (sem Shift)
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  // Inicializa ícones e executa cálculos iniciais e mensagem de boas-vindas do chat
  if (window.lucide) lucide.createIcons();
  calculateAndDisplay(); // Executa o cálculo inicial
  initializeNavigation(); // Inicializa a lógica de navegação
  // Exibe mensagem de boas-vindas do chat offline
  if (typeof displayChatMessage === 'function') {
    displayChatMessage("Olá! Eu sou seu Assistente IA offline do CodeConta. Pergunte sobre CLT, PJ, Anexo III ou Anexo V.", 'ai');
  } else if (typeof initializeChat === 'function') {
    initializeChat();
  }

  // Alternador de chat flutuante
  const toggleChatButton = document.getElementById('toggle-chat-button');
  const floatingChat = document.querySelector('.floating-chat');

  if (toggleChatButton && floatingChat) {
    toggleChatButton.addEventListener('click', () => {
      floatingChat.classList.toggle('is-visible'); // Alterna a visibilidade do chat flutuante
      const icon = toggleChatButton.querySelector('i[data-lucide]');
      if (floatingChat.classList.contains('is-visible')) {
        icon.setAttribute('data-lucide', 'x'); // Ícone de fechar quando visível
      } else {
        icon.setAttribute('data-lucide', 'bot'); // Ícone de robô quando oculto
      }
      if (window.lucide) lucide.createIcons(); // Recria os ícones
    });
  }

  // Constantes para o formulário de cadastro de contador e login
  const registrationForm = document.getElementById('registrationFormAccountant');
  const loginForm = document.querySelector('#login-form-container form'); // Adicionado
  const loginFormContainer = document.getElementById('login-form-container');
  const registrationFormContainer = document.querySelector('#sou-contador .form-container:first-child');
  const loginEmailInput = document.getElementById('loginEmail');

  if (registrationForm) {
    registrationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contadorNome').value;
      const email = document.getElementById('contadorEmail').value;
      const password = document.getElementById('contadorSenha').value;
      const telefone = document.getElementById('contadorTelefone').value;
      const cidade = document.getElementById('contadorCidade').value;
      const estado = document.getElementById('contadorEstado').value;
      const especialidades = Array.from(document.querySelectorAll('input[name="especialidade"]:checked'))
                                  .map(cb => cb.value)
                                  .join(', ');

      if (!name || !email || !password || !especialidades) {
        alert('Por favor, preencha Nome, E-mail, Senha e selecione ao menos uma Especialidade para o cadastro.');
        return;
      }

      const newAccountant = { name, email, password, telefone, cidade, estado, especialidades };

      alert(`Cadastramento concluído para ${name}!`);

      registrationForm.reset();
      document.getElementById('contadorEstado').value = '';

      registrationFormContainer.classList.add('hidden');
      loginFormContainer.classList.remove('hidden');
      if (loginEmailInput) {
        loginEmailInput.value = email;
      }

      // Pausar o vídeo na seção "Sobre Nós" se estiver tocando
      const videoIframe = document.querySelector('#sobre iframe');
      if (videoIframe) {
        // Recarregar o src do iframe para parar a reprodução
        const currentSrc = videoIframe.src;
        videoIframe.src = currentSrc;
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginSenha').value;

      // This is a placeholder for actual authentication
      // In a real app, you'd check against a backend
      if (email === 'test@example.com' && password === 'password') { // Example credentials
        alert(`Login simulado realizado com sucesso para ${email}!`);
        loginForm.reset();
        loginFormContainer.classList.add('hidden');
        // In a real app, you'd set a session/token here
      } else {
        alert('E-mail ou senha incorretos. Tente novamente.');
      }
    });
  }

  // Função para configurar o toggle de visibilidade da senha
  function setupPasswordToggle(passwordInputId, toggleButtonSelector) {
    const passwordInput = document.getElementById(passwordInputId);
    const toggleButton = document.querySelector(toggleButtonSelector);

    if (passwordInput && toggleButton) {
      toggleButton.addEventListener('click', () => {
        const icon = toggleButton.querySelector('i[data-lucide]');
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          if (icon) icon.setAttribute('data-lucide', 'eye');
        } else {
          passwordInput.type = 'password';
          if (icon) icon.setAttribute('data-lucide', 'eye-off');
        }
        if (window.lucide) lucide.createIcons(); // Recria os ícones
      });
    }
  }

  // Configura o toggle para o campo de senha do cadastro
  setupPasswordToggle('contadorSenha', '#sou-contador .password-group .toggle-password-visibility');
  // Configura o toggle para o campo de senha do login
  setupPasswordToggle('loginSenha', '#login-form-container .password-group .toggle-password-visibility');
});