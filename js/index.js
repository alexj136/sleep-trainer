import { THEMES, parseIndexForm, buildTrainerUrl } from './config.js';

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
const saved = parseIndexForm();
form.wake.value = saved.wake;
form.sunrise.value = saved.sunrise;
form.theme.value = saved.theme;

function updateUrl() {
  const url = buildTrainerUrl({
    wake: form.wake.value,
    sunrise: form.sunrise.value,
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
