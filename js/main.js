/* =====================================================================
   ConcreJota — interações
   ===================================================================== */

(() => {
  'use strict';

  /* ---------- Header + Back-to-top com scroll ---------- */
  const header     = document.getElementById('siteHeader');
  const backToTop  = document.getElementById('backToTop');

  const onScroll = () => {
    const y = window.scrollY;
    if (y > 30) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    if (backToTop) {
      if (y > 400) backToTop.classList.add('is-visible');
      else backToTop.classList.remove('is-visible');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Menu mobile ---------- */
  const toggle  = document.getElementById('menuToggle');
  const drawer  = document.getElementById('navMobile');

  const closeMenu = () => {
    toggle.classList.remove('is-open');
    drawer.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    toggle.classList.add('is-open');
    drawer.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  toggle?.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  drawer?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeMenu);
  });

  /* Fecha o menu ao redimensionar para desktop */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 880 && drawer.classList.contains('is-open')) closeMenu();
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // pequeno stagger se houver vários no mesmo bloco
            entry.target.style.transitionDelay = `${Math.min(i * 40, 200)}ms`;
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- FAQ — fecha os outros ao abrir um ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Ano no footer ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Suavização extra do scroll para âncoras ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

/* ---------- Form submit (FormSubmit.co via AJAX) ----------
   Envio via AJAX: o cliente vê a confirmação na própria página,
   sem redirecionar para nenhuma página externa.                  */
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const messageEl = document.getElementById('formMessage');
  const btnSpan = form.querySelector('button[type="submit"] span');
  const originalLabel = btnSpan ? btnSpan.textContent : 'Enviar solicitação';

  const setMessage = (text, type) => {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = 'form-message ' + (type ? 'is-' + type : '');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setMessage('', '');
    if (btnSpan) btnSpan.textContent = 'Enviando...';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));

      // FormSubmit retorna success como string ("true"/"false").
      if (res.ok && String(data.success) !== 'false') {
        if (btnSpan) btnSpan.textContent = 'Solicitação enviada ✓';
        setMessage('Solicitação enviada com sucesso! Em breve a equipe da ConcreJota entrará em contato.', 'success');
        form.reset();
        setTimeout(() => {
          if (btnSpan) btnSpan.textContent = originalLabel;
        }, 4000);
      } else {
        throw new Error(data.message || 'Falha no envio');
      }
    } catch (err) {
      if (btnSpan) btnSpan.textContent = originalLabel;
      setMessage('Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.', 'error');
    }
  });
})();
