/* ==========================================================================
   Kishore V — Portfolio scripts
   Sections:
     1. Config (WhatsApp number, form endpoint, PROJECTS data)
     2. Navigation (scroll state, mobile menu, active link)
     3. Scroll reveal
     4. Skills (entrance + spotlight)
     5. Projects carousel (auto every 10s + arrows + dots + swipe)
     6. Book-a-call form
   ========================================================================== */

document.documentElement.classList.remove('no-js');

/* ---------- 1. Config ---------- */

const WHATSAPP_NUMBER = '919952944283';

/*
 * Form delivery. GitHub Pages has no backend, so:
 *  - Paste a form-service URL here (e.g. Formspree: "https://formspree.io/f/xxxxxxx")
 *    and submissions will be sent there.
 *  - Leave it empty and the form opens WhatsApp with the details pre-filled.
 */
const FORM_ENDPOINT = '';

/*
 * PROJECTS — edit this list to add real projects.
 * Fields: title, industry, description (~30 words), stack (array of strings).
 * Visual shapes cycle automatically: orb → rings → tiles → nodes.
 */
const PLACEHOLDER_DESC =
  'Project details coming soon. This space will describe the business problem, the AI agent or automation built to solve it, and the outcome it delivered for the team.';

const PROJECTS = [
  { title: 'Project One — Coming Soon',   industry: 'Industry to be announced', description: PLACEHOLDER_DESC, stack: ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'] },
  { title: 'Project Two — Coming Soon',   industry: 'Industry to be announced', description: PLACEHOLDER_DESC, stack: ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'] },
  { title: 'Project Three — Coming Soon', industry: 'Industry to be announced', description: PLACEHOLDER_DESC, stack: ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'] },
  { title: 'Project Four — Coming Soon',  industry: 'Industry to be announced', description: PLACEHOLDER_DESC, stack: ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'] },
  { title: 'Project Five — Coming Soon',  industry: 'Industry to be announced', description: PLACEHOLDER_DESC, stack: ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'] },
  { title: 'Project Six — Coming Soon',   industry: 'Industry to be announced', description: PLACEHOLDER_DESC, stack: ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'] },
  { title: 'Project Seven — Coming Soon', industry: 'Industry to be announced', description: PLACEHOLDER_DESC, stack: ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'] },
  { title: 'Project Eight — Coming Soon', industry: 'Industry to be announced', description: PLACEHOLDER_DESC, stack: ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'] },
];

const AUTO_ADVANCE_MS = 10000; // keep in sync with the 10s `progress` animation in style.css

/* ---------- 2. Navigation ---------- */
(function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links = document.querySelectorAll('.nav__links a');

  // Solid background once the page is scrolled
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  links.forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setOpen(false); });

  // Highlight the link of the section currently in view
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  document.getElementById('year').textContent = new Date().getFullYear();
})();

/* ---------- 3. Scroll reveal ---------- */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
})();

/* ---------- 4. Skills: entrance + left→right spotlight ---------- */
(function initSkills() {
  const wrap = document.getElementById('skills');
  const cards = wrap ? [...wrap.querySelectorAll('.skill')] : [];
  if (!cards.length) return;

  // Stagger the entrance: each card slides in from the left one after another
  cards.forEach((li, i) => li.style.setProperty('--i', i));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const STEP_MS = 1200; // time the spotlight stays on each card
  let index = 0, timer = null;

  const step = () => {
    cards.forEach((c) => c.classList.remove('is-lit'));
    cards[index].classList.add('is-lit');
    index = (index + 1) % cards.length;
  };
  const start = () => { if (!timer) { step(); timer = setInterval(step, STEP_MS); } };
  const stop = () => { clearInterval(timer); timer = null; cards.forEach((c) => c.classList.remove('is-lit')); };

  // Run only while the section is on screen; begin after the entrance finishes
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => { wrap.classList.add('is-ready'); start(); }, cards.length * 110 + 700);
    } else {
      stop();
    }
  }, { threshold: 0.3 });
  io.observe(wrap);

  // Hovering a card takes over from the spotlight
  wrap.addEventListener('mouseenter', stop);
  wrap.addEventListener('mouseleave', start);
})();

