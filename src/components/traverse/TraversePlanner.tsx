import { useState } from 'react';
import MissionMap from '../map/MissionMap';
import {
  evaluatePlan,
  validCoordinate,
  marsDistanceKm,
  type Assumptions,
} from '../../planning/calculations.js';
import type { Mission } from '../../types';
import PlanningEvidence from '../missions/PlanningEvidence';

type Coordinate = [number, number];
type Draft = {
  base: Coordinate | null;
  routes: { A: Coordinate[]; B: Coordinate[] };
  assumptions: Assumptions;
  objective: string;
};
const defaults: Assumptions = {
  speedKmh: 2,
  scienceMinutes: 30,
  contingencyMinutes: 30,
  oxygenMinutes: 360,
  batteryMinutes: 360,
  daylightMinutes: 300,
  reservePercent: 25,
  delayPercent: 25,
};
const fields: { key: keyof Assumptions; label: string; min: number; max: number; step?: number }[] =
  [
    { key: 'speedKmh', label: 'Travel speed (km/h)', min: 0.1, max: 20, step: 0.1 },
    { key: 'scienceMinutes', label: 'Science stop (minutes)', min: 0, max: 1440 },
    { key: 'oxygenMinutes', label: 'Oxygen endurance (minutes)', min: 1, max: 1440 },
    { key: 'batteryMinutes', label: 'Battery endurance (minutes)', min: 1, max: 1440 },
    { key: 'daylightMinutes', label: 'Light remaining at departure (minutes)', min: 1, max: 1440 },
    { key: 'reservePercent', label: 'Protected reserve (%)', min: 0, max: 99 },
    { key: 'contingencyMinutes', label: 'Contingency allowance (minutes)', min: 0, max: 1440 },
    { key: 'delayPercent', label: 'Travel-time uncertainty (%)', min: 0, max: 500 },
  ];
