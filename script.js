/* ─── Cursor glow ──────────────────────────────────────────────── */
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', e => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
}, { passive: true });

/* ─── Nav scroll ───────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── Mobile menu ──────────────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  navToggle.classList.toggle('open', open);
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

/* ─── Scroll reveal ────────────────────────────────────────────── */
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

reveals.forEach((el, i) => {
  el.style.transitionDelay = (i % 5) * 0.07 + 's';
  revealObserver.observe(el);
});


/* ─── Name scramble on load ────────────────────────────────────── */
const scrambleEl = document.getElementById('scrambleName');
const finalText = 'Emilio Dibildox';
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function scramble() {
  let iteration = 0;
  const interval = setInterval(() => {
    scrambleEl.innerText = finalText
      .split('')
      .map((char, idx) => {
        if (char === ' ') return ' ';
        if (idx < iteration) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');
    iteration += 0.5;
    if (iteration >= finalText.length) clearInterval(interval);
  }, 45);
}
setTimeout(scramble, 300);

/* ─── Counter animation ────────────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ─── Expand bullets on exp hover ─────────────────────────────── */
document.querySelectorAll('.exp-item:not(.exp-featured)').forEach(item => {
  const bullets = item.querySelector('.exp-bullets');
  if (!bullets) return;
  item.addEventListener('mouseenter', () => {
    bullets.style.display = 'flex';
    bullets.style.animation = 'fadeDown 0.3s ease both';
  });
  item.addEventListener('mouseleave', () => {
    bullets.style.display = 'none';
  });
});
