import './style.css';
import { createConfigurator, WRAPS, FINISHES, ALLOYS, CALIPERS, VIEWS } from './configurator.js';

const WHATSAPP = '910000000000';        // placeholder — swap for the shop's real number
const $  = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// ---------------------------------------------------------------- configurator
// The headline and the control dock sit on top of the canvas. On a phone they
// cover most of it, so the configurator is told how much room is actually left
// and frames the car into that strip instead of the middle of the viewport.
// Desktop reports nothing and keeps the original full-frame composition.
const safeInsets = () => {
  if (innerWidth >= 1024) return { top: 0, bottom: 0 };
  const hero = $('#top').getBoundingClientRect();
  const copy = $('#heroCopy').getBoundingClientRect();
  const dock = $('#dock').getBoundingClientRect();
  return {
    top:    Math.max(0, copy.bottom - hero.top + 12),
    bottom: Math.max(0, hero.bottom - dock.top + 12),
  };
};

const car = createConfigurator($('#stage'), {
  safeInsets,
  onReady() {
    const l = $('#loader');
    l.style.opacity = '0';
    setTimeout(() => l.remove(), 750);
    syncSpec();
  },
  onError(err) {
    console.error('model failed', err);
    $('#loader').innerHTML =
      '<p class="text-[11px] tracking-ultra text-bone-500">3D UNAVAILABLE ON THIS DEVICE</p>';
  },
});

// Webfonts land after the first paint and change how tall the hero copy is.
document.fonts?.ready.then(() => car.refresh());

