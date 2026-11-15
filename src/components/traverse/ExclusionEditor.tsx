import { useEffect, useState, type FormEvent } from 'react';
import { zoneError, type Exclusion } from '../../planning/exclusions.js';
export default function ExclusionEditor({
  missionId,
  zones,
  center,
  onPick,
  onChange,
  error: storageError,
}: {
  missionId: string;
  zones: Exclusion[];
  center: [number, number];
  onPick: () => void;
  onChange: (zones: Exclusion[]) => boolean;
  error: string;
}) {
  const [longitude, setLongitude] = useState(String(center[0])),
    [latitude, setLatitude] = useState(String(center[1]));
  const [title, setTitle] = useState(''),
    [reason, setReason] = useState(''),
    [radius, setRadius] = useState(100),
    [source, setSource] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    setLongitude(String(center[0]));
    setLatitude(String(center[1]));
  }, [center]);
  function add(event: FormEvent) {
    event.preventDefault();
    const zone: Exclusion = {
      id: crypto.randomUUID(),
      missionId,
      title: title.trim(),
      reason: reason.trim(),
      radiusMeters: radius,
      center: [Number(longitude), Number(latitude)],
      source: source.trim(),
      createdAt: new Date().toISOString(),
      basis: 'manual',
    };
    const problem = zoneError(zone);
    if (problem) {
      setError(problem);
      return;
    }
    if (zones.length >= 30) {
      setError('Maximum 30 exclusions per mission.');
      return;
    }
    if (onChange([...zones, zone])) {
      setTitle('');
      setReason('');
      setSource('');
      setError('');
    }
  }
  return (
    <details className="exclusion-editor">
      <summary>No-go areas · {zones.length}</summary>
      <p>
        Mark an area to avoid and record why. These are user-entered boundaries, not verified NASA
        hazards.
      </p>
      <form onSubmit={add}>
        <button type="button" onClick={onPick}>
          Choose center on map
        </button>
        <label>
          Exclusion longitude
          <input
            required
            type="number"
            min={-180}
            max={180}
            step="any"
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
          />
        </label>
        <label>
          Exclusion latitude
          <input
            required
            type="number"
            min={-85}
            max={85}
            step="any"
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
          />
        </label>
        <label>
          No-go area name
          <input
            required
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Suspected soft soil — needs inspection"
          />
        </label>
        <label>
          Reason / evidence
          <textarea
            required
            maxLength={1000}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <label>
          Exclusion radius (meters)
          <input
            required
            type="number"
            min={5}
            max={2000}
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
          />
        </label>
        <label>
          Evidence URL (optional)
          <input
            type="url"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="https://…"
          />
        </label>
        <button disabled={!!storageError}>Add no-go area</button>
      </form>
      {(error || storageError) && (
        <p role="alert" className="inline-warning">
          {error || storageError}
        </p>
      )}
      {zones.map((zone) => (
        <article className="saved-note" key={zone.id}>
          <strong>{zone.title}</strong>
          <p>{zone.reason}</p>
          <small>
            {zone.radiusMeters} m radius · Manual boundary
            <br />
            {zone.center[1].toFixed(5)}° N / {zone.center[0].toFixed(5)}° E
          </small>
          {zone.source && (
            <p>
              <a href={zone.source} target="_blank" rel="noreferrer">
                Evidence link ↗
              </a>
            </p>
          )}
          <button
            type="button"
            disabled={!!storageError}
            onClick={() => onChange(zones.filter((item) => item.id !== zone.id))}
            aria-label={`Remove exclusion ${zone.title}`}
          >
            Remove exclusion
          </button>
        </article>
      ))}
    </details>
  );
}
