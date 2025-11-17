// navigation.js
// Lógica para gerenciar a navegação entre as seções da página

function initializeNavigation() {
  const navLinks = document.querySelectorAll('.navbar__link, .navbar__mobile-link, .navbar__logo');
  const sections = document.querySelectorAll(
    '#simulator-section, .floating-chat, #indicacoes, #accountant-section, #sobre, #contato'
  );
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuButton = document.getElementById('mobile-menu-button');

  function hideAllSections() {
    sections.forEach(section => {
      section.classList.add('hidden');
    });
    // Special handling for floating-chat as it's a div containing a section
    const floatingChat = document.querySelector('.floating-chat');
    if (floatingChat) {
      floatingChat.classList.add('hidden');
    }
  }

  function showSection(sectionId) {
    hideAllSections();
    const targetSection = document.getElementById(sectionId);
    const header = document.querySelector('.header');

    if (sectionId === 'simulator-section') {
      if (header) header.classList.remove('hidden');
      if (targetSection) targetSection.classList.remove('hidden');
    } else {
      if (header) header.classList.add('hidden');
      // Special handling for floating-chat as it's a div containing a section
      if (sectionId === 'assistente-ia') {
        const floatingChat = document.querySelector('.floating-chat');
        if (floatingChat) {
          floatingChat.classList.remove('hidden');
        }
      } else if (targetSection) {
        targetSection.classList.remove('hidden');
      }
    }

    // Update active class for navigation links
    navLinks.forEach(link => {
      link.classList.remove('navbar__link--active', 'navbar__mobile-link--active');
      if (link.dataset.section === sectionId) {
        if (link.classList.contains('navbar__link')) {
          link.classList.add('navbar__link--active');
        } else if (link.classList.contains('navbar__mobile-link')) {
          link.classList.add('navbar__mobile-link--active');
        }
      }
    });

    // Close mobile menu if open
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      const icon = mobileMenuButton.querySelector('i[data-lucide]');
      if (icon) icon.setAttribute('data-lucide', 'menu');
      if (window.lucide) lucide.createIcons();
    }

    // Refresh Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // Add event listeners to navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      if (sectionId) {
        showSection(sectionId);
      }
    });
  });

  // Toggle login form visibility
  const showLoginFormLink = document.getElementById('show-login-form');
  const loginFormContainer = document.getElementById('login-form-container');

  if (showLoginFormLink && loginFormContainer) {
    showLoginFormLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginFormContainer.classList.toggle('hidden');
    });
  }

  // Set initial section based on URL hash or default to simulator
  const initialSectionId = window.location.hash ? window.location.hash.substring(1) : 'simulator-section';
  showSection(initialSectionId);
}

