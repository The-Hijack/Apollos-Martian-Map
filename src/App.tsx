import { lazy, Suspense, useEffect, useState } from 'react';
import MissionMap from './components/map/MissionMap';
import TraversePlanner from './components/traverse/TraversePlanner';
import ExplorationContent from './components/missions/ExplorationContent';
import { missions, resources } from './data/missions';
import MissionAtlas from './components/missions/MissionAtlas';
import './styles/workflow.css';

const TraverseWorkspace = lazy(() => import('./components/traverse/TraverseWorkspace'));

export default function App() {
  const [screen, setScreen] = useState<'home' | 'explore' | 'library'>('home');
  const [activeMissionId, setActiveMissionId] = useState('perseverance');
  const [visited, setVisited] = useState<string[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [referenceId, setReferenceId] = useState('curiosity');
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [screen]);
  const reference = missions.find((item) => item.id === referenceId)!;
  function begin(missionId = 'perseverance') {
    setActiveMissionId(missionId);
    setVisited((items) => (items.includes(missionId) ? items : [...items, missionId]));
    setScreen('explore');
  }
  return (
    <div className="flight-app">
      <div className="flight-header">
        <button className="wordmark" onClick={() => setScreen('home')} aria-label="Apollos home">
          APOLLOS
        </button>
        <nav aria-label="Main navigation">
          <button
            aria-current={screen === 'home' ? 'page' : undefined}
            onClick={() => setScreen('home')}
          >
            Missions
          </button>
          {visited.length > 0 && (
            <button
              aria-current={screen === 'explore' ? 'page' : undefined}
              onClick={() => setScreen('explore')}
            >
              Your traverse
            </button>
          )}
          <button
            aria-current={screen === 'library' ? 'page' : undefined}
            onClick={() => setScreen('library')}
          >
            Mission library
          </button>
        </nav>
        <span className="prototype-label">Research prototype</span>
      </div>
      {screen === 'home' && <MissionAtlas visited={visited} onBegin={begin} />}
      <Suspense
        fallback={
          <p className="workspace-loading" role="status">
            Loading mission planner…
          </p>
        }
      >
        {missions
          .filter((item) => visited.includes(item.id))
          .map((item) => (
            <div key={item.id} hidden={screen !== 'explore' || activeMissionId !== item.id}>
              <TraverseWorkspace
                mission={item}
                active={screen === 'explore' && activeMissionId === item.id}
              />
            </div>
          ))}
      </Suspense>
      {screen === 'library' && (
        <main className="reference-library">
          <div className="reference-heading">
            <div>
              <p className="eyebrow">SUPPORTING EVIDENCE</p>
              <h1>Mission library</h1>
              <p>Science records, imagery and source data for all eight missions.</p>
            </div>
            <label>
              Mission
              <select value={referenceId} onChange={(event) => setReferenceId(event.target.value)}>
                {missions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.region}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <h2>{reference.region}</h2>
          <p>{reference.description}</p>
          <button className="primary-action" onClick={() => begin(reference.id)}>
            Plan exploration ↗
          </button>
          <MissionMap key={reference.id} mission={reference} />
          <ExplorationContent key={reference.id} missionId={reference.id} />
          <details
            className="library-tool"
            open={manualOpen}
            onToggle={(event) => setManualOpen(event.currentTarget.open)}
          >
            <summary>Compare manual routes</summary>
            <p>
              Draw your own candidates and compare resource assumptions. These paths do not use the
              Jezero terrain-routing model.
            </p>
            {manualOpen && <TraversePlanner key={reference.id} mission={reference} />}
          </details>
          <details className="library-tool">
            <summary>Data sources</summary>
            <div className="source-links">
              {resources.map((resource) => (
                <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer">
                  <strong>{resource.name} ↗</strong>
                  <span>{resource.purpose}</span>
                </a>
              ))}
            </div>
            <p>Worldview is an Earth-only interaction reference, never a Mars hazard input.</p>
          </details>
        </main>
      )}
    </div>
  );
}