function emptyDraft(): Draft {
  return { base: null, routes: { A: [], B: [] }, assumptions: { ...defaults }, objective: '' };
}
function readDraft(key: string): Draft {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (
      saved &&
      (saved.base === null || validCoordinate(saved.base)) &&
      ['A', 'B'].every(
        (id) =>
          Array.isArray(saved.routes?.[id]) &&
          saved.routes[id].length <= 20 &&
          saved.routes[id].every(validCoordinate),
      ) &&
      Object.keys(defaults).every((key) => Number.isFinite(saved.assumptions?.[key])) &&
      typeof saved.objective === 'string'
    )
      return saved;
  } catch {
    /* A damaged draft must not become operational input. */
  }
  return emptyDraft();
}
const minutes = (value: number) => `${Math.ceil(value)} min`;
const remainingMinutes = (value: number) => `${Math.floor(value)} min`;
export default function TraversePlanner({ mission }: { mission: Mission }) {
  const storageKey = `apollos-plan-v1-${mission.id}`;
  const [draft, setDraft] = useState<Draft>(() => readDraft(storageKey));
  const [active, setActive] = useState<'A' | 'B'>('A');
  const [mode, setMode] = useState<'inspect' | 'base' | 'waypoint'>('inspect');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [message, setMessage] = useState('');
  const points = draft.base ? [draft.base, ...draft.routes[active]] : [];
  const outOfRegion = points.some((point) => marsDistanceKm(mission.coordinates, point) > 50);
  const result = outOfRegion
    ? { error: 'Keep all points within 50 km of this mission’s landing site.' }
    : evaluatePlan(points, draft.assumptions);
  function save(next: Draft) {
    setDraft(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setMessage('Draft saved in this browser.');
    } catch {
      setMessage('Browser storage unavailable. Export your plan before closing.');
    }
  }
  function pick(coordinate: Coordinate) {
    if (!validCoordinate(coordinate)) {
      setMessage('Select a valid Mars coordinate.');
      return;
    }
    if (marsDistanceKm(mission.coordinates, coordinate) > 50) {
      setMessage('Keep this regional planning draft within 50 km of the rover landing site.');
      return;
    }
    if (mode === 'base') {
      save({ ...draft, base: coordinate });
      setMode('waypoint');
    } else if (mode === 'waypoint') {
      if (!draft.base) {
        setMessage('Set a hypothetical base first.');
        return;
      }
      if (draft.routes[active].length >= 20) {
        setMessage('Limit reached: 20 waypoints per candidate.');
        return;
      }
      save({
        ...draft,
        routes: { ...draft.routes, [active]: [...draft.routes[active], coordinate] },
      });
    }
  }
  function exportPlan() {
    const report = {
      schemaVersion: 1,
      missionId: mission.id,
      createdAt: new Date().toISOString(),
      coordinateReference: 'Mars spherical approximation, east longitude / north latitude, degrees',
      status: 'NOT VALIDATED FOR NAVIGATION',
      assumptionsType: 'User-editable demonstration inputs; no NASA suit limits supplied',
      draft,
      results: {
        A: evaluatePlan(draft.base ? [draft.base, ...draft.routes.A] : [], draft.assumptions),
        B: evaluatePlan(draft.base ? [draft.base, ...draft.routes.B] : [], draft.assumptions),
      },
      unresolved: [
        'Measured elevation and slope',
        'Surface obstacles and bearing capacity',
        'Communication line of sight',
        'Mars lighting and environmental forecast',
        'Mission-approved suit limits',
        'Independent evacuation route',
      ],
      sourceLimitations: {
        marsTrek:
          'Orbital imagery supports point placement; elevation and slope are not evaluated.',
        usgs: 'Geological context is not a traversability or soil-strength measurement.',
        curiosityRoute: 'Historical 2019 proposal, not a current route or astronaut plan.',
        worldview: 'Earth-only imagery excluded from Mars calculations.',
        perseveranceImages:
          'No route-level location, scale or obstacle clearance inferred from raw photos.',
      },
      sourceLibrary: [
        'https://trek.nasa.gov/mars/',
        'https://astrogeology-usgs.hub.arcgis.com/pages/interactive-maps-mars',
        'https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/',
        'https://worldview.earthdata.nasa.gov/',
        'https://mars.nasa.gov/mars2020/multimedia/raw-images/',
      ],
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `apollos-${mission.id}-traverse.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="planner">
      <div className="planner-intro">
        <div>
          <p className="eyebrow">TRAVERSE WORKBENCH</p>
          <h3>Plan the return before the departure.</h3>
          <p>
            Draw candidate paths on the orbital map and compare their time and reserve requirements.
            These are manually selected paths, not automatically calculated safe routes.
          </p>
        </div>
        <button className="planner-button" onClick={exportPlan}>
          Export planning brief ↗
        </button>
      </div>
      <div className="planning-warning">
        <strong>Planning draft · Terrain safety unresolved</strong>
        <p>
          No astronaut operating limits were supplied. All defaults below are illustrative. A budget
          that fits does not establish that the terrain is passable.
        </p>
      </div>
      <label className="planner-label">
        Science objective
        <input
          value={draft.objective}
          maxLength={250}
          placeholder="Describe the investigation and selected destination"
          onChange={(event) => save({ ...draft, objective: event.target.value })}
        />
      </label>
      <div className="route-toolbar">
        <div className="candidate-switch">
          {(['A', 'B'] as const).map((id) => (
            <button
              key={id}
              aria-pressed={active === id}
              onClick={() => {
                setActive(id);
                setMode('inspect');
              }}
            >
              Candidate {id}
            </button>
          ))}
        </div>
        <label>
          Map action{' '}
          <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
            <option value="inspect">Inspect map</option>
            <option value="base">Place hypothetical base</option>
            <option value="waypoint">Add waypoint</option>
          </select>
        </label>
        <button
          onClick={() => {
            save({ ...draft, base: [...mission.coordinates] });
            setMode('waypoint');
          }}
        >
          Use rover landing as hypothetical base
        </button>
      </div>
      <p className="map-instruction">
        {mode === 'inspect'
          ? 'Pan and zoom to inspect the imagery. Choose a map action to place points.'
          : mode === 'base'
            ? 'Click the map to place your hypothetical base. This is not a proposed real landing site.'
            : `Click to add waypoints to Candidate ${active}. The last waypoint is the science destination.`}
      </p>
      <MissionMap
        mission={mission}
        planPoints={points}
        onCoordinatePick={pick}
        selectionMode={mode}
      />
      <form
        className="coordinate-entry"
        onSubmit={(event) => {
          event.preventDefault();
          if (!longitude.trim() || !latitude.trim()) {
            setMessage('Enter both coordinates.');
            return;
          }
          pick([Number(longitude), Number(latitude)]);
        }}
      >
        <span>Or enter a point:</span>
        <label>
          Longitude °E
          <input
            type="number"
            step="any"
            min="-180"
            max="180"
            required
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
          />
        </label>
        <label>
          Latitude °N
          <input
            type="number"
            step="any"
            min="-90"
            max="90"
            required
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
          />
        </label>
        <button disabled={mode === 'inspect'}>Add selected point</button>
      </form>
      <div className="planner-columns">
        <div>
          <h4>Candidate {active} waypoints</h4>
          {draft.base ? (
            <p>
              Hypothetical base: {draft.base[1].toFixed(5)}° N, {draft.base[0].toFixed(5)}° E
            </p>
          ) : (
            <p>No base set. Place one before adding a route.</p>
          )}
          <ol className="waypoint-list">
            {draft.routes[active].map((point, index) => (
              <li key={index}>
                <span>
                  {point[1].toFixed(5)}° N, {point[0].toFixed(5)}° E
                  {index === draft.routes[active].length - 1 ? ' · destination' : ''}
                </span>
                <button
                  aria-label={`Remove waypoint ${index + 1}`}
                  onClick={() =>
                    save({
                      ...draft,
                      routes: {
                        ...draft.routes,
                        [active]: draft.routes[active].filter((_, item) => item !== index),
                      },
                    })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>
          <p>
            Return assumption: retrace every waypoint back to base. No separate emergency return
            route has been assessed.
          </p>
        </div>
        <div>
          <h4>Editable demonstration assumptions</h4>
          <div className="assumption-grid">
            {fields.map((field) => (
              <label key={field.key}>
                {field.label}
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step ?? 1}
                  value={
                    Number.isFinite(draft.assumptions[field.key])
                      ? draft.assumptions[field.key]
                      : ''
                  }
                  onChange={(event) =>
                    save({
                      ...draft,
                      assumptions: {
                        ...draft.assumptions,
                        [field.key]: event.target.value === '' ? NaN : Number(event.target.value),
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </div>
      </div>
      <div role="status" className="save-status">
        {message}
      </div>
      <section className="plan-results" aria-live="polite">
        <h4>Candidate {active} budget assessment</h4>
        {'error' in result ? (
          <p>{result.error}</p>
        ) : (
          <>
            <div className={`budget-verdict ${result.fitsBudget ? 'within' : 'over'}`}>
              <strong>
                {result.fitsBudget
                  ? 'Within entered budgets — safety still unresolved'
                  : 'Exceeds entered budgets — revise the plan'}
              </strong>
              <span>Limiting resource: {result.limitingResource}</span>
            </div>
            <div className="result-metrics">
              <div>
                <span>Return-inclusive distance</span>
                <strong>{result.roundTripKm.toFixed(2)} km</strong>
                <small>Surface-arc estimate; excludes vertical relief</small>
              </div>
              <div>
                <span>Full excursion allowance</span>
                <strong>{minutes(result.plannedMinutes)}</strong>
                <small>Travel + science + contingency</small>
              </div>
              <div>
                <span>Headroom after protected reserves</span>
                <strong>
                  {result.marginMinutes >= 0
                    ? remainingMinutes(result.marginMinutes)
                    : `${Math.ceil(-result.marginMinutes)} min short`}
                </strong>
                <small>Reserves excluded from usable duration</small>
              </div>
            </div>
            <div className="budget-bars">
              {result.budgets.map((budget) => (
                <div key={budget.name}>
                  <div>
                    <strong>{budget.name}</strong>
                    <span>
                      {minutes(result.plannedMinutes)} / {minutes(budget.usableMinutes)} usable
                    </span>
                  </div>
                  <meter
                    min={0}
                    max={budget.usableMinutes}
                    value={Math.min(result.plannedMinutes, budget.usableMinutes)}
                  />
                  <small>
                    {minutes(budget.reserveMinutes)} protected reserve ·{' '}
                    {budget.marginMinutes >= 0
                      ? `${remainingMinutes(budget.marginMinutes)} headroom`
                      : `${Math.ceil(-budget.marginMinutes)} min over budget`}
                  </small>
                </div>
              ))}
            </div>
            <p className="turnaround">
              <strong>
                Latest modeled departure from the destination:{' '}
                {result.latestReturnDepartureMinutes >= 0
                  ? `T+${remainingMinutes(result.latestReturnDepartureMinutes)}`
                  : 'already infeasible'}
                .
              </strong>{' '}
              Measured from leaving base, assuming the full return path and contingency allowance.
              This is a planning threshold, not a live countdown.
            </p>
          </>
        )}
      </section>
      <section className="candidate-comparison">
        <h4>Compare both candidates</h4>
        <div className="site-grid">
          {(['A', 'B'] as const).map((id) => {
            const comparison = evaluatePlan(
              draft.base ? [draft.base, ...draft.routes[id]] : [],
              draft.assumptions,
            );
            return (
              <article key={id}>
                <h4>Candidate {id}</h4>
                {'error' in comparison ? (
                  <p>{comparison.error}</p>
                ) : (
                  <p>
                    {comparison.roundTripKm.toFixed(2)} km round trip ·{' '}
                    {minutes(comparison.plannedMinutes)} ·{' '}
                    {comparison.fitsBudget ? 'Within entered budgets' : 'Over budget'}
                  </p>
                )}
                <button
                  onClick={() => {
                    setActive(id);
                    setMode('inspect');
                  }}
                >
                  Inspect candidate {id}
                </button>
              </article>
            );
          })}
        </div>
      </section>
      <section className="readiness">
        <h4>Unresolved evidence — both candidates</h4>
        <ul>
          <li>
            <strong>Slope and obstacles:</strong> no measured elevation grid, rock clearance or
            surface-bearing assessment is connected. Imagery does not resolve all hazards.
          </li>
          <li>
            <strong>Communications:</strong> no relay geometry, antenna model or terrain
            line-of-sight check.
          </li>
          <li>
            <strong>Lighting and environment:</strong> daylight is a manual time allowance, not a
            Mars illumination, dust or radiation forecast.
          </li>
          <li>
            <strong>Evacuation:</strong> the return retraces the outward path; a blocked passage
            could invalidate it.
          </li>
          <li>
            <strong>Suit and crew limits:</strong> oxygen and battery values are duration
            assumptions, not a physiology or consumption model.
          </li>
        </ul>
        <p>
          <strong>Navigation approval: unavailable.</strong> Unknown evidence remains unresolved
          even when all budget bars fit.
        </p>
      </section>
      <PlanningEvidence missionId={mission.id} />
    </section>
  );
}
