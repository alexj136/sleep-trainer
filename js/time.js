/** Time/scene logic for the sleep trainer display. */

/** @returns {{ hours: number, minutes: number }} */
export function parseClock(value) {
  const [h, m] = value.split(':').map(Number);
  return { hours: h, minutes: m };
}

/** @returns {Date} today at the given HH:MM (seconds zeroed) */
export function todayAt(clock, now = new Date()) {
  const { hours, minutes } = parseClock(clock);
  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function nextMidnight(from) {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Scene for the current moment — one image only, no blending.
 * @returns {'night'|'dawn'|'day'}
 */
export function getScene(wake, sunriseMinutes, now = new Date()) {
  const wakeDate = todayAt(wake, now);
  const t = now.getTime();

  if (t >= wakeDate.getTime()) return 'day';

  if (sunriseMinutes > 0) {
    const dawnStart = new Date(wakeDate.getTime() - sunriseMinutes * 60_000);
    if (t >= dawnStart.getTime()) return 'dawn';
  }

  return 'night';
}

/**
 * Next instant the scene changes, and which scene to show then.
 * @returns {{ at: Date, scene: 'night'|'dawn'|'day' }}
 */
export function getNextTransition(wake, sunriseMinutes, now = new Date()) {
  const current = getScene(wake, sunriseMinutes, now);
  const wakeDate = todayAt(wake, now);

  if (current === 'night') {
    if (sunriseMinutes > 0) {
      return { at: new Date(wakeDate.getTime() - sunriseMinutes * 60_000), scene: 'dawn' };
    }
    return { at: wakeDate, scene: 'day' };
  }

  if (current === 'dawn') {
    return { at: wakeDate, scene: 'day' };
  }

  return { at: nextMidnight(now), scene: 'night' };
}

/**
 * Resolve preview override.
 * preview: HH:MM | 'night' | 'sunrise' | 'dawn' | 'day'
 */
export function resolvePreview(preview, wake, sunriseMinutes, now = new Date()) {
  if (!preview) return { now, forceScene: null };

  const lower = preview.toLowerCase();
  if (lower === 'night') return { now, forceScene: 'night' };
  if (lower === 'day') return { now, forceScene: 'day' };
  if (lower === 'sunrise' || lower === 'dawn') return { now, forceScene: 'dawn' };

  if (/^\d{1,2}:\d{2}$/.test(preview)) {
    const { hours, minutes } = parseClock(preview);
    const simulated = new Date(now);
    simulated.setHours(hours, minutes, 0, 0);
    return { now: simulated, forceScene: null };
  }

  return { now, forceScene: null };
}
