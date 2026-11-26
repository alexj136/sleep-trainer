/** Time/scene logic for the sleep trainer display. */

/** @returns {Date} today at the given HH:MM (seconds zeroed) */
export function todayAt(clock, now = new Date()) {
  const [hours, minutes] = clock.split(':').map(Number);
  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * HH:MM minus offsetMinutes, on the nearest day that satisfies `ok`, searching
 * in direction `step` (-1 = latest past occurrence, +1 = soonest future one).
 */
function occurrence(clock, offsetMinutes, now, step, ok) {
  const d = todayAt(clock, now);
  d.setMinutes(d.getMinutes() - offsetMinutes);
  // Step whole calendar days so the wall-clock time survives DST changes.
  // First overshoot to the far side, then walk back to the nearest match.
  while (ok(d)) d.setDate(d.getDate() - step);
  while (!ok(d)) d.setDate(d.getDate() + step);
  return d;
}

/**
 * The daily cycle as [scene, clock, offsetMinutes]: dawn starts `sunrise`
 * minutes before wake, day at wake, night at sunset. Dawn is skipped when
 * sunrise is 0. Order matters: if two boundaries coincide, the later one wins.
 */
function boundaries({ wake, sunrise, sunset }) {
  const list = [];
  if (sunrise > 0) list.push(['dawn', wake, sunrise]);
  list.push(['day', wake, 0], ['night', sunset, 0]);
  return list;
}

/** Scene showing at `now`: whichever boundary happened most recently. */
export function sceneAt(cfg, now = new Date()) {
  let best = null;
  let bestAt = -Infinity;
  for (const [scene, clock, offset] of boundaries(cfg)) {
    const at = occurrence(clock, offset, now, -1, (d) => d <= now).getTime();
    if (at >= bestAt) { best = scene; bestAt = at; }
  }
  return best;
}

/** When the scene next changes (strictly after `now`). */
export function nextChangeAt(cfg, now = new Date()) {
  let soonest = Infinity;
  for (const [, clock, offset] of boundaries(cfg)) {
    const at = occurrence(clock, offset, now, 1, (d) => d > now).getTime();
    soonest = Math.min(soonest, at);
  }
  return new Date(soonest);
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
