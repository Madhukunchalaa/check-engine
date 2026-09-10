import './style.css';
import { createConfigurator, WRAPS, FINISHES, ALLOYS, CALIPERS, VIEWS } from './configurator.js';

const WHATSAPP = '910000000000';        // placeholder — swap for the shop's real number
const $  = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// ---------------------------------------------------------------- configurator
const car = createConfigurator($('#stage'), {
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
  ['#waBtn', '#waBtn2', '#waFloat'].forEach((s) => { const el = $(s); if (el) el.href = href; });
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

// ---------------------------------------------------------------- nav
const nav = $('#nav');
const waFloat = $('#waFloat');
const onScroll = () => {
  const y = scrollY;
  nav.classList.toggle('bg-ink-950/92', y > 20);
  nav.classList.toggle('backdrop-blur-xl', y > 20);
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
