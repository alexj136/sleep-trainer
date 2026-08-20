/** URL parameter helpers — all state lives in the query string. */

export const THEMES = {
  classic: {
    label: 'Classic cottage',
    images: {
      night: 'images/cottage/night.png',
      dawn: 'images/cottage/dawn.png',
      day: 'images/cottage/day.png'
    },
  },
  pixel_cat: {
    label: 'Pixel cat',
    images: {
      night: 'images/cat/night.png',
      dawn: 'images/cat/dawn.png',
      day: 'images/cat/day.png'
    },
  },
};

const DEFAULTS = { wake: '07:00', sunrise: 30, theme: 'classic' };

export function parseTrainerParams(search = location.search) {
  const p = new URLSearchParams(search);
  const wake = p.get('wake') || DEFAULTS.wake;
  const sunrise = Math.max(0, parseInt(p.get('sunrise') || DEFAULTS.sunrise, 10) || DEFAULTS.sunrise);
  const theme = THEMES[p.get('theme')] ? p.get('theme') : DEFAULTS.theme;
  const preview = p.get('preview') || null;
  return { wake, sunrise, theme, preview };
}

export function buildTrainerUrl({ wake, sunrise, theme }) {
  const p = new URLSearchParams({ wake, sunrise: String(sunrise), theme });
  return `trainer.html?${p}`;
}

export function parseIndexForm(search = location.search) {
  const { wake, sunrise, theme } = parseTrainerParams(search);
  return { wake, sunrise, theme };
}
