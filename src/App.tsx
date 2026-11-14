import { useState } from 'react';
import MissionMap from './components/MissionMap';
import ExplorationContent from './components/ExplorationContent';
import { missions, resources } from './data/missions';
type Section = 'Overview' | 'Routes' | 'Discoveries' | 'Resources';
export default function App() {
  const [missionId, setMissionId] = useState(missions[0].id),
    [section, setSection] = useState<Section>('Overview');
  const mission = missions.find((m) => m.id === missionId)!;
  return (
    <>
      <header>
        <a href="./" className="brand">
          ◈ <span>APOLLOS</span>
        </a>
        <span className="header-label">MISSION EXPLORATION WORKSPACE</span>
        <span className="badge">MISSION ATLAS / 0.2</span>
      </header>
      <div className="shell">
        <aside className="sidebar">
          <p className="eyebrow">YOUR EXPLORATION AREAS</p>
          <h1>
            Two missions.
            <br />A world to discover.
          </h1>
          <p className="subtle">Choose a mission to open its workspace.</p>
          <nav aria-label="Mission selection">
            {missions.map((m, i) => (
              <button
                key={m.id}
                className={`mission-button ${m.id === missionId ? 'active' : ''}`}
                aria-pressed={m.id === missionId}
                onClick={() => setMissionId(m.id)}
              >
                <span className="mission-number">0{i + 1}</span>
                <span>
                  <strong>{m.name}</strong>
                  <small>{m.region}</small>
                </span>
                <span>↗</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <span className="status-dot" /> Shared foundation
            <p>Mission content, navigation and field discoveries will come together here.</p>
            <span className="subtle">NASA Space Apps · Team Apollos</span>
          </div>
        </aside>
        <main>
          <div className="page-heading">
            <div>
              <p className="eyebrow">MARS / {mission.id.toUpperCase()}</p>
              <h2>{mission.region}</h2>
              <p className="subtle">{mission.name} exploration workspace</p>
            </div>
            <a className="source-button" href={mission.source} target="_blank" rel="noreferrer">
              NASA mission ↗
            </a>
          </div>
          <div className="tabs" aria-label="Workspace sections">
            {(['Overview', 'Routes', 'Discoveries', 'Resources'] as Section[]).map((s) => (
              <button
                key={s}
                aria-pressed={section === s}
                onClick={() => setSection(s)}
                className={section === s ? 'selected' : ''}
              >
                {s}
              </button>
            ))}
          </div>
          <MissionMap key={mission.id} mission={mission} />
          <section className="content" aria-live="polite">
            {section === 'Overview' ? (
              <>
                <div>
                  <p className="eyebrow">MISSION BRIEF</p>
                  <h3>Follow the science.</h3>
                  <p>{mission.description}</p>
                  <div className="chips">
                    {mission.topics.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="facts">
                  <div>
                    <span>LANDING YEAR</span>
                    <strong>{mission.landingYear}</strong>
                  </div>
                  <div>
                    <span>APPROXIMATE LANDING</span>
                    <strong>
                      {Math.abs(mission.coordinates[1])}° {mission.coordinates[1] < 0 ? 'S' : 'N'} /{' '}
                      {mission.coordinates[0]}° E
                    </strong>
                  </div>
                  <p>Explore the sourced images and scientific areas below.</p>
                </div>
              </>
            ) : section === 'Resources' ? (
              <div className="resource-list">
                <p className="eyebrow">PROJECT SOURCE LIBRARY</p>
                <h3>Build from the source.</h3>
                {resources.map((r) => (
                  <a href={r.url} key={r.url} target="_blank" rel="noreferrer">
                    <span>
                      <strong>{r.name}</strong>
                      <small>{r.purpose}</small>
                    </span>
                    <span>↗</span>
                  </a>
                ))}
                <p>
                  Mars Trek supplies the orbital map above. NASA and USGS visuals are included in
                  Overview. Worldview remains an Earth-only interaction reference.
                </p>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">{section === 'Routes' ? '⌁' : '◇'}</span>
                <div>
                  <p className="eyebrow">
                    {section === 'Routes' ? 'TRAVERSE PLANNING' : 'FIELD NOTEBOOK'}
                  </p>
                  <h3>
                    {section === 'Routes'
                      ? 'Every journey needs a plan.'
                      : 'Make room for the next discovery.'}
                  </h3>
                  <p>
                    {section === 'Routes'
                      ? 'This space will connect a selected base and exploration destination with terrain-aware route options.'
                      : 'This space will hold observations, map locations and photos contributed by your team.'}
                  </p>
                  <span className="badge">PLANNED · NOT CONNECTED YET</span>
                </div>
              </div>
            )}
          </section>
          {(section === 'Overview' || section === 'Routes') && (
            <ExplorationContent
              key={mission.id + section}
              missionId={mission.id}
              routesOnly={section === 'Routes'}
            />
          )}
          <footer>
            Planetary coordinates · Mars{' '}
            <span>Research prototype · No validated navigation routes</span>
          </footer>
        </main>
      </div>
    </>
  );
}
