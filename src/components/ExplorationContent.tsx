import { useState } from 'react';
import { media, explorations, type MediaRecord } from '../data/exploration';
function MediaCard({ item }: { item: MediaRecord }) {
  const [failed, setFailed] = useState(false),
    [playing, setPlaying] = useState(false);
  const animation = item.src.endsWith('.gif');
  return (
    <figure className="media-card">
      <div className="media-image">
        {failed ? (
          <p role="status">Image unavailable. Open the original source below.</p>
        ) : animation && !playing ? (
          <div className="animation-cover">
            <img
              src="/media/curiosity-route-still.jpg"
              alt="Still frame of the proposed Mount Sharp route map"
              onError={() => setFailed(true)}
            />
            <button onClick={() => setPlaying(true)}>Play route animation ▷</button>
          </div>
        ) : (
          <>
            <a
              href={item.src}
              target="_blank"
              rel="noreferrer"
              aria-label={`Enlarge ${item.title}`}
            >
              <img src={item.src} alt={item.alt} loading="lazy" onError={() => setFailed(true)} />
            </a>
            {animation && (
              <button className="stop-animation" onClick={() => setPlaying(false)}>
                Stop animation
              </button>
            )}
          </>
        )}
      </div>
      <figcaption>
        <span className="eyebrow">{item.kind}</span>
        <h3>{item.title}</h3>
        <small>{item.date}</small>
        <p>{item.caption}</p>
        <a href={item.source} target="_blank" rel="noreferrer">
          Original source & full detail ↗
        </a>
        <small className="credit">Credit: {item.credit}</small>
      </figcaption>
    </figure>
  );
}
export default function ExplorationContent({
  missionId,
  routesOnly = false,
}: {
  missionId: string;
  routesOnly?: boolean;
}) {
  const items = media[missionId] ?? [];
  if (routesOnly)
    return (
      <section className="exploration-library">
        <h3>Route reference</h3>
        {missionId === 'curiosity' ? (
          <MediaCard item={items[0]} />
        ) : (
          <p>
            The orbital map above provides regional context. A measured, hazard-aware route is not
            connected yet.
          </p>
        )}
      </section>
    );
  return (
    <section className="exploration-library">
      {items.length > 0 && (
        <>
          <div className="library-heading">
            <div>
              <p className="eyebrow">MISSION EVIDENCE</p>
              <h3>Explore the actual landscape.</h3>
            </div>
            <span>{items.length} sourced visuals</span>
          </div>
          <div className={`media-grid ${missionId === 'curiosity' ? 'single' : ''}`}>
            {items.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
      <div className="library-heading">
        <div>
          <p className="eyebrow">EXPLORATION STARTER CATALOG</p>
          <h3>Places with a scientific story.</h3>
        </div>
      </div>
      <div className="site-grid">
        {explorations[missionId]?.map((site, i) => (
          <article key={site.name}>
            <span className="site-index">
              0{i + 1} / {site.focus}
            </span>
            <h4>{site.name}</h4>
            <p>{site.summary}</p>
            <a href={site.source} target="_blank" rel="noreferrer">
              Read the mission evidence ↗
            </a>
          </article>
        ))}
      </div>
      <p className="catalog-note">
        These are documented exploration areas, not navigation waypoints. Precise coordinates and
        terrain validation are still needed before routing to them.
      </p>
    </section>
  );
}