/* ---------- 5. Projects carousel ---------- */
(function initCarousel() {
  const carousel = document.getElementById('carousel');
  const stage = document.getElementById('carouselStage');
  const dotsWrap = document.getElementById('carouselDots');
  const progress = document.getElementById('progressFill');
  const currentNum = document.getElementById('currentNum');
  const totalNum = document.getElementById('totalNum');
  if (!carousel || !stage) return;

  const shapes = [
    '<div class="pc-shape pc-shape--orb"></div>',
    '<div class="pc-shape pc-shape--rings"><span></span></div>',
    '<div class="pc-shape pc-shape--tiles"><span></span><span></span><span></span><span></span></div>',
    '<div class="pc-shape pc-shape--nodes"><span></span><span></span><span></span><span></span><span></span></div>',
  ];
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Build cards + dots
  const total = PROJECTS.length;
  totalNum.textContent = pad(total);

  PROJECTS.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `Project ${i + 1} of ${total}`);
    card.innerHTML = `
      <div class="pc-visual">
        <span class="pc-visual__num">${pad(i + 1)}</span>
        <span class="pc-visual__ghost" aria-hidden="true">${pad(i + 1)}</span>
        ${shapes[i % shapes.length]}
      </div>
      <div class="pc-info">
        <span class="pc-industry">${esc(p.industry)}</span>
        <h3 class="pc-title">${esc(p.title)}</h3>
        <p class="pc-desc">${esc(p.description)}</p>
        <span class="pc-stack-label">Tech stack</span>
        <ul class="pc-stack">${p.stack.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>`;
    // Clicking a side card brings it to the front
    card.addEventListener('click', () => {
      if (card.dataset.pos === 'next') go(current + 1);
      if (card.dataset.pos === 'prev') go(current - 1);
    });
    stage.appendChild(card);

    const dot = document.createElement('button');
    dot.className = 'carousel__dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Show project ${i + 1}`);
    dot.addEventListener('click', () => go(i));
    dotsWrap.appendChild(dot);
  });

  const cards = [...stage.children];
  const dots = [...dotsWrap.children];
  let current = 0;

  function render() {
    cards.forEach((card, i) => {
      const offset = (i - current + total) % total;
      let pos;
      if (offset === 0) pos = 'active';
      else if (offset === 1) pos = 'next';
      else if (offset === total - 1) pos = 'prev';
      else pos = offset < total / 2 ? 'far-right' : 'far-left';
      card.dataset.pos = pos;
      card.setAttribute('aria-hidden', pos === 'active' ? 'false' : 'true');
    });
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
    currentNum.textContent = pad(current + 1);
    restartTimer();
  }

  function go(index) {
    current = (index + total) % total;
    render();
  }

  /*
   * Auto-advance: the progress bar's 10s CSS animation IS the timer.
   * When it ends we move to the next card. Pausing the animation (hover / focus /
   * tab hidden) pauses the timer too, so the two never drift apart.
   */
  function restartTimer() {
    progress.classList.remove('is-running');
    void progress.offsetWidth; // force reflow so the animation restarts
    progress.classList.add('is-running');
  }
  progress.addEventListener('animationend', () => go(current + 1));
  progress.style.animationDuration = AUTO_ADVANCE_MS + 'ms';

  const pause = () => carousel.classList.add('is-paused');
  const resume = () => carousel.classList.remove('is-paused');
  stage.addEventListener('mouseenter', pause);
  stage.addEventListener('mouseleave', resume);
  // Pause while a keyboard user is focused inside (mouse clicks on arrows don't pause)
  carousel.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) pause(); });
  carousel.addEventListener('focusout', resume);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : resume()));

  // Arrows + keyboard
  document.getElementById('prevBtn').addEventListener('click', () => go(current - 1));
  document.getElementById('nextBtn').addEventListener('click', () => go(current + 1));
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(current - 1);
    if (e.key === 'ArrowRight') go(current + 1);
  });

  // Touch swipe
  let startX = 0, startY = 0, tracking = false;
  stage.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY; tracking = true;
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  render();
})();

/* ---------- 6. Book-a-call form ---------- */
(function initForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  const setStatus = (msg) => { status.textContent = msg; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Simple validation
    const fields = [...form.querySelectorAll('input, textarea')];
    let valid = true;
    fields.forEach((f) => {
      const ok = f.value.trim().length > 0 && (f.name !== 'phone' || /^[+\d][\d\s()-]{6,}$/.test(f.value.trim()));
      f.closest('.field').classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) { setStatus('Please fill in all fields with a valid phone number.'); return; }

    const data = Object.fromEntries(new FormData(form));
    const button = form.querySelector('.form__submit');

    // A) Send to a form service if one is configured
    if (FORM_ENDPOINT) {
      button.disabled = true;
      setStatus('Sending…');
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(res.statusText);
        form.reset();
        setStatus('Thanks! Your request has been sent. I\'ll be in touch soon.');
      } catch (err) {
        setStatus('Something went wrong. Please message me on WhatsApp instead.');
      } finally {
        button.disabled = false;
      }
      return;
    }

    // B) Fallback: open WhatsApp with the details pre-filled
    const text =
      `Hi Kishore, I'd like to book a call.\n\n` +
      `Name: ${data.name}\nPhone: ${data.phone}\nRequirement: ${data.requirement}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    setStatus('Opening WhatsApp with your details…');
    form.reset();
  });

  // Clear the error state as the user types
  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field');
    if (field) field.classList.remove('is-invalid');
  });
})();
