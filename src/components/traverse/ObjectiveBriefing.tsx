import type { Mission } from '../../types';
import type { Exploration, MediaRecord } from '../../data/exploration';
interface Props {
  mission: Mission;
  objective?: Exploration;
  briefingImage?: MediaRecord;
  objectives: Exploration[];
  objectiveIndex: number;
  setObjectiveIndex: (index: number) => void;
  measured: boolean;
  destinationLabel: string;
  onContinue: () => void;
}
export default function ObjectiveBriefing({
  mission,
  objective,
  briefingImage,
  objectives,
  objectiveIndex,
  setObjectiveIndex,
  measured,
  destinationLabel,
  onContinue,
}: Props) {
  return (
    <>
      <p className="eyebrow">{mission.name.toUpperCase()} / SCIENCE TASK</p>
      <label>
        Exploration objective
        <select
          value={objectiveIndex}
          onChange={(event) => setObjectiveIndex(Number(event.target.value))}
        >
          {objectives.map((item, index) => (
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
          Science source ↗
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
            {briefingImage.title} · {briefingImage.credit}. Regional reference; not assumed to show
            the selected point.{' '}
            <a href={briefingImage.source} target="_blank" rel="noreferrer">
              Source ↗
            </a>
          </figcaption>
        </figure>
      )}
      <h3>Field checklist</h3>
      <ul className="science-checklist">
        <li>Describe visible surface features relevant to the selected objective.</li>
        <li>Record observations and optional photos at simulated positions.</li>
        <li>Document uncertainties and update no-go areas before departure.</li>
      </ul>
      <p className="inline-warning">
        Destination: {destinationLabel}.{' '}
        {measured
          ? 'Published study-site center near the depot, not a sample tube or the exact outcrop named above.'
          : 'Approximate landing location, not a verified science-feature location. Choose a separate base.'}
      </p>
      <button className="primary-action" onClick={onContinue}>
        Plan the route <span>→</span>
      </button>
    </>
  );
}
