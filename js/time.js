/** Time/scene logic for the sleep trainer display. */

/** @returns {{ hours: number, minutes: number }} */
export function parseClock(value) {
  const [h, m] = value.split(':').map(Number);
  return { hours: h, minutes: m };
}

/** Minutes since midnight (0–1439). */
export function toMinutes({ hours, minutes }) {
  return hours * 60 + minutes;
}

/** @returns {Date} today at the given HH:MM */
export function todayAt(clock, now = new Date()) {
  const { hours, minutes } = parseClock(clock);
  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Scene for the current moment.
 * @returns {{ scene: 'night'|'sunrise'|'day', progress: number }}
 *   progress is 0–1 during sunrise (sun position), 0 otherwise.
 */
export function getScene(wake, sunriseMinutes, now = new Date()) {
  const wakeDate = todayAt(wake, now);
  const sunriseStart = new Date(wakeDate.getTime() - sunriseMinutes * 60_000);
  const t = now.getTime();

  if (t >= wakeDate.getTime()) {
    return { scene: 'day', progress: 0 };
  }
  if (t >= sunriseStart.getTime()) {
    const elapsed = t - sunriseStart.getTime();
    const total = wakeDate.getTime() - sunriseStart.getTime();
    return { scene: 'sunrise', progress: Math.min(1, elapsed / total) };
  }
  return { scene: 'night', progress: 0 };
}

/**
 * Resolve preview override into a Date or forced scene.
 * preview: HH:MM | 'night' | 'sunrise' | 'day'
 */
export function resolvePreview(preview, wake, sunriseMinutes, now = new Date()) {
  if (!preview) return { now, forceScene: null, forceProgress: null };

  const lower = preview.toLowerCase();
  if (lower === 'night') return { now, forceScene: 'night', forceProgress: 0 };
  if (lower === 'day') return { now, forceScene: 'day', forceProgress: 0 };
  if (lower === 'sunrise') {
    const wakeDate = todayAt(wake, now);
    const sunriseStart = new Date(wakeDate.getTime() - sunriseMinutes * 60_000);
    const mid = new Date(sunriseStart.getTime() + (wakeDate.getTime() - sunriseStart.getTime()) / 2);
    return { now: mid, forceScene: 'sunrise', forceProgress: 0.5 };
  }

  if (/^\d{1,2}:\d{2}$/.test(preview)) {
    const { hours, minutes } = parseClock(preview);
    const simulated = new Date(now);
    simulated.setHours(hours, minutes, 0, 0);
    return { now: simulated, forceScene: null, forceProgress: null };
  }

  return { now, forceScene: null, forceProgress: null };
}
