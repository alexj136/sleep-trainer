/** Time/scene logic for the sleep trainer display. */

/** @returns {Date} today at the given HH:MM (seconds zeroed) */
export function todayAt(clock, now = new Date()) {
  const [hours, minutes] = clock.split(':').map(Number);
  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Scene for the current moment.
 * @returns {'night'|'dawn'|'day'}
 */
export function getScene(wake, sunriseMinutes, now = new Date()) {
  const wakeDate = todayAt(wake, now);
  const t = now.getTime();

  if (t >= wakeDate.getTime()) return 'day';

  if (sunriseMinutes > 0) {
    const dawn = new Date(wakeDate.getTime() - sunriseMinutes * 60_000);
    if (t >= dawn.getTime()) return 'dawn';
  }

  return 'night';
}

/**
 * Next transition, if any. Returns null once day is reached.
 * @returns {{ at: Date, scene: 'dawn'|'day' } | null}
 */
export function getNextTransition(wake, sunriseMinutes, now = new Date()) {
  const scene = getScene(wake, sunriseMinutes, now);
  const wakeDate = todayAt(wake, now);

  if (scene === 'night') {
    if (sunriseMinutes > 0) {
      return {
        at: new Date(wakeDate.getTime() - sunriseMinutes * 60_000),
        scene: 'dawn',
      };
    }
    return { at: wakeDate, scene: 'day' };
  }

  if (scene === 'dawn') {
    return { at: wakeDate, scene: 'day' };
  }

  return null;
}

/** preview: HH:MM | 'night' | 'sunrise' | 'dawn' | 'day' */
export function resolvePreview(preview, now = new Date()) {
  if (!preview) return { now, forceScene: null };

  const lower = preview.toLowerCase();
  if (lower === 'night') return { now, forceScene: 'night' };
  if (lower === 'day') return { now, forceScene: 'day' };
  if (lower === 'sunrise' || lower === 'dawn') return { now, forceScene: 'dawn' };

  if (/^\d{1,2}:\d{2}$/.test(preview)) {
    const [hours, minutes] = preview.split(':').map(Number);
    const simulated = new Date(now);
    simulated.setHours(hours, minutes, 0, 0);
    return { now: simulated, forceScene: null };
  }

  return { now, forceScene: null };
}
