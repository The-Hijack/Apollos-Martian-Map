import { useEffect, useMemo, useRef, useState } from 'react';
import MissionMap from './MissionMap';
import terrain from '../data/jezero-terrain.json';
import {
  terrainRoute,
  positionAt,
  advanceSimulation,
  type SimulationState,
} from '../planning/navigation.js';
import type { Mission } from '../types';
import FieldNotebook from './FieldNotebook';
import { readNotes } from '../planning/journal.js';
import { media, explorations } from '../data/exploration';
import { hazardEvidence } from '../data/hazardEvidence';
import {
  loadZones,
  zonesKey,
  manualRoute,
  routeConflicts,
  type Exclusion,
} from '../planning/exclusions.js';
import ExclusionEditor from './ExclusionEditor';
const initialState = (): SimulationState => ({
  distanceKm: 0,
  elapsedMinutes: 0,
  phase: 'outbound',
  playing: false,
});
const minutes = (value: number) => Math.ceil(Math.max(0, value));
export default function NavigationDemo({
  mission,
  active = true,
}: {
  mission: Mission;
  active?: boolean;
}) {
  const measured = mission.id === 'perseverance';
  const destination: [number, number] = measured ? [77.41359752, 18.45369687] : mission.coordinates;
  const destinationLabel = measured
    ? 'Three Forks study-site center'
    : `${mission.name} landing reference`;
  const [objectiveIndex, setObjectiveIndex] = useState(0);
  const objective = explorations[mission.id]?.[objectiveIndex];
  const briefingImage = media[mission.id]?.[0];
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [addingWaypoint, setAddingWaypoint] = useState(false);
  const [placingZone, setPlacingZone] = useState(false);
  const [zoneCenter, setZoneCenter] = useState<[number, number]>([...mission.coordinates]);
  const [zoneState, setZoneState] = useState(() => {
    try {
      return { zones: loadZones(localStorage, mission.id), error: '' };
    } catch {
      return {
        zones: [] as Exclusion[],
        error:
          'Saved no-go areas could not be loaded. Routing is blocked to avoid losing existing exclusions.',
      };
    }
  });
  function updateZones(zones: Exclusion[]) {
    try {
      localStorage.setItem(zonesKey(mission.id), JSON.stringify(zones));
      setZoneState({ zones, error: '' });
      return true;
    } catch {
      setZoneState((state) => ({
        ...state,
        error:
          'Could not save exclusions. Existing areas are unchanged; routing is blocked until storage is available.',
      }));
      return false;
    }
  }
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(1);
  useEffect(() => {
    if (active) {
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [step, active]);
  const [reviewed, setReviewed] = useState(false);
  const [notebook, setNotebook] = useState(false);
  const [journal, setJournal] = useState(() => {
    try {
      return { notes: readNotes(localStorage, mission.id), error: '' };
    } catch {
      return {
        notes: [] as import('../planning/journal.js').FieldNote[],
        error:
          'Saved notes could not be loaded. Browser storage may be blocked or damaged; existing records have not been overwritten.',
      };
    }
  });
  useEffect(() => {
    if (!active) setSimulation((state) => ({ ...state, playing: false }));
  }, [active]);
  const [base, setBase] = useState<[number, number]>([...mission.coordinates]);
  const [placingBase, setPlacingBase] = useState(false);
  const [baseLongitude, setBaseLongitude] = useState(String(mission.coordinates[0]));
  const [baseLatitude, setBaseLatitude] = useState(String(mission.coordinates[1]));
  useEffect(() => {
    setBaseLongitude(String(base[0]));
    setBaseLatitude(String(base[1]));
  }, [base]);
  useEffect(() => {
    if (placingBase)
      document
        .getElementById(`traverse-map-${mission.id}`)
        ?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, [placingBase]);
  const [maxSlope, setMaxSlope] = useState(10);
  const [speed, setSpeed] = useState(2);
  const [playback, setPlayback] = useState(60);
  const [endurance, setEndurance] = useState(300);
  const [showBlocked, setShowBlocked] = useState(true);
  const [simulation, setSimulation] = useState(initialState);
  const route = useMemo(
    () =>
      zoneState.error
        ? { error: zoneState.error }
        : measured
          ? terrainRoute(terrain, base, [77.41359752, 18.45369687], maxSlope, zoneState.zones)
          : manualRoute(
              [base, ...waypoints, mission.coordinates],
              zoneState.zones,
              mission.coordinates,
            ),
    [base, maxSlope, waypoints, zoneState, measured, mission.coordinates],
  );
  const draftPath: [number, number][] = measured ? [] : [base, ...waypoints, destination];
  const conflicts = !measured ? routeConflicts(draftPath, zoneState.zones) : [];

  const available = !('error' in route);
  useEffect(() => {
    setSimulation(initialState());
    setReviewed(false);
  }, [route]);
  useEffect(() => {
    setReviewed(false);
  }, [speed, endurance, objectiveIndex]);
  useEffect(() => {
    if (!simulation.playing || !available) return;
    let previous = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const deltaMinutes = (Math.min(now - previous, 1000) / 60000) * playback;
      previous = now;
      setSimulation((state) => advanceSimulation(state, route.totalKm, speed, deltaMinutes));
    }, 250);
    return () => clearInterval(interval);
  }, [simulation.playing, available, route, speed, playback]);
  const overlay = useMemo(() => {
    if (!measured) return undefined;
    const canvas = document.createElement('canvas');
    canvas.width = terrain.width;
    canvas.height = terrain.height;
    const context = canvas.getContext('2d')!;
    const pixels = context.createImageData(canvas.width, canvas.height);
    terrain.slopes.forEach((slope, index) => {
      if (slope === null || slope > maxSlope) {
        const offset = index * 4;
        pixels.data[offset] = slope === null ? 150 : 235;
        pixels.data[offset + 1] = slope === null ? 150 : 82;
        pixels.data[offset + 2] = slope === null ? 150 : 65;
        pixels.data[offset + 3] = 125;
      }
    });
    context.putImageData(pixels, 0, 0);
    return {
      url: canvas.toDataURL(),
      extent: [
        terrain.originX / terrain.metersPerDegreeX,
        (terrain.originY - terrain.height * 20) / terrain.metersPerDegreeY,
        (terrain.originX + terrain.width * 20) / terrain.metersPerDegreeX,
        terrain.originY / terrain.metersPerDegreeY,
      ],
    };
  }, [maxSlope, measured]);
  const location = available ? positionAt(route, simulation.distanceKm) : null;
  const remainingKm = available
    ? simulation.phase === 'complete'
      ? 0
      : simulation.phase === 'return'
        ? simulation.distanceKm
        : Math.max(0, route.totalKm - simulation.distanceKm)
    : 0;
  const remainingMinutes = (remainingKm / speed) * 60;
  const reserveMinutes = endurance * 0.25;
  const usableMinutes = endurance - reserveMinutes;
  const returnNowMinutes = (simulation.distanceKm / speed) * 60;
  const returnMargin = usableMinutes - simulation.elapsedMinutes - returnNowMinutes - 30;
  const projectedTotal = available
    ? simulation.elapsedMinutes +
      (simulation.phase !== 'outbound'
        ? returnNowMinutes
        : remainingMinutes + 30 + (route.totalKm / speed) * 60) +
      30
    : 0;
  const coordinate = location?.coordinate;
  const profile = available ? route.elevations : [];
  const minimum = Math.min(...profile),
    maximum = Math.max(...profile),
    range = Math.max(1, maximum - minimum);
  const profilePoints = profile
    .map(
      (elevation, index) =>
        `${(index / (profile.length - 1)) * 700},${110 - ((elevation - minimum) / range) * 85}`,
    )
    .join(' ');
  const roundTripMinutes = available ? (route.totalKm / speed) * 120 + 60 : 0;
  const budgetFits = available && roundTripMinutes <= usableMinutes;
  const headings = [
    'Know your objective',
    'Plan your round trip',
    'Review before departure',
    'Follow your traverse',
  ];
  function goToStep(next: number) {
    setSimulation((state) => ({ ...state, playing: false }));
    setPlacingBase(false);
    setPlacingZone(false);
    setAddingWaypoint(false);
    setNotebook(false);
    setStep(next);
  }
  function startTraverse() {
    if (!available || !reviewed || !budgetFits) return;
    setStep(4);
    setSimulation({ ...initialState(), playing: true });
  }
  function openNotebook() {
    setSimulation((state) => ({ ...state, playing: false }));
    setNotebook(true);
  }

  return (
    <main className="traverse-workspace" data-step={step}>
      <div className="traverse-heading">
        <div>
          <p className="eyebrow">
            {mission.region.toUpperCase()} / {mission.name.toUpperCase()}
          </p>
          <h1 ref={headingRef} tabIndex={-1}>
            {headings[step - 1]}
          </h1>
        </div>
        <span className="simulation-label">Simulation · no live tracking</span>
      </div>
      <nav className="journey-steps" aria-label="Exploration progress">
        {['Objective', 'Plan', 'Review', 'Traverse'].map((label, index) => (
          <button
            key={label}
            aria-current={step === index + 1 ? 'step' : undefined}
            disabled={index + 1 > step}
            onClick={() => goToStep(index + 1)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="traverse-layout">
        <section className="map-column" aria-label="Exploration map and evidence">
          <div className="map-context">
            <strong>{step === 1 ? 'Your exploration area' : `Base → ${destinationLabel}`}</strong>
            <span>
              {available && step > 1
                ? `${route.totalKm.toFixed(2)} km candidate route`
                : 'NASA orbital imagery'}
            </span>
          </div>
          <div className="workflow-map" id={`traverse-map-${mission.id}`}>
            <MissionMap
              mission={mission}
              planPoints={step > 1 ? (available ? route.path : draftPath) : []}
              exclusions={zoneState.zones}
              destinationLabel={destinationLabel}
              routeEndpointsOnly
              simulationPosition={step === 4 ? coordinate : undefined}
              observations={journal.notes}
              terrainOverlay={showBlocked && step > 1 ? overlay : undefined}
              selectionMode={
                placingZone
                  ? 'exclusion'
                  : addingWaypoint
                    ? 'waypoint'
                    : placingBase
                      ? 'base'
                      : 'inspect'
              }
              onCoordinatePick={(point) => {
                if (placingZone) {
                  setZoneCenter(point);
                  setPlacingZone(false);
                } else if (addingWaypoint) {
                  setWaypoints((points) => (points.length < 30 ? [...points, point] : points));
                  setAddingWaypoint(false);
                } else {
                  setBase(point);
                  setPlacingBase(false);
                }
              }}
            />
          </div>
          <div className="map-key">
            <span>
              <i style={{ background: '#f2a17d' }} />
              Manual no-go boundary
            </span>
            <span>
              <i className="key-route" />
              Candidate route
            </span>
            <span>
              <i className="key-blocked" />
              Excluded slope
            </span>
            <span>
              <i className="key-unknown" />
              Unknown terrain
            </span>
            <span>
              <i className="key-note" />
              Field observation
            </span>
          </div>
          {placingBase && (
            <p role="status" className="inline-warning">
              {measured
                ? 'Click inside the measured Jezero window to place a hypothetical base.'
                : 'Click to place a hypothetical base. Use the distance rings and trip budget to judge the journey.'}
            </p>
          )}
          {step > 1 && measured && (
            <div className="map-layer-control">
              <label>
                <input
                  type="checkbox"
                  checked={showBlocked}
                  onChange={(event) => setShowBlocked(event.target.checked)}
                />{' '}
                Show terrain exclusions
              </label>
              <span>20 m cells · Unshaded does not mean safe</span>
            </div>
          )}
          {step === 4 && available && (
            <div className="traverse-readout">
              <div>
                <span>
                  {simulation.phase === 'return' || simulation.phase === 'complete'
                    ? 'Back to base'
                    : 'To destination'}
                </span>
                <strong>
                  {remainingKm.toFixed(2)} <small>km</small>
                </strong>
              </div>
              <div>
                <span>Travel time remaining</span>
                <strong>
                  {minutes(remainingMinutes)} <small>min</small>
                </strong>
              </div>
              <div>
                <span>Elapsed simulation</span>
                <strong>
                  {simulation.elapsedMinutes.toFixed(1)} <small>min</small>
                </strong>
              </div>
              <progress
                aria-label="Distance from base"
                value={simulation.distanceKm}
                max={route.totalKm}
              />
            </div>
          )}
          {!measured && step > 1 && (
            <p className="inline-warning">
              Manual route rehearsal: segments are drawn through your waypoints, checked against
              your exclusions only. Elevation, obstacles and soil are unassessed. Add waypoints to
              detour; no automatic terrain routing is available for this mission.
            </p>
          )}
          {(placingZone || addingWaypoint) && (
            <p role="status" className="inline-warning">
              {placingZone
                ? 'Click the map to choose the exclusion center, then give it a radius and evidence.'
                : 'Click the map to add a detour waypoint before the destination.'}
            </p>
          )}
          <details className="evidence-drawer">
            <summary>Mission evidence, known cautions & data gaps</summary>
            <h3>{mission.name}: evidence to consider</h3>
            {(hazardEvidence[mission.id] ?? []).map((item) => (
              <article key={item.source}>
                <h4>{item.title}</h4>
                <p>{item.detail}</p>
                <a href={item.source} target="_blank" rel="noreferrer">
                  NASA / JPL evidence ↗
                </a>
              </article>
            ))}
            <p>
              Historical reports are not georeferenced obstacle boundaries. No verified rock or soil
              hazard inventory is loaded for this region. Manual exclusions express your planning
              assumptions, not detected hazards.
            </p>
            {measured ? (
              <>
                <p>
                  Jezero routing uses measured 20 m elevation and derived slope. Unknown cells,
                  over-limit slopes and manual exclusions are blocked. Exclusions are inflated by
                  the cell half-diagonal to prevent cutting through them. Endpoints snap to cell
                  centers.
                </p>
                <a href={terrain.source} target="_blank" rel="noreferrer">
                  USGS elevation source ↗
                </a>
                <figure>
                  <img
                    src="/media/jezero-geology.png"
                    alt="USGS geological map of Jezero and Nili Planum"
                  />
                  <figcaption>
                    USGS SIM 3464: geological reference, not an aligned hazard layer.
                  </figcaption>
                </figure>
              </>
            ) : (
              <p>
                No verified local elevation grid is connected for this mission. Manual distances
                omit height changes and unknown terrain detours.
              </p>
            )}
            <p>
              Lighting, radiation, communications, crew capability and alternative evacuation routes
              remain unresolved for all missions.
            </p>
            <a
              href={
                measured
                  ? 'https://www.hou.usra.edu/meetings/lpsc2023/pdf/2618.pdf'
                  : mission.source
              }
              target="_blank"
              rel="noreferrer"
            >
              Destination reference ↗
            </a>
            {measured && available && (
              <>
                <h4>Maximum modeled cell slope: {route.maxSlopeDegrees.toFixed(1)}°</h4>
                <svg
                  viewBox="0 0 720 140"
                  role="img"
                  aria-label={`Elevation from ${minimum.toFixed(0)} to ${maximum.toFixed(0)} meters along candidate`}
                >
                  <polyline
                    points={profilePoints}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <p>
                  Elevation {minimum.toFixed(0)} to {maximum.toFixed(0)} m in the source reference,
                  samples ordered from base to destination.
                </p>
              </>
            )}
          </details>
        </section>
        <aside className="task-panel" aria-label="Current exploration task">
          {notebook ? (
            <>
              <button className="text-action" onClick={() => setNotebook(false)}>
                ← Back to traverse
              </button>
              <FieldNotebook
                missionId={mission.id}
                missionName={mission.name}
                notes={journal.notes}
                onSave={(notes) => setJournal({ notes, error: '' })}
                coordinate={coordinate ?? destination}
                context={
                  simulation.phase === 'arrived'
                    ? `Simulated arrival at ${destinationLabel}`
                    : 'Simulated traverse position'
                }
                storageError={journal.error}
              />
            </>
          ) : (
            <>
              {step === 1 && (
                <>
                  <p className="eyebrow">{mission.name.toUpperCase()} / SCIENCE TASK</p>
                  <label>
                    Exploration objective
                    <select
                      value={objectiveIndex}
                      onChange={(event) => setObjectiveIndex(Number(event.target.value))}
                    >
                      {explorations[mission.id]?.map((item, index) => (
                        <option key={item.name} value={index}>
                          {item.name} · {item.focus}
                        </option>
                      ))}
                    </select>
                  </label>
                  <h2>{objective?.name ?? mission.name}</h2>
                  <p>{objective?.summary ?? mission.description}</p>
                  <p>
                    <a href={objective?.source ?? mission.source} target="_blank" rel="noreferrer">
                      Read the science evidence ↗
                    </a>
                  </p>
                  {briefingImage && (
                    <figure className="brief-image">
                      <img
                        src={
                          briefingImage.src.endsWith('.gif')
                            ? '/media/curiosity-route-still.jpg'
                            : briefingImage.src
                        }
                        alt={briefingImage.alt}
                      />
                      <figcaption>
                        {briefingImage.title} · {briefingImage.credit}. Regional reference; not
                        assumed to show the selected point.{' '}
                        <a href={briefingImage.source} target="_blank" rel="noreferrer">
                          Source ↗
                        </a>
                      </figcaption>
                    </figure>
                  )}
                  <h3>Your field checklist</h3>
                  <ul className="science-checklist">
                    <li>Describe visible surface features relevant to the selected objective.</li>
                    <li>Record observations and optional photos at simulated positions.</li>
                    <li>Document uncertainties and update no-go areas before departure.</li>
                  </ul>
                  <p className="inline-warning">
                    Destination: {destinationLabel}.{' '}
                    {measured
                      ? 'Published study-site center near the depot, not a sample tube or the exact outcrop named above.'
                      : 'Approximate mission landing coordinates; the exact science-feature location is not georeferenced. Choose a separate hypothetical base. This is a regional reconnaissance rehearsal.'}
                  </p>
                  <button className="primary-action" onClick={() => goToStep(2)}>
                    Plan the route <span>→</span>
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <p className="eyebrow">LANDING BASE & TRAVEL</p>
                  <h2>Make the round trip fit.</h2>
                  <p>
                    {measured
                      ? 'The default base is hypothetical, near Perseverance’s landing.'
                      : 'Choose a hypothetical base distinct from this mission’s landing reference. Draw detour waypoints where needed; terrain clearance is not assessed.'}
                  </p>
                  <div className="base-coordinate">
                    {base[1].toFixed(5)}° N · {base[0].toFixed(5)}° E
                  </div>
                  <div className="button-pair">
                    <button
                      onClick={() => {
                        setAddingWaypoint(false);
                        setPlacingZone(false);
                        setPlacingBase(!placingBase);
                      }}
                    >
                      {placingBase ? 'Cancel placement' : 'Choose base on map'}
                    </button>
                    <button
                      onClick={() => {
                        setBase([...mission.coordinates]);
                        setPlacingBase(false);
                      }}
                    >
                      Reset base
                    </button>
                  </div>
                  <details>
                    <summary>Enter base coordinates</summary>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!baseLongitude.trim() || !baseLatitude.trim()) return;
                        const longitude = Number(baseLongitude),
                          latitude = Number(baseLatitude);
                        if (
                          Number.isFinite(longitude) &&
                          Number.isFinite(latitude) &&
                          Math.abs(longitude) <= 180 &&
                          Math.abs(latitude) <= 90
                        ) {
                          setBase([longitude, latitude]);
                          setPlacingBase(false);
                        }
                      }}
                    >
                      <label>
                        Base longitude (east degrees)
                        <input
                          required
                          type="number"
                          min={-180}
                          max={180}
                          step="any"
                          value={baseLongitude}
                          onChange={(event) => setBaseLongitude(event.target.value)}
                        />
                      </label>
                      <label>
                        Base latitude (north degrees)
                        <input
                          required
                          type="number"
                          min={-90}
                          max={90}
                          step="any"
                          value={baseLatitude}
                          onChange={(event) => setBaseLatitude(event.target.value)}
                        />
                      </label>
                      <button type="submit">Apply base coordinates</button>
                    </form>
                  </details>
                  {measured && (
                    <label>
                      Maximum modeled slope
                      <select
                        value={maxSlope}
                        onChange={(event) => setMaxSlope(Number(event.target.value))}
                      >
                        {[5, 10, 15, 20].map((value) => (
                          <option key={value} value={value}>
                            {value}°
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {!measured && (
                    <details open>
                      <summary>Manual path · {waypoints.length} detour waypoints</summary>
                      <p>
                        Start at your base, visit these points in order, then arrive at{' '}
                        {destinationLabel}.
                      </p>
                      <button
                        disabled={waypoints.length >= 30}
                        onClick={() => {
                          setAddingWaypoint(!addingWaypoint);
                          setPlacingBase(false);
                          setPlacingZone(false);
                        }}
                      >
                        {addingWaypoint
                          ? 'Cancel waypoint placement'
                          : 'Add detour waypoint on map'}
                      </button>
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          const data = new FormData(event.currentTarget);
                          const point: [number, number] = [
                            Number(data.get('longitude')),
                            Number(data.get('latitude')),
                          ];
                          if (waypoints.length < 30) {
                            setWaypoints((points) => [...points, point]);
                            event.currentTarget.reset();
                          }
                        }}
                      >
                        <label>
                          Waypoint longitude
                          <input
                            name="longitude"
                            type="number"
                            required
                            min={-180}
                            max={180}
                            step="any"
                          />
                        </label>
                        <label>
                          Waypoint latitude
                          <input
                            name="latitude"
                            type="number"
                            required
                            min={-85}
                            max={85}
                            step="any"
                          />
                        </label>
                        <button disabled={waypoints.length >= 30}>Add detour coordinates</button>
                      </form>
                      {waypoints.map((point, index) => (
                        <p key={index}>
                          Point {index + 1}: {point[1].toFixed(5)}° N / {point[0].toFixed(5)}° E{' '}
                          <button
                            aria-label={`Remove waypoint ${index + 1}`}
                            onClick={() =>
                              setWaypoints((points) =>
                                points.filter((_, position) => position !== index),
                              )
                            }
                          >
                            Remove
                          </button>
                        </p>
                      ))}
                    </details>
                  )}
                  <ExclusionEditor
                    missionId={mission.id}
                    zones={zoneState.zones}
                    center={zoneCenter}
                    onPick={() => {
                      setPlacingZone(!placingZone);
                      setPlacingBase(false);
                      setAddingWaypoint(false);
                    }}
                    onChange={updateZones}
                    error={zoneState.error}
                  />
                  <label>
                    Assumed walking speed
                    <select
                      value={speed}
                      onChange={(event) => setSpeed(Number(event.target.value))}
                    >
                      {[0.5, 1, 2, 3].map((value) => (
                        <option key={value} value={value}>
                          {value} km/h
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Limiting endurance
                    <select
                      value={endurance}
                      onChange={(event) => setEndurance(Number(event.target.value))}
                    >
                      {[180, 300, 420].map((value) => (
                        <option key={value} value={value}>
                          {value} minutes
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="muted">
                    Editable demonstration assumptions, not spacesuit specifications. We reserve 25%
                    of endurance, plus 30 minutes contingency and a 30-minute science stop.
                  </p>
                  {available ? (
                    <div className="compact-budget">
                      <span>
                        Round trip + science + contingency
                        <strong>{minutes(roundTripMinutes)} min</strong>
                      </span>
                      <span>
                        Available after reserve<strong>{usableMinutes} min</strong>
                      </span>
                      <p className={!budgetFits ? 'inline-warning' : ''}>
                        {budgetFits
                          ? 'The modeled trip fits this time budget. Terrain safety remains unresolved.'
                          : 'This trip exceeds the entered budget. Adjust the plan before starting.'}
                      </p>
                    </div>
                  ) : (
                    <p role="alert" className="inline-warning">
                      {route.error}
                    </p>
                  )}
                  <button
                    className="primary-action"
                    disabled={!available || placingBase}
                    onClick={() => goToStep(3)}
                  >
                    Review the plan <span>→</span>
                  </button>
                </>
              )}
              {step === 3 && (
                <>
                  <p className="eyebrow">PRE-DEPARTURE REVIEW</p>
                  <h2>A route is only part of the decision.</h2>
                  <dl className="review-summary">
                    <div>
                      <dt>Destination</dt>
                      <dd>{destinationLabel}</dd>
                    </div>
                    <div>
                      <dt>Outward distance</dt>
                      <dd>{available ? route.totalKm.toFixed(2) : '—'} km</dd>
                    </div>
                    <div>
                      <dt>Round trip + science + contingency</dt>
                      <dd>{minutes(roundTripMinutes)} min</dd>
                    </div>
                    <div>
                      <dt>Protected reserve</dt>
                      <dd>{reserveMinutes} min</dd>
                    </div>
                    <div>
                      <dt>Remaining budget margin</dt>
                      <dd>{Math.floor(usableMinutes - roundTripMinutes)} min</dd>
                    </div>
                  </dl>
                  <div className="exclusion-assessment">
                    <h3>No-go area assessment</h3>
                    <p>
                      {zoneState.zones.length} manual exclusions ·{' '}
                      {available
                        ? 'candidate does not intersect the entered areas'
                        : 'no acceptable candidate available'}
                      .
                    </p>
                    {conflicts.map((zone) => (
                      <p key={zone.id}>{zone.title}: intersects candidate</p>
                    ))}
                    <p>
                      No other rocks, dunes or unstable soil are ruled out. The return uses the same
                      path.
                    </p>
                    <button
                      onClick={() => {
                        const blob = new Blob(
                          [
                            JSON.stringify(
                              {
                                mission: mission.id,
                                objective: objective?.name,
                                destination: destinationLabel,
                                base,
                                route: available ? route.path : null,
                                routeModel: measured
                                  ? 'measured-jezero-dem'
                                  : 'manual-unassessed-terrain',
                                exclusions: zoneState.zones,
                                assumptions: {
                                  speedKmh: speed,
                                  enduranceMinutes: endurance,
                                  reservePercent: 25,
                                  scienceMinutes: 30,
                                  contingencyMinutes: 30,
                                },
                                unresolved: [
                                  'rocks',
                                  'soil strength',
                                  'lighting',
                                  'radiation',
                                  'communications',
                                  'evacuation alternatives',
                                ],
                                evidence: hazardEvidence[mission.id] ?? [],
                              },
                              null,
                              2,
                            ),
                          ],
                          { type: 'application/json' },
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `apollos-${mission.id}-route-review.json`;
                        a.click();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}
                    >
                      Export route review
                    </button>
                  </div>
                  <div className="review-known">
                    <h3>Modeled</h3>
                    <p>
                      {measured
                        ? 'Measured elevation, slope exclusions, manual no-go areas, travel time and retracing the route.'
                        : 'Manual route geometry, intersections with entered no-go areas, travel time and retracing the route. Slopes are not modeled.'}
                    </p>
                  </div>
                  <div className="review-unknown">
                    <h3>Unresolved</h3>
                    <p>
                      Rock clearance, soil bearing strength, light, radiation, communications and
                      real crew limits.
                    </p>
                  </div>
                  {!budgetFits && (
                    <p role="alert" className="inline-warning">
                      The destination plan exceeds the entered budget. Return to Plan and revise it.
                    </p>
                  )}
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={reviewed}
                      onChange={(event) => setReviewed(event.target.checked)}
                    />
                    I understand this uses simulated movement and demonstration limits, not
                    operational clearance.
                  </label>
                  <button
                    className="primary-action"
                    disabled={!reviewed || !budgetFits}
                    onClick={startTraverse}
                  >
                    Start simulation <span>→</span>
                  </button>
                  <button className="text-action" onClick={() => goToStep(2)}>
                    ← Adjust the plan
                  </button>
                </>
              )}
              {step === 4 && available && (
                <>
                  <p className="eyebrow">
                    {simulation.phase === 'return'
                      ? 'RETURNING TO BASE'
                      : simulation.phase === 'complete'
                        ? 'TRAVERSE COMPLETE'
                        : 'FIELD SIMULATION'}
                  </p>
                  <h2>
                    {simulation.phase === 'arrived'
                      ? 'You reached the study site.'
                      : simulation.phase === 'complete'
                        ? 'Back at base.'
                        : simulation.phase === 'return'
                          ? 'Follow the route home.'
                          : `Next: ${destinationLabel}`}
                  </h2>
                  <p role="status">
                    {simulation.phase === 'arrived'
                      ? 'The clock is paused. Record observations, account for your science stop, then return.'
                      : simulation.phase === 'complete'
                        ? 'Review your observations and export the field notebook.'
                        : simulation.playing
                          ? 'Simulated movement is running.'
                          : 'Paused. Position and elapsed time are frozen.'}
                  </p>
                  <div className={`return-assessment ${returnMargin < 0 ? 'over' : ''}`}>
                    <span>Return budget headroom</span>
                    <strong>
                      {Math.floor(returnMargin)} <small>min</small>
                    </strong>
                    <p>
                      {returnMargin < 0
                        ? 'Entered reserves cannot be preserved at the current speed.'
                        : projectedTotal > usableMinutes
                          ? 'Continuing to the destination exceeds the budget. Return earlier.'
                          : 'Includes retracing the path, contingency and protected reserve. This is not a safety clearance.'}
                    </p>
                  </div>
                  <button
                    className="return-button"
                    disabled={simulation.distanceKm <= 0 || simulation.phase === 'complete'}
                    onClick={() =>
                      setSimulation((state) => ({ ...state, phase: 'return', playing: true }))
                    }
                  >
                    Return to base ↩
                  </button>
                  {simulation.phase !== 'arrived' && simulation.phase !== 'complete' && (
                    <button
                      onClick={() =>
                        setSimulation((state) => ({ ...state, playing: !state.playing }))
                      }
                    >
                      {simulation.playing ? 'Pause simulation' : 'Resume simulation'}
                    </button>
                  )}
                  <button className="primary-action" onClick={openNotebook}>
                    {simulation.phase === 'complete'
                      ? 'Open field notebook'
                      : 'Record an observation'}{' '}
                    <span>＋</span>
                  </button>
                  {simulation.phase === 'arrived' && (
                    <button
                      onClick={() =>
                        setSimulation((state) => ({
                          ...state,
                          elapsedMinutes: state.elapsedMinutes + 30,
                        }))
                      }
                    >
                      Add 30-minute science stop
                    </button>
                  )}
                  <p className="muted">
                    Simulated position: {coordinate?.[1].toFixed(5)}° N ·{' '}
                    {coordinate?.[0].toFixed(5)}° E<br />
                    {journal.notes.length} saved field observations
                  </p>
                  <details>
                    <summary>Simulation settings</summary>
                    <label>
                      Assumed walking speed
                      <select
                        value={speed}
                        onChange={(event) => setSpeed(Number(event.target.value))}
                      >
                        {[0.5, 1, 2, 3].map((value) => (
                          <option key={value} value={value}>
                            {value} km/h
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Playback speed
                      <select
                        value={playback}
                        onChange={(event) => setPlayback(Number(event.target.value))}
                      >
                        {[1, 30, 60, 120].map((value) => (
                          <option key={value} value={value}>
                            {value}× clock
                          </option>
                        ))}
                      </select>
                    </label>
                    <p>Pausing freezes the clock. A science stop adds time explicitly.</p>
                  </details>
                  <button
                    className="text-action"
                    onClick={() => {
                      setSimulation(initialState());
                      setReviewed(false);
                      goToStep(2);
                    }}
                  >
                    Start a new plan
                  </button>
                </>
              )}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
