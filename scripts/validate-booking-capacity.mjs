import assert from 'node:assert/strict';

const ENDPOINT = 'https://nordsym.app.n8n.cloud/webhook/availability';
const SCHEDULE = [
  ['10:00', '14:00', '16:00'],
  ['09:00', '11:00', '15:00'],
  ['10:00', '13:00', '16:00'],
  ['09:00', '14:00', '15:00'],
  ['10:00', '13:00', '15:00']
];
const RESERVED = ['10:00', '15:00', '13:00', '09:00', '15:00'];

function stockholmToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 12));
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

const start = stockholmToday();
const daysUntilMonday = (8 - start.getUTCDay()) % 7 || 7;
start.setUTCDate(start.getUTCDate() + daysUntilMonday);

for (let index = 0; index < 5; index += 1) {
  const date = new Date(start);
  date.setUTCDate(start.getUTCDate() + index);
  const dateValue = isoDate(date);
  const response = await fetch(`${ENDPOINT}?date=${encodeURIComponent(dateValue)}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8_000)
  });
  assert.equal(response.ok, true, `${dateValue} returned ${response.status}`);
  const result = await response.json();

  assert.deepEqual(result.offered, SCHEDULE[index], `${dateValue} schedule drifted`);
  assert.equal(result.durationMinutes, 20, `${dateValue} duration drifted`);
  assert.equal(result.busy.every((time) => result.offered.includes(time)), true, `${dateValue} has an unknown busy slot`);
  assert.equal(result.held.every((time) => result.offered.includes(time)), true, `${dateValue} has an unknown held slot`);
  assert.equal(result.held.some((time) => result.busy.includes(time)), false, `${dateValue} labels one slot busy and held`);

  if (result.capped) {
    assert.deepEqual(result.busy, result.offered, `${dateValue} cap does not block every slot`);
    assert.deepEqual(result.held, [], `${dateValue} exposes a hold after the daily cap`);
  } else if (result.busy.includes(RESERVED[index])) {
    assert.deepEqual(result.held, [], `${dateValue} duplicates a real calendar conflict`);
  } else {
    assert.deepEqual(result.held, [RESERVED[index]], `${dateValue} capacity hold drifted`);
  }
}

const invalidResponse = await fetch(`${ENDPOINT}?date=2026-09-31`, {
  headers: { Accept: 'application/json' },
  signal: AbortSignal.timeout(8_000)
});
assert.equal(invalidResponse.ok, true, `invalid-date contract returned ${invalidResponse.status}`);
const invalidResult = await invalidResponse.json();
assert.deepEqual(invalidResult.offered, [], 'impossible calendar date returned offered slots');
assert.deepEqual(invalidResult.busy, [], 'impossible calendar date returned busy slots');
assert.equal(invalidResult.note, 'ignored', 'impossible calendar date was not rejected');

console.log('booking-capacity: ok (5 weekday schedules, live conflicts, one truthful capacity hold, strict dates, 20-minute duration)');