// ---------------------------------------------------------------- swatch rows
function buildSwatches(host, items, onPick) {
  items.forEach((item, i) => {
    const b = document.createElement('button');
    b.className = 'sw';
    b.style.background = '#' + item.hex.toString(16).padStart(6, '0');
    b.title = item.name;
    b.setAttribute('aria-label', item.name);
    b.setAttribute('aria-pressed', String(i === 0));
    b.onclick = () => {
      [...host.children].forEach((c) => c.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      onPick(i);
      syncSpec();
    };
    host.appendChild(b);
  });
}

buildSwatches($('#wrapRow'),    WRAPS,    (i) => car.setWrap(i));
buildSwatches($('#alloyRow'),   ALLOYS,   (i) => car.setAlloy(i));
buildSwatches($('#caliperRow'), CALIPERS, (i) => car.setCaliper(i));

// finishes are labelled chips, not colour dots
const finishHost = $('#finishRow');
FINISHES.forEach((f, i) => {
  const b = document.createElement('button');
  b.className = 'chip';
  b.textContent = f.name;
  b.title = f.note;
  b.setAttribute('aria-pressed', String(i === 0));
  b.onclick = () => {
    [...finishHost.children].forEach((c) => c.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    car.setFinish(i);
    syncSpec();
  };
  finishHost.appendChild(b);
});

// ---------------------------------------------------------------- view rail
const rail = $('#viewRail');
VIEWS.forEach((v, i) => {
  const b = document.createElement('button');
  b.className = 'view-btn';
  b.setAttribute('aria-pressed', String(i === 0));
  b.innerHTML = `<span class="text-right"><b>${v.label}</b><span>${v.service}</span></span><i></i>`;
  b.onclick = () => {
    [...rail.children].forEach((c) => c.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    car.setView(v.id);
    // The lighting view is pointless with the lamps off — switch them on for it.
    if (v.id === 'lights' && !car.state.lightsOn) {
      car.toggleLights(true);
      $('#lightsBtn').setAttribute('aria-pressed', 'true');
    }
  };
  rail.appendChild(b);
});

// ---------------------------------------------------------------- scene toggles
const lightsBtn = $('#lightsBtn');
lightsBtn.onclick = () => {
  car.toggleLights();
  lightsBtn.setAttribute('aria-pressed', String(car.state.lightsOn));
};
const nightBtn = $('#nightBtn');
nightBtn.onclick = () => {
  car.toggleNight();
  nightBtn.setAttribute('aria-pressed', String(car.state.night));
  lightsBtn.setAttribute('aria-pressed', String(car.state.lightsOn));
};

// ---------------------------------------------------------------- spec + WhatsApp
function syncSpec() {
  if (!car.isReady) return;
  const spec = car.summary();
  $('#specLine').textContent = spec;
  const msg = `Hi Check Engines — I built this on your site:\n\n${spec}\n\nCan you quote me for it?`;
  const href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  ['#waBtn', '#waBtn2', '#waBtn3', '#waFloat'].forEach((s) => { const el = $(s); if (el) el.href = href; });
}
syncSpec();

// ---------------------------------------------------------------- gallery
const grid = $('#grid');
for (let i = 1; i <= 12; i++) {
  const a = document.createElement('a');
  a.href = 'https://instagram.com/checkengineshyd';
  a.target = '_blank';
  a.rel = 'noreferrer';
  a.className = 'tile';
  a.innerHTML = `<img src="/insta/ig-${i}.webp" alt="Check Engines build ${i}" loading="lazy">`;
  grid.appendChild(a);
}

// ---------------------------------------------------------------- compare slider
(() => {
  const box = $('#compare'), clip = $('#cmpClip'), bar = $('#cmpBar');
  if (!box) return;
  const set = (pct) => {
    const p = Math.max(0, Math.min(100, pct));
    clip.style.width = p + '%';
    // Counter-scale the clipped image so it doesn't squash as the mask narrows.
    clip.style.setProperty('--cw', (100 / (p / 100)) + '%');
    bar.style.left = p + '%';
  };
  set(50);

  let dragging = false;
  const pctFrom = (clientX) => {
    const r = box.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * 100;
  };
  box.addEventListener('pointerdown', (e) => { dragging = true; box.setPointerCapture(e.pointerId); set(pctFrom(e.clientX)); });
  box.addEventListener('pointermove', (e) => { if (dragging) set(pctFrom(e.clientX)); });
  box.addEventListener('pointerup',   () => { dragging = false; });
  box.addEventListener('pointercancel', () => { dragging = false; });
})();

// ---------------------------------------------------------------- scroll reveal
// Position-based rather than IntersectionObserver-based on purpose: the nav
// anchors jump whole sections at a time, and anything skipped by a jump never
// receives an intersection callback — it would stay invisible for good. A plain
// "is it above the fold line yet" sweep catches those, and reveals anything the
// visitor lands on regardless of how they got there.
const revealSweep = (() => {
  let pending = $$('.rv');
  if (!pending.length) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pending.forEach((el) => el.classList.add('in'));
    return () => {};
  }
  let queued = false;
  const run = () => {
    queued = false;
    const line = innerHeight * 0.88;
    const still = [];
    for (const el of pending) {
      if (el.getBoundingClientRect().top < line) el.classList.add('in');
      else still.push(el);
    }
    pending = still;
  };
  return () => {
    if (queued || !pending.length) return;
    queued = true;
    requestAnimationFrame(run);
  };
})();
addEventListener('scroll', revealSweep, { passive: true });
addEventListener('resize', revealSweep);
revealSweep();
// Webfonts change element heights after first paint, so sweep again once settled.
document.fonts?.ready.then(revealSweep);

// ---------------------------------------------------------------- parallax bands
// Transform-only, driven from a single rAF-throttled scroll listener, and only
// while the band is actually on screen — anything else costs frames.
const bands = $$('.band-bg');
let parallaxTick = false;
const runParallax = () => {
  parallaxTick = false;
  const vh = innerHeight;
  bands.forEach((img) => {
    const band = img.parentElement;
    const r = band.getBoundingClientRect();
    if (r.bottom < -80 || r.top > vh + 80) return;
    const depth = Number(img.dataset.parallax || 0.15);
    // -1 above the fold .. +1 below it
    const progress = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
    img.style.transform = `translate3d(0, ${(progress * depth * r.height).toFixed(1)}px, 0)`;
  });
};
if (bands.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addEventListener('scroll', () => {
    if (parallaxTick) return;
    parallaxTick = true;
    requestAnimationFrame(runParallax);
  }, { passive: true });
  addEventListener('resize', runParallax);
  runParallax();
}

// ---------------------------------------------------------------- nav
const nav = $('#nav');
const waFloat = $('#waFloat');
const onScroll = () => {
  const y = scrollY;
  // Tailwind only generates opacity modifiers on its 5-step scale, so /92 was
  // silently dropped and the bar sat fully transparent over the gallery. It also
  // has to be near-solid: backdrop-blur alone smears whatever is behind it,
  // which turned the compare slider's red divider into a wash across the nav.
  nav.classList.toggle('bg-ink-950/95', y > 20);
  nav.classList.toggle('backdrop-blur-lg', y > 20);
  nav.classList.toggle('shadow-[0_1px_0_rgba(255,255,255,.07)]', y > 20);
  const show = y > innerHeight * 0.8;
  waFloat.classList.toggle('opacity-0', !show);
  waFloat.classList.toggle('translate-y-4', !show);
  waFloat.classList.toggle('pointer-events-none', !show);
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const burger = $('#burger'), drawer = $('#drawer');
burger.onclick = () => {
  const open = drawer.classList.toggle('hidden');
  burger.setAttribute('aria-expanded', String(!open));
};
$$('#drawer a').forEach((a) => a.onclick = () => {
  drawer.classList.add('hidden');
  burger.setAttribute('aria-expanded', 'false');
});
