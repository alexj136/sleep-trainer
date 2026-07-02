/** Keep screen on and enter fullscreen — requires a user gesture to start. */

let wakeLock = null;
let engaged = false;

const overlay = () => document.getElementById('engage-overlay');

async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return false;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
    return true;
  } catch {
    wakeLock = null;
    return false;
  }
}

function requestFullscreen() {
  const el = document.documentElement;
  if (document.fullscreenElement || document.webkitFullscreenElement) return;

  const opts = { navigationUI: 'hide' };
  const fn =
    el.requestFullscreen?.bind(el) ||
    el.webkitRequestFullscreen?.bind(el);

  if (!fn) return;

  try {
    const result = fn(opts);
    if (result?.catch) result.catch(() => {});
  } catch {
    // ignored
  }
}

function lockPortrait() {
  screen.orientation?.lock?.('portrait').catch(() => {});
}

/** Call from a user-gesture handler (pointerdown on the overlay). */
export async function engageDisplay() {
  requestFullscreen();
  lockPortrait();
  await acquireWakeLock();
  engaged = true;
  overlay()?.classList.add('hidden');
}

export function initDisplay() {
  document.getElementById('engage-overlay')?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    engageDisplay();
  }, { passive: false });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && engaged) {
      acquireWakeLock();
    }
  });
}
