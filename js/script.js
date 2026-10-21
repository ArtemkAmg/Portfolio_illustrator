// ===== Preloader =====
document.body.classList.add('loading');
let preloaderFinished = false;
function finishPreloader() {
  if (preloaderFinished) return;
  preloaderFinished = true;
  const preloader = document.getElementById('preloader');
  if (preloader) preloader.classList.add('done');
  document.body.classList.remove('loading');
  document.querySelector('.header')?.classList.add('ready');
  document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
}
// Don't let a slow external font or image keep the whole site behind the preloader.
window.addEventListener('DOMContentLoaded', () => setTimeout(finishPreloader, 700), { once: true });
window.addEventListener('load', () => setTimeout(finishPreloader, 700), { once: true });
setTimeout(finishPreloader, 3500);

// ===== Header scroll effect =====
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ===== Mobile menu =====
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

menuToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  menuToggle.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.classList.remove('active');
  });
});

// ===== Active nav on scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 150;
    if (scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ===== Scroll Reveal =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
  // Don't observe hero elements — they are revealed after preloader
  if (!el.closest('.hero')) {
    revealObserver.observe(el);
  }
});

// ===== Works filter with animation =====
const filterBtns = document.querySelectorAll('.filter-btn');
const workItems = document.querySelectorAll('.work-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    workItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;

      if (match) {
        item.classList.remove('hidden', 'filtering-out');
        item.classList.add('filtering-in');
        setTimeout(() => item.classList.remove('filtering-in'), 400);
      } else {
        item.classList.add('filtering-out');
        setTimeout(() => {
          item.classList.add('hidden');
          item.classList.remove('filtering-out');
        }, 300);
      }
    });
  });
});

// ===== Lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const lightboxCaption = document.querySelector('.lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');

workItems.forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const title = item.querySelector('h3')?.textContent || '';
    const desc = item.querySelector('p')?.textContent || '';

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = `${title} — ${desc}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('active')) {
    closeLightbox();
  }
});

// ===== Sparkles on hero =====
function createSparkle() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.style.left = Math.random() * 100 + '%';
  sparkle.style.top = Math.random() * 100 + '%';
  hero.appendChild(sparkle);

  setTimeout(() => sparkle.remove(), 2000);
}

setInterval(() => {
  if (Math.random() > 0.55) createSparkle();
}, 700);

// ===== Smooth anchor scroll offset for fixed header =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


// ===== Bubbles =====
(function initBubbles() {
  const container = document.getElementById('bubbles');
  if (!container) return;

  const MAX_BUBBLES = 18;

  function createBubble() {
    if (container.children.length >= MAX_BUBBLES) return;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size = 12 + Math.random() * 36; // 12–48px
    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 12; // 8–20s
    const delay = Math.random() * 2;

    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = left + '%';
    bubble.style.animationDuration = duration + 's';
    bubble.style.animationDelay = delay + 's';

    // Random horizontal drift via custom property
    bubble.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');

    container.appendChild(bubble);

    // Pop near the top (random chance) or remove after animation
    const popTime = (duration * 0.75 + delay) * 1000;
    const shouldPop = Math.random() > 0.45;

    const removeTimer = setTimeout(() => {
      bubble.remove();
    }, (duration + delay) * 1000 + 100);

    if (shouldPop) {
      setTimeout(() => {
        if (!bubble.parentNode) return;
        bubble.classList.add('pop');
        setTimeout(() => bubble.remove(), 350);
        clearTimeout(removeTimer);
      }, popTime);
    }
  }

  // Initial burst
  for (let i = 0; i < 8; i++) {
    setTimeout(createBubble, i * 200);
  }

  // Keep spawning
  setInterval(createBubble, 900);
})();


// ===== Contact channel switcher (IG / TG) =====
(function initContactSwitcher() {
  const btn = document.getElementById('contact-btn');
  const links = document.querySelectorAll('.social-link[data-channel]');
  if (!btn || !links.length) return;

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const url = link.dataset.url;
      const label = link.dataset.label;
      btn.href = url;
      btn.textContent = label;
    });
  });
})();

