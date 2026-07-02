import { parseTrainerParams, THEMES } from './config.js';
import { getScene, getNextTransition, resolvePreview } from './time.js';
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
let transitionTimer = null;

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

function currentScene() {
  const { now, forceScene } = resolvePreview(params.preview);

  if (forceScene) return { scene: forceScene, now, scheduled: false };
  return {
    scene: getScene(params.wake, params.sunrise, now),
    now,
    scheduled: !params.preview,
  };
}

function updatePreviewBadge(scene, now) {
  if (!params.preview) return;
  previewBadge.hidden = false;
  const label = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  previewBadge.textContent = `Preview · ${label} · ${scene}`;
}

function clearTransitionTimer() {
  if (transitionTimer !== null) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }
}

function scheduleNextTransition() {
  clearTransitionTimer();

  const { scene, now, scheduled } = currentScene();
  applyScene(scene);
  updatePreviewBadge(scene, now);

  if (!scheduled) return;

  const next = getNextTransition(params.wake, params.sunrise, now);
  if (!next) return;

  const delay = next.at.getTime() - Date.now();
  if (delay <= 0) {
    applyScene(next.scene);
    scheduleNextTransition();
    return;
  }

  transitionTimer = setTimeout(() => {
    applyScene(next.scene);
    scheduleNextTransition();
  }, delay);
}

initDisplay();
setImages();
scheduleNextTransition();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    scheduleNextTransition();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
