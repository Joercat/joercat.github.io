// ============================================
// EASY-TO-UPDATE LINKS CONFIGURATION
// Just add or remove items from this array!
// ============================================
const SITE_LINKS = [
  {
    title: "Nettleweb",
    description: "A very large games site, 3500+ total games.",
    icon: "🎮",
    url: "https://jshshdgxh-unblocked.hf.space/"
  },
  {
    title: "Seraph",
    description: "another unblocked games site, many assorted games. ",
    icon: "🎮",
    url: "https://jshshdgxh-unblocked2.hf.space/"
  }
  // ============================================
  // ADD MORE LINKS HERE! Just copy this format:
  // {
  //   title: "Game Name",
  //   description: "Short description of the game",
  //   icon: "🎮",  // Use any emoji
  //   url: "https://example.com/game"
  // },
  // ============================================
];

// ============================================
// IFRAME FUNCTIONS
// ============================================
function openIframe(url, title) {
  const overlay = document.getElementById('iframeOverlay');
  const iframe = document.getElementById('contentFrame');
  const titleText = document.getElementById('iframeTitleText');
  const spinner = document.getElementById('loadingSpinner');

  // Set title
  titleText.textContent = title;

  // Show loading spinner
  spinner.classList.add('active');

  // Show overlay with animation
  overlay.classList.add('active');
  setTimeout(() => {
    overlay.classList.add('visible');
  }, 10);

  // Load the URL
  iframe.src = url;

  // Hide spinner when iframe loads
  iframe.onload = function() {
    spinner.classList.remove('active');
  };

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeIframe() {
  const overlay = document.getElementById('iframeOverlay');
  const iframe = document.getElementById('contentFrame');
  const spinner = document.getElementById('loadingSpinner');

  // Hide with animation
  overlay.classList.remove('visible');

  setTimeout(() => {
    overlay.classList.remove('active');
    iframe.src = 'about:blank';
    spinner.classList.remove('active');
  }, 300);

  // Restore body scroll
  document.body.style.overflow = '';
}

// Close iframe with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeIframe();
  }
});

// ============================================
// RENDER GAME CARDS
// ============================================
function renderGameCards() {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;

  grid.innerHTML = '';

  SITE_LINKS.forEach((link, index) => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.style.animationDelay = `${index * 0.1}s`;
    card.onclick = () => openIframe(link.url, link.title);

    card.innerHTML = `
      <div class="game-card-content">
        <span class="game-card-icon">${link.icon}</span>
        <h3 class="game-card-title">${link.title}</h3>
        <p class="game-card-desc">${link.description}</p>
      </div>
    `;

    // Add staggered animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';

    grid.appendChild(card);

    // Animate in
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + index * 100);
  });
}

// ============================================
// ACTIVE LINK HIGHLIGHTING
// ============================================
function highlightActiveLink() {
  const currentPath = window.location.href.split('#')[0].split('?')[0];
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

  navLinks.forEach(link => {
    const linkHref = link.href.split('#')[0].split('?')[0];
    if (linkHref === currentPath) {
      link.classList.add('active-link');
    }
  });
}

// ============================================
// ENHANCED ANIMATIONS
// ============================================
function initAnimations() {
  // Welcome text animation
  const welcomeText = document.querySelector('.welcome-text');
  if (welcomeText) {
    welcomeText.style.opacity = '0';
    welcomeText.style.transform = 'translateX(-30px)';

    setTimeout(() => {
      welcomeText.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
      welcomeText.style.opacity = '1';
      welcomeText.style.transform = 'translateX(0)';
    }, 300);
  }

  // Caveat text staggered animation
  const caveatTexts = document.querySelectorAll('.caveat-text');
  caveatTexts.forEach((text, index) => {
    text.style.opacity = '0';
    text.style.transform = 'translateY(15px)';

    setTimeout(() => {
      text.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      text.style.opacity = '1';
      text.style.transform = 'translateY(0)';
    }, 600 + index * 200);
  });

  // Nav links staggered animation
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach((link, index) => {
    link.style.opacity = '0';
    link.style.transform = 'translateX(-20px)';

    setTimeout(() => {
      link.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out, background 0.3s ease, border-color 0.3s ease';
      link.style.opacity = '1';
      link.style.transform = 'translateX(0)';
    }, 200 + index * 80);
  });
}

// ============================================
// PARALLAX EFFECT ON MOUSE MOVE
// ============================================
function initParallax() {
  const mainLogo = document.querySelector('.main-logo');

  if (mainLogo) {
    document.addEventListener('mousemove', (e) => {
      const x = (window.innerWidth / 2 - e.clientX) / 50;
      const y = (window.innerHeight / 2 - e.clientY) / 50;

      mainLogo.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  renderGameCards();
  highlightActiveLink();
  initAnimations();
  initParallax();
});    }

    const noteText = document.querySelector('.note-text');
    if (noteText) {
        let opacity = 1;
        let direction = -0.01;
        const minOpacity = 0.5;
        const maxOpacity = 1;

        setInterval(() => {
            opacity += direction;

            if (opacity <= minOpacity) {
                opacity = minOpacity;
                direction *= -1;
            } else if (opacity >= maxOpacity) {
                opacity = maxOpacity;
                direction *= -1;
            }
            noteText.style.opacity = opacity;
        }, 50);
    }

});
