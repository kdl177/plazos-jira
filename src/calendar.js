// Spanish procedural deadlines, art. 183 LOPJ. Port of Apps/plazos-expedientes/computo.py.
// Dates are ISO strings (YYYY-MM-DD); arithmetic runs in UTC so no timezone shifts a day.

const NATIONAL = [[1, 1], [1, 6], [5, 1], [8, 15], [10, 12], [11, 1], [12, 6], [12, 8], [12, 25]];
export const UNITS = ['business', 'calendar', 'months'];
const DAY = 86400000;

const utc = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * DAY);

export function parseIso(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? '');
  if (!m) throw new Error(`Invalid date: ${s}`);
  const d = utc(+m[1], +m[2], +m[3]);
  if (iso(d) !== s) throw new Error(`Invalid date: ${s}`);
  return d;
}

export function easter(year) {
  // Meeus/Jones/Butcher, Gregorian calendar.
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(utc(year, month, day));
}

export function nationalHolidays(year) {
  const set = new Set(NATIONAL.map(([m, d]) => iso(utc(year, m, d))));
  set.add(iso(addDays(parseIso(easter(year)), -2))); // Good Friday
  return set;
}

function isNonWorking(d, extra, urgent) {
  const day = d.getUTCDay();
  if (day === 0 || day === 6 || extra.has(iso(d)) || nationalHolidays(d.getUTCFullYear()).has(iso(d))) return true;
  if (urgent) return false; // urgent matters: only weekends and holidays are excluded
  const m = d.getUTCMonth() + 1, dd = d.getUTCDate();
  return m === 8 || (m === 12 && dd >= 24) || (m === 1 && dd <= 6);
}

function nextWorkingDay(d, extra, urgent) {
  while (isNonWorking(d, extra, urgent)) d = addDays(d, 1);
  return d;
}

// Proposed last day of the deadline, counted from the day after notification.
// The lawyer always confirms it.
export function deadline(notified, amount, unit, { urgent = false, holidays = [] } = {}) {
  const extra = new Set(holidays);
  const start = parseIso(notified);
  amount = Number(amount);
  if (!Number.isInteger(amount) || amount < 1 || !UNITS.includes(unit)) throw new Error('Invalid deadline');
  if (unit === 'business') {
    let d = start, counted = 0;
    while (counted < amount) {
      d = addDays(d, 1);
      if (!isNonWorking(d, extra, urgent)) counted += 1;
    }
    return iso(d);
  }
  if (unit === 'calendar') return iso(nextWorkingDay(addDays(start, amount), extra, urgent));
  // Months: date to date; with no equivalent day, the last day of the month (art. 5 CC).
  const total = start.getUTCMonth() + amount;
  const y = start.getUTCFullYear() + Math.floor(total / 12), m = (total % 12) + 1;
  const last = utc(y, m + 1, 0).getUTCDate();
  return iso(nextWorkingDay(utc(y, m, Math.min(start.getUTCDate(), last)), extra, urgent));
}

// Days left and alert level, same thresholds as the desktop tool (7, 3, 1 days).
export function status(due, today) {
  const days = Math.round((parseIso(due) - parseIso(today)) / DAY);
  const level = days < 0 ? 'overdue' : days === 0 ? 'today' : days <= 1 ? 'd1' : days <= 3 ? 'd3' : days <= 7 ? 'd7' : 'ok';
  return { days, level };
}
