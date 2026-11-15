import test from 'node:test';
import assert from 'node:assert/strict';
import { marsDistanceKm, evaluatePlan } from './calculations.js';
const assumptions = {
  speedKmh: 2,
  scienceMinutes: 20,
  contingencyMinutes: 30,
  oxygenMinutes: 360,
  batteryMinutes: 300,
  daylightMinutes: 240,
  reservePercent: 25,
  delayPercent: 0,
};
test('one degree at the equator uses source Mars 2000 sphere circumference', () =>
  assert.ok(Math.abs(marsDistanceKm([0, 0], [1, 0]) - 59.2746975233) < 0.001));
test('antimeridian takes the shorter arc', () =>
  assert.ok(marsDistanceKm([179.99, 0], [-179.99, 0]) < 1.2));
test('return retraces all legs and includes science, contingency and reserves', () => {
  const plan = evaluatePlan(
    [
      [0, 0],
      [0.01, 0],
      [0.01, 0.01],
    ],
    assumptions,
  );
  assert.ok(!plan.error);
  assert.equal(plan.roundTripKm, plan.distanceKm * 2);
  assert.equal(plan.plannedMinutes, plan.outboundMinutes * 2 + 50);
  assert.equal(plan.limitingResource, 'Daylight');
  assert.equal(plan.budgets[2].reserveMinutes, 60);
});
test('slower travel and delays can exceed budget', () => {
  const points = [
    [0, 0],
    [0.05, 0],
  ];
  const normal = evaluatePlan(points, assumptions);
  const delayed = evaluatePlan(points, { ...assumptions, delayPercent: 100 });
  assert.equal(normal.fitsBudget, false);
  assert.ok(delayed.marginMinutes < normal.marginMinutes);
});
test('negative budgets, NaN, impossible coordinates, zero speed and empty paths fail closed', () => {
  for (const change of [
    { speedKmh: 0 },
    { reservePercent: 100 },
    { oxygenMinutes: -1 },
    { daylightMinutes: NaN },
  ])
    assert.ok(
      evaluatePlan(
        [
          [0, 0],
          [1, 0],
        ],
        { ...assumptions, ...change },
      ).error,
    );
  assert.ok(
    evaluatePlan(
      [
        [0, 0],
        [181, 0],
      ],
      assumptions,
    ).error,
  );
  assert.ok(evaluatePlan([[0, 0]], assumptions).error);
});
test('budget fit is not a terrain safety verdict', () => {
  const result = evaluatePlan(
    [
      [0, 0],
      [0.01, 0],
    ],
    assumptions,
  );
  assert.equal(result.fitsBudget, true);
  assert.equal(result.safe, undefined);
});
