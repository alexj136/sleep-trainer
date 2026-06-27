import { parseTrainerParams, THEMES } from './config.js';
import { getScene, resolvePreview } from './time.js';

const params = parseTrainerParams();
const theme = THEMES[params.theme];
const root = document.documentElement;

const layers = {
  night: document.getElementById('layer-night'),
  dawn: document.getElementById('layer-dawn'),
  day: document.getElementById('layer-day'),
};

const sun = document.getElementById('sun');
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
    sun.style.opacity = '0';
  } else if (scene === 'sunrise') {
    // Early sunrise: fade night → dawn; late: dawn fully visible, sun rises
    const fadeIn = Math.min(1, progress * 2.5);
    layers.night.style.opacity = String(1 - fadeIn);
    layers.dawn.style.opacity = String(fadeIn);
    layers.day.style.opacity = '0';

    const sunProgress = Math.max(0, (progress - 0.15) / 0.85);
    const sunY = 55 - sunProgress * 45; // % from bottom
    sun.style.opacity = String(Math.min(1, progress * 3));
    sun.style.bottom = `${sunY}%`;
    layers.dawn.style.transform = `translateY(${(1 - sunProgress) * 4}%)`;
  } else {
    layers.night.style.opacity = '0';
    layers.dawn.style.opacity = '0';
    layers.day.style.opacity = '1';
    sun.style.opacity = '0';
    layers.dawn.style.transform = '';
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

setImages();
scheduleTick();

// PWA service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
