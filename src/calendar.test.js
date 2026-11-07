import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deadline, easter, status } from './calendar.js';

test('easter', () => {
  assert.equal(easter(2026), '2026-04-05');
  assert.equal(easter(2027), '2027-03-28');
});

test('business days skip August: 5 in July and 5 in September', () => {
  assert.equal(deadline('2026-07-24', 10, 'business'), '2026-09-07');
});

test('Christmas break 24 Dec to 6 Jan and weekend: 22, 23, 7, 8, 11', () => {
  assert.equal(deadline('2026-12-21', 5, 'business'), '2027-01-11');
});

test('urgent: August counts', () => {
  assert.equal(deadline('2026-07-30', 3, 'business', { urgent: true }), '2026-08-04');
});

test('Good Friday is national; Maundy Thursday only if added', () => {
  assert.equal(deadline('2026-04-01', 2, 'business'), '2026-04-06');
  assert.equal(deadline('2026-04-01', 2, 'business', { holidays: ['2026-04-02'] }), '2026-04-07');
});

test('months landing on 15 August move to first working day of September', () => {
  assert.equal(deadline('2026-06-15', 2, 'months'), '2026-09-01');
});

test('months with no equivalent day: 31 Jan + 1 month = 28 Feb (Saturday) -> Monday 2 March', () => {
  assert.equal(deadline('2026-01-31', 1, 'months'), '2026-03-02');
});

test('calendar days', () => {
  assert.equal(deadline('2026-03-02', 10, 'calendar'), '2026-03-12');
});

test('notified on Friday, 1 business day: Monday', () => {
  assert.equal(deadline('2026-10-16', 1, 'business'), '2026-10-19');
});

test('rejects 0 days, bad unit and bad date', () => {
  assert.throws(() => deadline('2026-01-01', 0, 'business'));
  assert.throws(() => deadline('2026-01-01', 5, 'weeks'));
  assert.throws(() => deadline('2026-02-30', 5, 'business'));
});

test('status levels', () => {
  assert.deepEqual(status('2026-11-10', '2026-11-05'), { days: 5, level: 'd7' });
  assert.deepEqual(status('2026-11-06', '2026-11-05'), { days: 1, level: 'd1' });
  assert.deepEqual(status('2026-11-05', '2026-11-05'), { days: 0, level: 'today' });
  assert.deepEqual(status('2026-11-01', '2026-11-05'), { days: -4, level: 'overdue' });
  assert.deepEqual(status('2026-12-01', '2026-11-05'), { days: 26, level: 'ok' });
});
