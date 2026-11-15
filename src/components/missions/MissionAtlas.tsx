import { useState } from 'react';
import { missions } from '../../data/missions';
import { media } from '../../data/exploration';
import MissionMap from '../map/MissionMap';

export default function MissionAtlas({
  visited,
  onBegin,
}: {
  visited: string[];
  onBegin: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState('perseverance');
  const mission = missions.find((item) => item.id === selectedId)!;
  const photo = media[selectedId]?.[0];
  const measured = selectedId === 'perseverance';
  return (
    <main className="mission-atlas">
      <div className="atlas-heading">
        <div>
          <p className="eyebrow">MARS / SURFACE OPERATIONS</p>
          <h1>Where will you explore?</h1>
        </div>
        <p>
          Select a mission. Study the evidence.
          <br />
          Plan the journey out—and the return.
        </p>
      </div>
      <div className="atlas-layout">
        <section className="mission-index" aria-label="Choose a mission">
          <div className="index-heading">
            <span>MISSION INDEX</span>
            <span>01—08</span>
          </div>
          {missions.map((item, index) => (
            <button
              key={item.id}
              aria-pressed={item.id === selectedId}
              aria-controls="mission-preview"
              onClick={() => setSelectedId(item.id)}
            >
              <span className="mission-number">{String(index + 1).padStart(2, '0')}</span>
              <span>
                <strong>{item.name}</strong>
                <small>{item.region}</small>
              </span>
              <span className="mission-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </section>
        <section
          id="mission-preview"
          className="mission-preview"
          aria-label={`${mission.name} briefing`}
        >
          {photo ? (
            <figure className="atlas-photo">
              <img
                key={photo.src}
                src={selectedId === 'curiosity' ? '/media/curiosity-route-still.jpg' : photo.src}
                alt={photo.alt}
              />
              <figcaption>
                <span>{photo.title}</span>
                <a href={photo.source} target="_blank" rel="noreferrer">
                  {photo.credit} ↗
                </a>
              </figcaption>
            </figure>
          ) : (
            <div className="atlas-map">
              <MissionMap key={mission.id} mission={mission} />
              <p>Orbital map reference · Explore surface evidence in the mission library.</p>
            </div>
          )}
          <div className="atlas-brief">
            <div className="atlas-location">
              <span className="eyebrow">
                {mission.landingYear} LANDING / {mission.name.toUpperCase()}
              </span>
              <span>
                {Math.abs(mission.coordinates[1]).toFixed(2)}°{' '}
                {mission.coordinates[1] < 0 ? 'S' : 'N'} ·{' '}
                {Math.abs(mission.coordinates[0]).toFixed(2)}°{' '}
                {mission.coordinates[0] < 0 ? 'W' : 'E'}
              </span>
            </div>
            <h2>{mission.region}</h2>
            <p>{mission.description}</p>
            <ul className="atlas-topics">
              {mission.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <div className="atlas-launch">
              <div>
                <strong>{measured ? 'Measured terrain route' : 'Manual route planning'}</strong>
                <small>
                  {measured
                    ? '20 m Jezero grid + entered no-go areas'
                    : 'Entered no-go areas checked; terrain clearance unassessed'}
                </small>
              </div>
              <button className="primary-action" onClick={() => onBegin(mission.id)}>
                {visited.includes(mission.id) ? 'Resume planning' : 'Plan exploration'}{' '}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </section>
      </div>
      <footer className="atlas-footer">
        <span>TEAM APOLLOS</span>
        <p>
          NASA & USGS evidence · Simulated traverses · Research prototype, not approved astronaut
          guidance.
        </p>
      </footer>
    </main>
  );
}
