import { parseTrainerParams, THEMES } from './config.js';
import { sceneAt, nextChangeAt } from './time.js';
import { initDisplay } from './display.js';

const params = parseTrainerParams();
const theme = THEMES[params.theme];
const root = document.documentElement;

const layers = {
  night: document.getElementById('layer-night'),
  dawn: document.getElementById('layer-dawn'),
  day: document.getElementById('layer-day'),
};

const previewBadge = document.getElementById('preview-badge');
let timer = null;

// Never sleep longer than this between checks, so a throttled or frozen
// timer (phone sleep, clock change) can only delay a scene change briefly.
const MAX_WAIT_MS = 60_000;

function setImages() {
  layers.night.style.backgroundImage = `url(${theme.images.night})`;
  layers.dawn.style.backgroundImage = `url(${theme.images.dawn})`;
  layers.day.style.backgroundImage = `url(${theme.images.day})`;
}

function applyScene(scene) {
  root.dataset.scene = scene;
  layers.night.style.opacity = scene === 'night' ? '1' : '0';
  layers.dawn.style.opacity = scene === 'dawn' ? '1' : '0';
  layers.day.style.opacity = scene === 'day' ? '1' : '0';
}

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

/** Show the right scene for now, then check again at the next change. */
function tick() {
  clearTimer();
  const now = new Date();
  applyScene(sceneAt(params, now));
  const wait = Math.min(nextChangeAt(params, now) - now, MAX_WAIT_MS);
  timer = setTimeout(tick, wait);
}

if (params.errors.length) {
  // Bad settings: go back to the settings page, which shows what's wrong.
  location.replace(`index.html${location.search}`);
} else {
  initDisplay();
  setImages();
  tick();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      tick();
    }
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
