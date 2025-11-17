// theme.js
// Lida com a lógica de gerenciamento de tema (claro, escuro, limpo).

function initializeTheme() {
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
}