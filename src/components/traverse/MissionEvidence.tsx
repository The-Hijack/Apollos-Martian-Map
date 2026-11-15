import type { Mission } from '../../types';
import type { TerrainRoute } from '../../planning/navigation.js';
import { hazardEvidence } from '../../data/hazardEvidence';
import terrain from '../../data/jezero-terrain.json';

interface Props {
  mission: Mission;
  measured: boolean;
  route: TerrainRoute | null;
}
export default function MissionEvidence({ mission, measured, route }: Props) {
  const profile = route?.elevations ?? [];
  const minimum = Math.min(...profile),
    maximum = Math.max(...profile);
  const range = Math.max(1, maximum - minimum);
  const profilePoints = profile
    .map(
      (elevation, index) =>
        `${(index / (profile.length - 1)) * 700},${110 - ((elevation - minimum) / range) * 85}`,
    )
    .join(' ');
  return (
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
            Jezero routing uses measured 20 m elevation and derived slope. Unknown cells, over-limit
            slopes and manual exclusions are blocked. Exclusions are inflated by the cell
            half-diagonal to prevent cutting through them. Endpoints snap to cell centers.
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
          No verified local elevation grid is connected for this mission. Manual distances omit
          height changes and unknown terrain detours.
        </p>
      )}
      <p>
        Lighting, radiation, communications, crew capability and alternative evacuation routes
        remain unresolved for all missions.
      </p>
      <a
        href={measured ? 'https://www.hou.usra.edu/meetings/lpsc2023/pdf/2618.pdf' : mission.source}
        target="_blank"
        rel="noreferrer"
      >
        Destination reference ↗
      </a>
      {measured && !!route && (
        <>
          <h4>Maximum modeled cell slope: {route!.maxSlopeDegrees.toFixed(1)}°</h4>
          <svg
            viewBox="0 0 720 140"
            role="img"
            aria-label={`Elevation from ${minimum.toFixed(0)} to ${maximum.toFixed(0)} meters along candidate`}
          >
            <polyline points={profilePoints} fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p>
            Elevation {minimum.toFixed(0)} to {maximum.toFixed(0)} m in the source reference,
            samples ordered from base to destination.
          </p>
        </>
      )}
    </details>
  );
}
