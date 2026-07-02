/** Time/scene logic for the sleep trainer display. */

/** @returns {Date} today at the given HH:MM (seconds zeroed) */
export function todayAt(clock, now = new Date()) {
  const [hours, minutes] = clock.split(':').map(Number);
  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Next dawn (X−Y) and wake (X) — computed once per page load.
 * If today's wake is still ahead, uses today even when dawn has already started.
 */
export function nextTimes(wake, sunriseMinutes, now = new Date()) {
  let wakeAt = todayAt(wake, now);

  if (sunriseMinutes > 0 && now.getTime() < wakeAt.getTime()) {
    return {
      dawnAt: new Date(wakeAt.getTime() - sunriseMinutes * 60_000),
      wakeAt,
    };
  }

  while (wakeAt.getTime() <= now.getTime()) {
    wakeAt = new Date(wakeAt);
    wakeAt.setDate(wakeAt.getDate() + 1);
  }

  return {
    dawnAt: sunriseMinutes > 0
      ? new Date(wakeAt.getTime() - sunriseMinutes * 60_000)
      : null,
    wakeAt,
  };
}

/** For preview only — scene at an arbitrary moment. */
export function sceneAt(wake, sunriseMinutes, when) {
  const wakeAt = todayAt(wake, when);
  const t = when.getTime();
  if (t >= wakeAt.getTime()) return 'day';
  if (sunriseMinutes > 0) {
    const dawnAt = new Date(wakeAt.getTime() - sunriseMinutes * 60_000);
    if (t >= dawnAt.getTime()) return 'dawn';
  }
  return 'night';
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
