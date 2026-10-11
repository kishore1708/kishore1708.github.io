/* ==========================================================================
   Kishore V — Portfolio scripts
   Sections:
     1. Config (WhatsApp number, form endpoint, PROJECTS data)
     2. Navigation (scroll state, mobile menu, active link, theme toggle)
     3. Scroll reveal
     4. Skills (entrance + spotlight)
     5. Projects carousel (auto every 10s + arrows + dots + swipe)
     6. Book-a-call form
     7. Hero portrait parallax (desktop mouse only)
   ========================================================================== */

document.documentElement.classList.remove('no-js');

/* ---------- 1. Config ---------- */

const WHATSAPP_NUMBER = '919952944283';

/*
 * Book-a-call delivery. GitHub Pages has no backend, so submissions go through
 * FormSubmit (https://formsubmit.co), which emails them to the address below.
 * The very first submission triggers a one-time "Activate Form" email to this inbox —
 * click it once and every later submission arrives as a normal email.
 * Tip: after activating, FormSubmit gives you a random alias; paste it in place of the
 * email address to keep the address out of the page source.
 */
const FORM_EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/kishore1708@gmail.com';

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

/* Light / dark toggle — the initial theme is set by the inline script in <head> */
(function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!btn) return;

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#121212' : '#E9E9E6');
  };
  apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked — theme still switches */ }
  });
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

  const button = form.querySelector('.form__submit');
  const buttonText = form.querySelector('.form__submit-text');

  // One rule per field: returns an error message, or '' when the value is fine
  const RULES = {
    name: (v) => (!v ? 'Please enter your name.' : ''),
    phone: (v) => (!v ? 'Please enter your phone number.'
      : !/^\d+$/.test(v) ? 'Phone number can contain digits only.'
      : v.length !== 10 ? `Phone number must be exactly 10 digits (you entered ${v.length}).` : ''),
    email: (v) => (!v ? 'Please enter your email address.' : emailError(v)),
    requirement: (v) => (!v ? 'Please share your requirement in brief.' : ''),
  };

  // Proper email check: one @, valid local part, real-looking domain and TLD
  function emailError(v) {
    if (/\s/.test(v)) return 'Email address cannot contain spaces.';
    const parts = v.split('@');
    if (parts.length !== 2) return 'Email address must contain a single "@" (e.g. name@company.com).';
    const [local, domain] = parts;
    if (!local) return 'Please enter the part before "@" (e.g. name@company.com).';
    if (!domain) return 'Please enter the domain after "@" (e.g. name@company.com).';
    if (!/^[A-Za-z0-9._%+-]+$/.test(local) || /^\.|\.$|\.\./.test(local)) return 'The part before "@" contains invalid characters.';
    if (!/^([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/.test(domain)) return 'Please enter a valid domain (e.g. gmail.com or company.com).';
    return '';
  }

  const setStatus = (msg, isError = false) => {
    status.innerHTML = msg;
    status.classList.toggle('is-error', isError);
  };

  // Validate one input; show / clear its message. Returns true when valid.
  function check(input) {
    const msg = RULES[input.name](input.value.trim());
    const field = input.closest('.field');
    field.classList.toggle('is-invalid', !!msg);
    field.querySelector('.field__error').textContent = msg;
    input.setAttribute('aria-invalid', String(!!msg));
    return !msg;
  }

  const inputs = Object.keys(RULES).map((name) => form.elements[name]);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('');

    const invalid = inputs.filter((input) => !check(input));
    if (invalid.length) {
      invalid[0].focus();   // field-level messages are shown under each field
      return;
    }
    if (form.elements._honey.value) return; // bot

    const data = Object.fromEntries(inputs.map((i) => [i.name, i.value.trim()]));

    button.disabled = true;
    buttonText.textContent = 'Sending…';
    try {
      const res = await fetch(FORM_EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          Name: data.name,
          Phone: `${form.elements.code.value} ${data.phone}`,
          Email: data.email,
          Requirement: data.requirement,
          _subject: `New call request from ${data.name}`,
          _replyto: data.email,      // hitting "Reply" in the inbox answers the visitor
          _template: 'table',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || res.statusText);

      form.reset();
      inputs.forEach((i) => i.closest('.field').classList.remove('is-invalid'));
      setStatus('Thank you! Your request has been sent. I\'ll get back to you shortly.');
    } catch (err) {
      // Surface the two setup problems clearly; everything else gets a friendly fallback
      const reason = String(err && err.message || '');
      const wa = `<a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener">message me on WhatsApp</a>`;
      if (/activat/i.test(reason)) {
        setStatus(`This form is being set up and can't receive messages yet. Please ${wa}.`, true);
        console.warn('[FormSubmit] ' + reason);
      } else if (location.protocol === 'file:' || /web server/i.test(reason)) {
        setStatus('The form only works on the live website (not when index.html is opened from your computer).', true);
      } else {
        setStatus(`Sorry, your message couldn't be sent. Please try again or ${wa}.`, true);
      }
    } finally {
      button.disabled = false;
      buttonText.textContent = 'Submit';
    }
  });

  // Phone: keep digits only, max 10 (also handles paste like "+91 99529-44283")
  form.elements.phone.addEventListener('input', (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    e.target.value = digits.length > 10 ? digits.slice(-10) : digits; // pasted with a country code → keep the last 10
  });

  // Re-check a field as soon as the visitor fixes it / leaves it after an error
  inputs.forEach((input) => {
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('is-invalid')) check(input); });
    input.addEventListener('blur', () => { if (input.value.trim()) check(input); });
  });
})();

/* ---------- 7. Hero portrait parallax ---------- */
// Sets --mx / --my (-1…1) on the portrait from the mouse position over the hero;
// CSS turns them into small opposite shifts of the brush and photo layers.
(function initPortraitParallax() {
  const hero = document.querySelector('.hero');
  const portrait = document.getElementById('portrait');
  if (!hero || !portrait) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;   // skip touch devices
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = null, mx = 0, my = 0;
  const apply = () => {
    portrait.style.setProperty('--mx', mx.toFixed(3));
    portrait.style.setProperty('--my', my.toFixed(3));
    frame = null;
  };
  const queue = () => { if (!frame) frame = requestAnimationFrame(apply); };

  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width) * 2 - 1;
    my = ((e.clientY - r.top) / r.height) * 2 - 1;
    queue();
  });
  hero.addEventListener('mouseleave', () => { mx = 0; my = 0; queue(); });
})();
