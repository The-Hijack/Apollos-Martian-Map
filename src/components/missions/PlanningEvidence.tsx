import { useState } from 'react';
import ExplorationContent from './ExplorationContent';
const worldviewUrl = 'https://worldview.earthdata.nasa.gov/';
export default function PlanningEvidence({ missionId }: { missionId: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <section className="planning-evidence">
      <h3>Evidence behind the plan</h3>
      <p>
        All five supplied resources have a defined role. Their limitations travel with the exported
        brief.
      </p>
      <div className="source-roles">
        <article>
          <h4>JPL Mars Trek</h4>
          <p>
            The live orbital map supports visual inspection and point placement. Elevation and slope
            analysis must still be verified against a suitable measured dataset.
          </p>
          <a href="https://trek.nasa.gov/mars/" target="_blank" rel="noreferrer">
            Inspect terrain with Mars Trek ↗
          </a>
        </article>
        <article>
          <h4>USGS geological mapping</h4>
          <p>
            The Jezero geology sheet documents regional units. Geological classifications are
            context, not a soil-strength or walkability measurement. Gale requires a separately
            matched regional geological layer.
          </p>
          <a
            href="https://astrogeology-usgs.hub.arcgis.com/pages/interactive-maps-mars"
            target="_blank"
            rel="noreferrer"
          >
            Inspect the USGS map collection ↗
          </a>
        </article>
        <article>
          <h4>Curiosity’s proposed Mount Sharp route</h4>
          <p>
            The 2019 proposal helps explain science destinations and route presentation. It is not
            imported as an approved astronaut route.
          </p>
          <a
            href="https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/"
            target="_blank"
            rel="noreferrer"
          >
            Read the historical route reference ↗
          </a>
        </article>
        <article>
          <h4>Perseverance raw images</h4>
          <p>
            Surface photographs support a science briefing. A photograph without verified location,
            scale and viewing direction cannot establish clearance along a path.
          </p>
          <a
            href="https://mars.nasa.gov/mars2020/multimedia/raw-images/"
            target="_blank"
            rel="noreferrer"
          >
            Inspect rover photographs ↗
          </a>
        </article>
      </div>
      <details className="earth-reference">
        <summary>NASA Worldview — Earth-only observation reference</summary>
        <p>
          Worldview demonstrates dated satellite observations and cloud coverage. This reference
          image uses the same NASA GIBS imagery service. Earth observations are deliberately
          excluded from Mars budget and hazard calculations.
        </p>
        {failed ? (
          <p>Earth reference unavailable. Open Worldview below.</p>
        ) : (
          <img
            src="/media/worldview-earth-reference.jpg"
            alt="Earth satellite reference: MODIS Terra true-color global mosaic for 9 July 2012, not Mars"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
        <p>
          Earth · MODIS Terra corrected reflectance, true color · 9 July 2012 · Credit: NASA EOSDIS
          GIBS. Gaps and clouds do not represent Mars conditions.
        </p>
        <a href={worldviewUrl} target="_blank" rel="noreferrer">
          Explore dated Earth observations in Worldview ↗
        </a>
      </details>
      <details className="briefing-library">
        <summary>Open the mission imagery and geological briefing</summary>
        <ExplorationContent missionId={missionId} />
      </details>
    </section>
  );
}
