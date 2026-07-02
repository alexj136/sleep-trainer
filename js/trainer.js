import { parseTrainerParams, THEMES } from './config.js';
import { getScene, resolvePreview } from './time.js';
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

function setImages() {
  layers.night.style.backgroundImage = `url(${theme.images.night})`;
  layers.dawn.style.backgroundImage = `url(${theme.images.dawn})`;
  layers.day.style.backgroundImage = `url(${theme.images.day})`;
}

function applyScene(scene, progress) {
  root.dataset.scene = scene;

  if (scene === 'night') {
    layers.night.style.opacity = '1';
    layers.dawn.style.opacity = '0';
    layers.day.style.opacity = '0';
  } else if (scene === 'sunrise') {
    layers.night.style.opacity = String(1 - progress);
    layers.dawn.style.opacity = String(progress);
    layers.day.style.opacity = '0';
  } else {
    layers.night.style.opacity = '0';
    layers.dawn.style.opacity = '0';
    layers.day.style.opacity = '1';
  }
}

function tick() {
  const { now, forceScene, forceProgress } = resolvePreview(
    params.preview,
    params.wake,
    params.sunrise,
  );

  let scene, progress;
  if (forceScene) {
    scene = forceScene;
    progress = forceProgress ?? 0;
  } else {
    ({ scene, progress } = getScene(params.wake, params.sunrise, now));
  }

  applyScene(scene, progress);

  if (params.preview) {
    previewBadge.hidden = false;
    const label = forceScene || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    previewBadge.textContent = `Preview · ${label} · ${scene}`;
  }
}

function scheduleTick() {
  tick();
  const now = new Date();
  const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  setTimeout(() => {
    tick();
    setInterval(tick, 60_000);
  }, msToNextMinute);
}

initDisplay();
setImages();
scheduleTick();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
