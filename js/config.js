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

const DEFAULTS = { wake: '06:30', sunrise: 1, sunset: '18:15', theme: 'pixel_cat' };

const CLOCK = /^([01]?\d|2[0-3]):[0-5]\d$/;
const SUNRISE_MAX = 120;

/**
 * Reads the trainer settings from the query string. A missing value uses its
 * default; a value that is present but invalid also uses the default and adds
 * a message to `errors`, so the caller can send the user back to fix it.
 */
export function parseTrainerParams(search = location.search) {
  const p = new URLSearchParams(search);
  const errors = [];

  const clock = (name, label) => {
    if (!p.has(name)) return DEFAULTS[name];
    const value = p.get(name);
    if (CLOCK.test(value)) return value;
    errors.push(`${label} "${value}" isn't a valid time. Use HH:MM, e.g. ${DEFAULTS[name]}.`);
    return DEFAULTS[name];
  };

  const wake = clock('wake', 'Wake time');
  const sunset = clock('sunset', 'Sunset time');

  let sunrise = DEFAULTS.sunrise;
  if (p.has('sunrise')) {
    const value = p.get('sunrise');
    if (/^\d+$/.test(value) && Number(value) <= SUNRISE_MAX) {
      sunrise = Number(value);
    } else {
      errors.push(`Sunrise duration "${value}" must be a whole number of minutes from 0 to ${SUNRISE_MAX}.`);
    }
  }

  let theme = DEFAULTS.theme;
  if (p.has('theme')) {
    const value = p.get('theme');
    if (Object.hasOwn(THEMES, value)) {
      theme = value;
    } else {
      errors.push(`Theme "${value}" doesn't exist. Pick one from the list.`);
    }
  }

  const preview = p.get('preview') || null;
  return { wake, sunrise, sunset, theme, preview, errors };
}

export function buildTrainerUrl({ wake, sunrise, sunset, theme }) {
  const p = new URLSearchParams({ wake, sunrise: String(sunrise), sunset, theme });
  return `trainer.html?${p}`;
}
