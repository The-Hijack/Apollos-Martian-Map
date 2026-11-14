import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import Projection from 'ol/proj/Projection';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import 'ol/ol.css';
import layers from '../data/trek-layers.json';
import type { Mission } from '../types';
const projection = new Projection({
  code: 'MARS:EQ',
  units: 'degrees',
  extent: [-180, -90, 180, 90],
  metersPerUnit: (3396190 * Math.PI) / 180,
});
// NASA's matrix widths define a 360-degree world; avoid Earth-based scale denominators.
function source(meta: (typeof layers)[number]) {
  const ext = meta.format === 'image/png' ? 'png' : 'jpg';
  return new WMTS({
    url: `https://trek.nasa.gov/tiles/Mars/EQ/${meta.id}/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.${ext}`,
    requestEncoding: 'REST',
    layer: meta.id,
    matrixSet: 'default028mm',
    style: 'default',
    format: meta.format,
    projection,
    wrapX: false,
    attributions: 'Imagery: NASA/JPL Mars Trek · MRO / Viking',
    tileGrid: new WMTSTileGrid({
      origin: meta.origin,
      resolutions: meta.matrixWidths.map((width) => 360 / (width * meta.tileSize)),
      matrixIds: meta.matrixWidths.map((_, z) => String(z)),
      tileSize: meta.tileSize,
      extent: meta.extent,
    }),
  });
}
export default function MissionMap({ mission }: { mission: Mission }) {
  const target = useRef<HTMLDivElement>(null),
    mapRef = useRef<Map | null>(null);
  const hasRegional = mission.id === 'perseverance' || mission.id === 'curiosity';
  const [mode, setMode] = useState<'regional' | 'global'>(hasRegional ? 'regional' : 'global'),
    [status, setStatus] = useState('Loading NASA imagery…'),
    [retry, setRetry] = useState(0);
  const regional = layers[mission.id === 'perseverance' ? 1 : hasRegional ? 2 : 0];
  const label =
    mission.id === 'perseverance' ? 'MRO HiRISE · Jezero mosaic' : 'MRO CTX · Gale mosaic';
  useEffect(() => {
    let disposed = false,
      failed = false;
    setStatus('Loading NASA imagery…');
    const base = source(layers[0]),
      detail = source(regional),
      active = mode === 'regional' ? detail : base;
    active.on('tileloadend', () => {
      if (!disposed && !failed) setStatus('NASA imagery loaded');
    });
    active.on('tileloaderror', () => {
      if (!disposed) {
        failed = true;
        setStatus('Some imagery is unavailable. Retry or switch to global imagery.');
      }
    });
    const timeout = window.setTimeout(() => {
      if (!disposed)
        setStatus((s) =>
          s === 'Loading NASA imagery…'
            ? 'NASA imagery is taking longer to load. Retry or view the source below.'
            : s,
        );
    }, 15000);
    const pin = new Feature(new Point(mission.coordinates));
    pin.setStyle(
      new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: '#f7c175' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
        text: new Text({
          text: 'Approx. rover landing',
          offsetY: -23,
          font: '13px Arial',
          fill: new Fill({ color: '#fff' }),
          stroke: new Stroke({ color: '#1b201b', width: 4 }),
        }),
      }),
    );
    const map = new Map({
      target: target.current!,
      layers: [
        new TileLayer({ source: base }),
        ...(mode === 'regional'
          ? [new TileLayer({ source: detail, extent: regional.extent })]
          : []),
        new VectorLayer({ source: new VectorSource({ features: [pin] }) }),
      ],
      view: new View({
        projection,
        center: mission.coordinates,
        resolution: mode === 'global' ? 0.02 : mission.id === 'perseverance' ? 0.0006 : 0.0025,
        minResolution: 360 / (256 * 2 ** (regional.maxZoom + 1)),
        maxResolution: 0.7,
      }),
    });
    mapRef.current = map;
    return () => {
      disposed = true;
      clearTimeout(timeout);
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, [mission, mode, regional, retry]);
  return (
    <section className="orbital-map" aria-label="Orbital imagery">
      <div className="map-toolbar">
        <div>
          <p className="eyebrow">ORBITAL ATLAS</p>
          <strong>{mode === 'regional' ? label : 'Viking · Global color mosaic'}</strong>
        </div>
        <div className="map-controls">
          <label>
            Imagery{' '}
            <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
              <option value="regional" disabled={!hasRegional}>
                Regional detail
              </option>
              <option value="global">Global color</option>
            </select>
          </label>
          <button
            onClick={() =>
              mapRef.current?.getView().animate({ center: mission.coordinates, duration: 400 })
            }
          >
            Recenter
          </button>
        </div>
      </div>
      <div className="map-frame">
        <div
          ref={target}
          className="map"
          role="region"
          aria-label={`${mission.region} NASA orbital imagery. Drag to pan; use plus and minus to zoom.`}
          tabIndex={0}
        />
        <div className="map-caption">
          <span>◉ {mission.region}</span>
          <span>NASA MARS TREK / NORTH UP</span>
        </div>
      </div>
      <div className="map-status">
        <span role="status">{status}</span>
        <button onClick={() => setRetry((v) => v + 1)}>Reload imagery</button>
        <a href="https://trek.nasa.gov/mars/" target="_blank" rel="noreferrer">
          Open Mars Trek ↗
        </a>
      </div>
      <p className="map-disclaimer">
        Orbital photographs, not a slope or hazard model. Landing marker is approximate. Regional
        mosaics have limited coverage; zoom out or choose Global color for wider context.
      </p>
    </section>
  );
}
