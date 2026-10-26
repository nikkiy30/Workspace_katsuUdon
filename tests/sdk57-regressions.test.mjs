import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMarkedDates } from '../utils/calendarMarkers.ts';
import { aggregateWasteForCards, buildRecentMonthlyCards, safeParseDate } from '../utils/wasteSummary.ts';

test('recent month cards cross the year boundary in chronological order', () => {
  const cards = buildRecentMonthlyCards(new Date(2026, 0, 15));
  assert.deepEqual(cards.map(card => card.key), ['2025-11', '2025-12', '2026-01']);
  assert.deepEqual(cards.map(card => card.label), ['11月', '12月', '1月']);
});

test('no records stays zero, without fabricating a month-over-month change', () => {
  const cards = aggregateWasteForCards(buildRecentMonthlyCards(new Date(2026, 0, 15)), []);
  assert.deepEqual(cards.map(card => card.total), [0, 0, 0]);
  assert.deepEqual(cards.map(card => card.comparison), ['—', '—', '—']);
});

test('weekly boundaries, old SQL dates and excluded records retain their meaning', () => {
  const dates = [
    '2025-12-31 12:00:00',
    ...[1, 7, 8, 14, 15, 21, 22, 31].map(day => `2026-01-${String(day).padStart(2, '0')}T12:00:00`),
    'not-a-date', '2025-09-01T12:00:00',
  ];
  const records = Object.freeze(dates.map((created_at, index) => Object.freeze({
    id: index, food_name: '試験用食材', throw_amount: '1個', buy_amount: '2個', created_at,
  })));
  const original = buildRecentMonthlyCards(new Date(2026, 0, 15));
  const before = JSON.stringify(original);
  const cards = aggregateWasteForCards(original, records);
  assert.deepEqual(cards.map(card => card.total), [0, 1, 8]);
  assert.deepEqual(cards[2].weeklyData, [2, 2, 2, 2]);
  assert.equal(cards[1].comparison, '+∞% ↑');
  assert.equal(cards[2].comparison, '+700% ↑');
  assert.equal(JSON.stringify(original), before, 'aggregation must not mutate its input cards');
});

test('invalid legacy dates are rejected rather than displayed as a real date', () => {
  assert.equal(safeParseDate('not-a-date'), null);
  assert.equal(safeParseDate(''), null);
  const date = safeParseDate('2026-01-07 12:30:00');
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 0);
  assert.equal(date.getDate(), 7);
});

test('an empty calendar still highlights the selected day', () => {
  assert.deepEqual(buildMarkedDates([], '2026-01-15', '2026-01-15', '#123456'), {
    '2026-01-15': { selected: true, selectedColor: '#123456', dots: [] },
  });
});

test('usage and expiry dots coexist without mutating stored food items', () => {
  const item = Object.freeze({ id: 'old-item', name: '試験用食材', quantity: '1個',
    usageDate: '2026-01-14', expiryDate: '2026-01-14' });
  const result = buildMarkedDates([item], '2026-01-14', '2026-01-15', '#123456');
  assert.equal(result['2026-01-14'].selected, true);
  assert.deepEqual(result['2026-01-14'].dots.map(dot => dot.color), ['#123456', '#ef4444']);
  assert.equal(item.expiryDate, '2026-01-14');
});
