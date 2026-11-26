import { THEMES, parseTrainerParams, buildTrainerUrl } from './config.js';
import { COMMITTED_AT } from './version.js';

const form = document.getElementById('config-form');
const themeSelect = document.getElementById('theme');
const urlOutput = document.getElementById('url-output');

// Populate theme options
for (const [id, { label }] of Object.entries(THEMES)) {
  const opt = document.createElement('option');
  opt.value = id;
  opt.textContent = label;
  themeSelect.appendChild(opt);
}

// Restore from URL if present (e.g. back-navigation)
const saved = parseTrainerParams();

// Explain any bad values in the URL (the trainer page sends you back here).
if (saved.errors.length) {
  const box = document.getElementById('errors');
  const intro = document.createElement('p');
  intro.textContent = "Some settings in the link weren't valid, so they've been reset to the defaults below:";
  const list = document.createElement('ul');
  for (const message of saved.errors) {
    const item = document.createElement('li');
    item.textContent = message;
    list.appendChild(item);
  }
  box.append(intro, list);
  box.hidden = false;
}

form.wake.value = saved.wake;
form.sunrise.value = saved.sunrise;
form.sunset.value = saved.sunset;
form.theme.value = saved.theme;

function updateUrl() {
  const url = buildTrainerUrl({
    wake: form.wake.value,
    sunrise: form.sunrise.value,
    sunset: form.sunset.value,
    theme: form.theme.value,
  });
  urlOutput.href = url;
  urlOutput.textContent = url;
  return url;
}

form.addEventListener('input', updateUrl);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  location.href = updateUrl();
});

updateUrl();

const buildTime = document.getElementById('build-time');
if (buildTime && COMMITTED_AT) {
  const when = new Date(COMMITTED_AT);
  buildTime.textContent = `Deployed commit: ${when.toLocaleString()}`;
  buildTime.hidden = false;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
