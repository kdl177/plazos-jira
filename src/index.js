import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { kvs, WhereConditions } from '@forge/kvs';
import { deadline, parseIso, status } from './calendar.js';

const resolver = new Resolver();
const todayIso = () => new Date().toISOString().slice(0, 10);
const holidaysKey = (projectKey) => `holidays:${projectKey}`;
const deadlineKey = (issueKey) => `deadline:${issueKey}`;
const getHolidays = async (projectKey) => (await kvs.get(holidaysKey(projectKey))) ?? [];
// null, never undefined: the bridge turns an undefined return into {} on the frontend.
const withStatus = (rec) => (rec ? { ...rec, ...status(rec.due, todayIso()) } : null);

async function jira(path, body, method = 'PUT') {
  const res = await api.asApp().requestJira(path, {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Jira ${res.status}: ${await res.text()}`);
}

const setDueDate = (issueKey, due) => jira(route`/rest/api/3/issue/${issueKey}`, { fields: { duedate: due } });

const comment = (issueKey, text) => jira(route`/rest/api/3/issue/${issueKey}/comment`, {
  body: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] },
}, 'POST');

async function allDeadlines() {
  const out = [];
  let cursor;
  do {
    const q = kvs.query().where('key', WhereConditions.beginsWith('deadline:')).limit(20);
    const page = await (cursor ? q.cursor(cursor) : q).getMany();
    out.push(...page.results.map((r) => r.value));
    cursor = page.nextCursor;
  } while (cursor);
  return out;
}

// Issue panel

resolver.define('getDeadline', async ({ context }) => withStatus(await kvs.get(deadlineKey(context.extension.issue.key))));

resolver.define('setDeadline', async ({ payload, context }) => {
  const { issue, project } = context.extension;
  const holidays = (await getHolidays(project.key)).map((h) => h.date);
  const urgent = payload.urgent === true;
  const due = deadline(payload.notified, payload.amount, payload.unit, { urgent, holidays });
  const rec = {
    issueKey: issue.key, projectKey: project.key, notified: payload.notified, amount: Number(payload.amount),
    unit: payload.unit, urgent, due, confirmed: false, noticed: null,
  };
  await kvs.set(deadlineKey(issue.key), rec);
  await setDueDate(issue.key, due);
  return withStatus(rec);
});

resolver.define('confirmDeadline', async ({ payload, context }) => {
  const key = deadlineKey(context.extension.issue.key);
  const rec = await kvs.get(key);
  if (!rec) return null;
  const due = payload.due || rec.due;
  parseIso(due);
  const next = { ...rec, due, confirmed: true, edited: due !== rec.due };
  await kvs.set(key, next);
  if (due !== rec.due) await setDueDate(rec.issueKey, due);
  return withStatus(next);
});

resolver.define('clearDeadline', async ({ context }) => {
  const issueKey = context.extension.issue.key;
  await kvs.delete(deadlineKey(issueKey));
  await setDueDate(issueKey, null);
  return null;
});

// Project settings: regional and local holidays

resolver.define('getHolidays', ({ context }) => getHolidays(context.extension.project.key));

resolver.define('setHolidays', async ({ payload, context }) => {
  const projectKey = context.extension.project.key;
  const byDate = new Map();
  for (const h of payload.holidays ?? []) {
    parseIso(h.date);
    byDate.set(h.date, { date: h.date, name: String(h.name ?? '').trim().slice(0, 80) });
  }
  const list = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  await kvs.set(holidaysKey(projectKey), list);
  // Proposed (unconfirmed) deadlines follow the calendar; confirmed ones never move on their own.
  const holidays = list.map((h) => h.date);
  for (const rec of await allDeadlines()) {
    if (rec.projectKey !== projectKey || rec.confirmed) continue;
    const due = deadline(rec.notified, rec.amount, rec.unit, { urgent: rec.urgent, holidays });
    if (due === rec.due) continue;
    await kvs.set(deadlineKey(rec.issueKey), { ...rec, due, noticed: null });
    await setDueDate(rec.issueKey, due);
  }
  return list;
});

export const handler = resolver.getDefinitions();

// Rovo actions

export async function computeDeadline(payload) {
  const { notified, amount, unit = 'business', projectKey } = payload;
  const urgent = payload.urgent === true || payload.urgent === 'true';
  const holidays = projectKey ? (await getHolidays(projectKey)).map((h) => h.date) : [];
  const due = deadline(notified, amount, unit, { urgent, holidays });
  return {
    due, ...status(due, todayIso()), notified, amount: Number(amount), unit, urgent,
    rule: urgent
      ? 'art. 183 LOPJ, urgent matter: weekends and holidays excluded; August and 24 Dec to 6 Jan count'
      : 'art. 183 LOPJ: weekends, holidays, August and 24 Dec to 6 Jan excluded',
    projectHolidaysApplied: holidays.length,
    note: 'This is a proposal. The lawyer confirms the date in the Court deadline panel of the issue.',
  };
}

export async function listDeadlines(payload) {
  const days = Number(payload.days ?? 7);
  const today = todayIso();
  const list = (await allDeadlines())
    .filter((r) => !payload.projectKey || r.projectKey === payload.projectKey)
    .map(withStatus)
    .filter((r) => r.days <= days)
    .sort((a, b) => a.days - b.days)
    .map(({ issueKey, due, days: left, level, confirmed, amount, unit, urgent }) =>
      ({ issueKey, due, daysLeft: left, level, confirmed, term: `${amount} ${unit}${urgent ? ', urgent' : ''}` }));
  return { today, withinDays: days, count: list.length, deadlines: list };
}

// Daily watch: one comment per alert level, so an issue is never spammed.

const NOTICE = {
  overdue: 'is overdue', today: 'expires today', d1: 'expires tomorrow',
  d3: 'expires within 3 days', d7: 'expires within 7 days',
};

export async function dailyNotices() {
  const today = todayIso();
  for (const rec of await allDeadlines()) {
    const { days, level } = status(rec.due, today);
    if (level === 'ok' || rec.noticed === level) continue;
    const when = days < 0 ? `${-days} days ago` : `${days} days left`;
    const state = rec.confirmed ? 'Confirmed by the lawyer.' : 'Not confirmed yet: open the Court deadline panel.';
    await comment(rec.issueKey, `Court deadline ${NOTICE[level]}: ${rec.due} (${when}). ${state}`);
    await kvs.set(deadlineKey(rec.issueKey), { ...rec, noticed: level });
  }
}
