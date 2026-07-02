import { parseTrainerParams, THEMES } from './config.js';
import { nextTimes, sceneAt, resolvePreview } from './time.js';
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
let done = false;
let dawnAt = null;
let wakeAt = null;

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

function showDay() {
  applyScene('day');
  done = true;
  clearTimer();
}

function start() {
  if (done) return;

  clearTimer();
  ({ dawnAt, wakeAt } = nextTimes(params.wake, params.sunrise, new Date()));
  const now = Date.now();

  if (now >= wakeAt.getTime()) {
    showDay();
    return;
  }

  applyScene('night');

  if (dawnAt && now >= dawnAt.getTime()) {
    applyScene('dawn');
    timer = setTimeout(showDay, wakeAt.getTime() - now);
    return;
  }

  if (!dawnAt) {
    timer = setTimeout(showDay, wakeAt.getTime() - now);
    return;
  }

  timer = setTimeout(() => {
    applyScene('dawn');
    timer = setTimeout(showDay, wakeAt.getTime() - dawnAt.getTime());
  }, dawnAt.getTime() - now);
}

function catchUp() {
  if (done || params.preview) return;

  const now = Date.now();
  if (now >= wakeAt.getTime()) {
    showDay();
    return;
  }
  if (dawnAt && now >= dawnAt.getTime()) {
    applyScene('dawn');
    clearTimer();
    timer = setTimeout(showDay, wakeAt.getTime() - now);
    return;
  }
  start();
}

initDisplay();
setImages();
start();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    catchUp();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
