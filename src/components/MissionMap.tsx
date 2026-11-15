import { zonePolygon, type Exclusion } from '../planning/exclusions.js';
import { marsDistanceKm, MARS_RADIUS_KM, marsScalePixels } from '../planning/calculations.js';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import LineString from 'ol/geom/LineString';
import { createDistanceGuides } from './distanceGuides';
import type Geometry from 'ol/geom/Geometry';
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
import Polygon from 'ol/geom/Polygon';
import Select from 'ol/interaction/Select';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import 'ol/ol.css';
import layers from '../data/trek-layers.json';
import { media } from '../data/exploration';
import { pointsOfInterest, type PointOfInterest } from '../data/pointsOfInterest';
import type { Mission } from '../types';
const regionalExperiences: Record<
  string,
  { layerId: string; label: string; heading: string; summary: string }
> = {
  perseverance: {
    layerId: 'JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd',
    label: 'MRO HiRISE · Jezero mosaic',
    heading: 'Jezero crater and delta',
    summary: 'High-resolution surface imagery for the landing region and ancient river delta.',
  },
  curiosity: {
    layerId: 'Gale_CTX_BlockAdj_dd',
    label: 'MRO CTX · Gale mosaic',
    heading: 'Gale crater',
    summary: 'Orbital context for Curiosity’s traverse across Gale crater and Mount Sharp.',
  },
  pathfinder: {
    layerId: 'sojourner_hirise_mosaic',
    label: 'MRO HiRISE · Sojourner site mosaic',
    heading: 'Ares Vallis floodplain',
    summary:
      'Explore the HiRISE mosaic around the Pathfinder landing site. The Dice and Yogi are mission image targets; they are not plotted separately because their exact coordinates are not georeferenced here.',
  },
  phoenix: {
    layerId: 'phoenix_hirise_mosaic',
    label: 'MRO HiRISE · Phoenix site mosaic',
    heading: 'Vastitas Borealis · Northern plains',
    summary:
      'Explore the HiRISE mosaic around the Phoenix lander. Trench images show ice exposed by the lander and are kept in the image gallery rather than placed at an unverified map coordinate.',
  },
};
const noPointsOfInterest: PointOfInterest[] = [];
const projection = new Projection({
  code: 'MARS:EQ',
  units: 'degrees',
  extent: [-180, -90, 180, 90],
  metersPerUnit: (MARS_RADIUS_KM * 1000 * Math.PI) / 180,
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
interface MapProps {
  mission: Mission;
  exclusions?: Exclusion[];
  destinationLabel?: string;
  observations?: { id: string; title: string; coordinates: [number, number] }[];
  routeEndpointsOnly?: boolean;
  simulationPosition?: [number, number];
  terrainOverlay?: { url: string; extent: number[] };
  planPoints?: [number, number][];
  onCoordinatePick?: (coordinate: [number, number]) => void;
  selectionMode?: 'inspect' | 'base' | 'waypoint' | 'exclusion';
}
export default function MissionMap({
  mission,
  exclusions,
  destinationLabel = 'Science destination',
  observations,
  routeEndpointsOnly = false,
  simulationPosition,
  terrainOverlay,
  planPoints,
  onCoordinatePick,
  selectionMode = 'inspect',
}: MapProps) {
  const [showDistances, setShowDistances] = useState(true);
  const [scale, setScale] = useState({ width: 100, label: '' });
  const [guideExtent, setGuideExtent] = useState<number[]>([]);
  const [guideSpacing, setGuideSpacing] = useState(1);
  const [guideDensity, setGuideDensity] = useState('standard');
  const distanceSource = useRef(new VectorSource<Feature<Geometry>>());
  const distanceLayer = useRef(new VectorLayer({ source: distanceSource.current }));
  const exclusionSource = useRef(new VectorSource<Feature<Geometry>>());
  const observationSource = useRef(new VectorSource<Feature<Geometry>>());
  const simulationSource = useRef(new VectorSource<Feature<Geometry>>());
  const terrainLayer = useRef(new ImageLayer({ opacity: 0.8 }));
  const routeSource = useRef(new VectorSource<Feature<Geometry>>());
  const pickHandler = useRef(onCoordinatePick);
  const actionMode = useRef(selectionMode);
  useEffect(() => {
    pickHandler.current = onCoordinatePick;
    actionMode.current = selectionMode;
  }, [onCoordinatePick, selectionMode]);
  const target = useRef<HTMLDivElement>(null),
    mapRef = useRef<Map | null>(null),
    selectRef = useRef<Select | null>(null),
    poiSourceRef = useRef<VectorSource | null>(null);
  const experience = regionalExperiences[mission.id];
  const regional = layers.find((layer) => layer.id === experience?.layerId) ?? null;
  const pois = pointsOfInterest[mission.id] ?? noPointsOfInterest;
  const [mode, setMode] = useState<'regional' | 'global'>(regional ? 'regional' : 'global'),
    [status, setStatus] = useState('Loading NASA imagery…'),
    [retry, setRetry] = useState(0),
    [selectedPoiId, setSelectedPoiId] = useState<string | null>(pois[0]?.id ?? null);
  const selectedPoi = pois.find((poi) => poi.id === selectedPoiId) ?? null;
  const selectedMedia = selectedPoi
    ? (media[mission.id] ?? []).find((item) => item.id === selectedPoi.mediaId)
    : null;
  const showRegional = mode === 'regional' && regional !== null;
  useEffect(() => {
    let disposed = false,
      failed = false;
    setStatus('Loading NASA imagery…');
    const base = source(layers[0]);
    const detail = regional ? source(regional) : null;
    const active = showRegional && detail ? detail : base;
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
    const poiFeatures = pois.length
      ? pois.map((poi) => {
          const feature = new Feature(new Point(poi.coordinates));
          feature.set('poiId', poi.id);
          feature.set('label', poi.title.toUpperCase());
          feature.setStyle(
            new Style({
              image: new Circle({
                radius: 8,
                fill: new Fill({ color: '#f4a261' }),
                stroke: new Stroke({ color: '#fff2dc', width: 2 }),
              }),
              text: new Text({
                text: poi.title.toUpperCase(),
                offsetY: -27,
                font: 'bold 11px Arial',
                fill: new Fill({ color: '#fff7e9' }),
                stroke: new Stroke({ color: '#151812', width: 4 }),
              }),
            }),
          );
          return feature;
        })
      : (() => {
          const feature = new Feature(new Point(mission.coordinates));
          feature.setStyle(
            new Style({
              image: new Circle({
                radius: 7,
                fill: new Fill({ color: '#f4a261' }),
                stroke: new Stroke({ color: '#fff2dc', width: 2 }),
              }),
              text: new Text({
                text: `${mission.name.toUpperCase()} · APPROX.`,
                offsetY: -25,
                font: 'bold 11px Arial',
                fill: new Fill({ color: '#fff7e9' }),
                stroke: new Stroke({ color: '#151812', width: 4 }),
              }),
            }),
          );
          return [feature];
        })();
    const coverage = regional
      ? new Feature(
          new Polygon([
            [
              [regional.extent[0], regional.extent[1]],
              [regional.extent[2], regional.extent[1]],
              [regional.extent[2], regional.extent[3]],
              [regional.extent[0], regional.extent[3]],
              [regional.extent[0], regional.extent[1]],
            ],
          ]),
        )
      : null;
    if (coverage) {
      coverage.set('featureType', 'coverage');
      coverage.setStyle(
        new Style({
          fill: new Fill({ color: 'rgba(244, 162, 97, 0.07)' }),
          stroke: new Stroke({ color: 'rgba(255, 214, 160, 0.9)', width: 1.5, lineDash: [7, 5] }),
        }),
      );
    }
    const poiSource = new VectorSource({ features: poiFeatures });
    const poiLayer = new VectorLayer({ source: poiSource });
    const coverageLayer = coverage
      ? new VectorLayer({ source: new VectorSource({ features: [coverage] }) })
      : null;
    const view = new View({
      projection,
      enableRotation: false,
      center: mission.coordinates,
      resolution: showRegional ? (mission.id === 'perseverance' ? 0.0006 : 0.0025) : 0.02,
      minResolution:
        360 / (256 * 2 ** (showRegional && regional ? regional.maxZoom : layers[0].maxZoom)),
      maxResolution: 0.7,
    });
    const map = new Map({
      target: target.current!,
      layers: [
        new TileLayer({ source: base }),
        ...(showRegional && detail && regional
          ? [new TileLayer({ source: detail, extent: regional.extent })]
          : []),
        ...(coverageLayer ? [coverageLayer] : []),
        poiLayer,
        terrainLayer.current,
        distanceLayer.current,
        new VectorLayer({ source: exclusionSource.current }),
        new VectorLayer({ source: observationSource.current }),
        new VectorLayer({ source: routeSource.current }),
        new VectorLayer({ source: simulationSource.current }),
      ],
      view,
    });
    mapRef.current = map;
    const updateScale = () => {
      const size = map.getSize();
      if (!size) return;
      setGuideExtent(view.calculateExtent(size));
      const y = size[1] / 2,
        x = size[0] / 2;
      const a = map.getCoordinateFromPixel([x - 50, y]);
      const b = map.getCoordinateFromPixel([x + 50, y]);
      if (!a || !b || Math.abs(a[1]) > 90 || Math.abs(b[1]) > 90) return;
      const wrap = (n: number) => ((n + 540) % 360) - 180;
      const km = marsDistanceKm([wrap(a[0]), a[1]], [wrap(b[0]), b[1]]);
      if (!km) return;
      const power = 10 ** Math.floor(Math.log10(km));
      const nice = [1, 2, 5].reverse().find((n) => n * power <= km)! * power;
      const width = marsScalePixels(nice, a[1], Math.abs(b[0] - a[0]) / 100);
      if (width === null) return;
      setScale({
        width,
        label:
          nice < 1 ? `${Number((nice * 1000).toPrecision(3))} m` : `${nice.toLocaleString()} km`,
      });
    };
    map.on('moveend', updateScale);
    map.on('change:size', updateScale);
    updateScale();
    map.on('singleclick', (event) => {
      if (actionMode.current !== 'inspect')
        pickHandler.current?.([event.coordinate[0], event.coordinate[1]]);
    });
    poiSourceRef.current = poiSource;
    const selection = new Select({
      layers: [poiLayer],
      hitTolerance: 12,
      condition: () => actionMode.current === 'inspect',
      style: (feature) =>
        new Style({
          image: new Circle({
            radius: 11,
            fill: new Fill({ color: '#ffe3af' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
          }),
          text: new Text({
            text: String(feature.get('label') ?? ''),
            offsetY: -30,
            font: 'bold 11px Arial',
            fill: new Fill({ color: '#fff7e9' }),
            stroke: new Stroke({ color: '#151812', width: 4 }),
          }),
        }),
    });
    selection.on('select', (event) => {
      const feature = event.selected[0];
      const poiId = feature?.get('poiId');
      setSelectedPoiId(typeof poiId === 'string' ? poiId : null);
    });
    map.addInteraction(selection);
    selectRef.current = selection;
    const selectedFeature = poiSource
      .getFeatures()
      .find((feature) => feature.get('poiId') === selectedPoiId);
    if (selectedFeature) selection.getFeatures().push(selectedFeature);
    map.on('pointermove', (event) => {
      const element = map.getTargetElement();
      if (element) {
        element.style.cursor = map.hasFeatureAtPixel(event.pixel, {
          layerFilter: (layer) => layer === poiLayer,
        })
          ? 'pointer'
          : '';
      }
    });
    const fitFrame = window.requestAnimationFrame(() => {
      map.updateSize();
      const size = map.getSize();
      if (routeSource.current.getFeatures().length > 1 && size) {
        view.fit(routeSource.current.getExtent()!, {
          size,
          padding: [65, 65, 65, 65],
          maxZoom: 18,
        });
      } else if (showRegional && regional && size) {
        view.fit(regional.extent, { size, padding: [58, 58, 58, 58] });
      }
    });
    return () => {
      disposed = true;
      window.cancelAnimationFrame(fitFrame);
      clearTimeout(timeout);
      map.setTarget(undefined);
      mapRef.current = null;
      selectRef.current = null;
      poiSourceRef.current = null;
    };
  }, [mission, mode, regional, retry, showRegional, pois]);
  useEffect(() => {
    routeSource.current.clear();
    if (!planPoints?.length) return;
    if (planPoints.length > 1) {
      const line = new Feature(new LineString(planPoints));
      line.setStyle(
        new Style({ stroke: new Stroke({ color: '#f3bd77', width: 3, lineDash: [8, 6] }) }),
      );
      routeSource.current.addFeature(line);
    }
    planPoints.forEach((coordinate, index) => {
      if (routeEndpointsOnly && index !== 0 && index !== planPoints.length - 1) return;
      const point = new Feature(new Point(coordinate));
      point.setStyle(
        new Style({
          image: new Circle({
            radius: 7,
            fill: new Fill({ color: index === 0 ? '#88cde3' : '#f3bd77' }),
            stroke: new Stroke({ color: '#18221a', width: 2 }),
          }),
          text: new Text({
            text:
              index === 0
                ? 'Hypothetical base'
                : routeEndpointsOnly
                  ? destinationLabel
                  : `Waypoint ${index}`,
            offsetY: 19,
            font: '12px Arial',
            fill: new Fill({ color: '#fff' }),
            stroke: new Stroke({ color: '#142018', width: 4 }),
          }),
        }),
      );
      routeSource.current.addFeature(point);
    });
  }, [planPoints, routeEndpointsOnly, destinationLabel]);
  useEffect(() => {
    simulationSource.current.clear();
    if (!simulationPosition) return;
    const astronaut = new Feature(new Point(simulationPosition));
    astronaut.setStyle(
      new Style({
        image: new Circle({
          radius: 9,
          fill: new Fill({ color: '#63d8ff' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
        }),
        text: new Text({
          text: 'SIMULATED POSITION',
          offsetY: -25,
          font: 'bold 11px Arial',
          fill: new Fill({ color: '#fff' }),
          stroke: new Stroke({ color: '#132018', width: 4 }),
        }),
      }),
    );
    simulationSource.current.addFeature(astronaut);
  }, [simulationPosition]);
  useEffect(() => {
    terrainLayer.current.setSource(
      terrainOverlay
        ? new ImageStatic({
            url: terrainOverlay.url,
            imageExtent: terrainOverlay.extent,
            projection,
            interpolate: false,
          })
        : null,
    );
  }, [terrainOverlay]);
  useEffect(() => {
    observationSource.current.clear();
    observations?.forEach((note, index) => {
      const feature = new Feature(new Point(note.coordinates));
      feature.setStyle(
        new Style({
          image: new Circle({
            radius: 7,
            fill: new Fill({ color: '#c6dfa4' }),
            stroke: new Stroke({ color: '#172017', width: 2 }),
          }),
          text: new Text({
            text: `Note ${observations.length - index}`,
            offsetY: 23,
            fill: new Fill({ color: '#e9eddf' }),
            stroke: new Stroke({ color: '#172017', width: 3 }),
          }),
        }),
      );
      observationSource.current.addFeature(feature);
    });
  }, [observations]);
  useEffect(() => {
    const extent = routeSource.current.getExtent();
    if (routeEndpointsOnly && planPoints && planPoints.length > 1 && extent) {
      mapRef.current?.getView().fit(extent, { padding: [65, 65, 65, 65], duration: 0 });
    }
  }, [planPoints, routeEndpointsOnly, destinationLabel]);
  useEffect(() => {
    exclusionSource.current.clear();
    exclusions?.forEach((zone) => {
      const feature = new Feature(new Polygon([zonePolygon(zone)]));
      feature.setStyle(
        new Style({
          fill: new Fill({ color: 'rgba(224,95,64,0.25)' }),
          stroke: new Stroke({ color: '#f2a17d', width: 2, lineDash: [5, 4] }),
          text: new Text({
            text: zone.title,
            fill: new Fill({ color: '#fff3de' }),
            stroke: new Stroke({ color: '#172017', width: 3 }),
          }),
        }),
      );
      exclusionSource.current.addFeature(feature);
    });
  }, [exclusions]);
  useEffect(() => {
    distanceLayer.current.setVisible(showDistances);
    distanceSource.current.clear();
    const origin = planPoints?.[0] ?? mission.coordinates;
    const { features, spacing } = createDistanceGuides(origin, guideExtent, guideDensity);
    setGuideSpacing(spacing);
    distanceSource.current.addFeatures(features);
  }, [mission.coordinates, planPoints, showDistances, guideExtent, guideDensity]);
  const choosePoi = (poiId: string) => {
    const feature = poiSourceRef.current
      ?.getFeatures()
      .find((candidate) => candidate.get('poiId') === poiId);
    if (!feature) return;
    selectRef.current?.getFeatures().clear();
    selectRef.current?.getFeatures().push(feature);
    setSelectedPoiId(poiId);
    const coordinates = (feature.getGeometry() as Point).getCoordinates();
    mapRef.current?.getView().animate({ center: coordinates, duration: 400 });
  };
  return (
    <section className="orbital-map" aria-label="Orbital imagery">
      <div className="map-toolbar">
        <div>
          <p className="eyebrow">ORBITAL ATLAS</p>
          <strong>{showRegional ? experience?.label : 'Viking · Global color mosaic'}</strong>
        </div>
        <div className="map-controls">
          <label>
            <input
              type="checkbox"
              checked={showDistances}
              onChange={(event) => setShowDistances(event.target.checked)}
            />{' '}
            Distance rings
          </label>
          {showDistances && (
            <label>
              Spacing{' '}
              <select
                value={guideDensity}
                onChange={(event) => setGuideDensity(event.target.value)}
              >
                <option value="standard">Auto · standard</option>
                <option value="fine">Auto · fine</option>
              </select>
            </label>
          )}
          <label>
            Imagery{' '}
            <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
              <option value="regional" disabled={!regional}>
                {regional ? 'Regional detail' : 'Regional detail unavailable'}
              </option>
              <option value="global">Global color</option>
            </select>
          </label>
          <button
            onClick={() => {
              const view = mapRef.current?.getView();
              const size = mapRef.current?.getSize();
              if (routeSource.current.getFeatures().length > 1 && view && size) {
                view.fit(routeSource.current.getExtent()!, {
                  size,
                  padding: [65, 65, 65, 65],
                  duration: 400,
                });
              } else if (showRegional && regional && view && size) {
                view.fit(regional.extent, { size, padding: [58, 58, 58, 58], duration: 400 });
              } else {
                view?.animate({ center: mission.coordinates, resolution: 0.02, duration: 400 });
              }
            }}
          >
            Recenter
          </button>
        </div>
      </div>
      <div className="distance-guide">
        <span className="guide-swatch" aria-hidden="true" />
        <strong>
          {showDistances
            ? `${guideSpacing < 1 ? `${Number((guideSpacing * 1000).toPrecision(4))} m` : `${guideSpacing.toLocaleString()} km`} between rings`
            : 'Distance rings hidden'}
        </strong>
        <span>
          From {planPoints?.length ? 'planned base' : 'landing reference'} · spacing follows zoom ·
          no 10 km cap
        </span>
        <details>
          <summary>How distances are measured</summary>
          <p>
            Surface distance on the source Mars 2000 sphere (radius 3,396.19 km). Rings extend to
            the visible region; they are not travel limits or safe boundaries. Walking distance
            follows the planned route and may be longer. The scale bar applies at map center.
          </p>
        </details>
      </div>
      <div className="map-frame">
        <div
          ref={target}
          className={`map ${selectionMode !== 'inspect' ? 'map-picking' : ''}`}
          role="region"
          aria-label={`${mission.region} NASA orbital imagery. Drag to pan; use plus and minus to zoom.`}
          tabIndex={0}
        />
        {scale.label && (
          <div className="mars-scale" aria-label={`Map scale ${scale.label} at map center`}>
            <span style={{ width: scale.width }}>{scale.label}</span>
            <small>Mars 2000 sphere · scale at map center</small>
          </div>
        )}
        <div className="map-caption">
          <span>◉ {mission.region}</span>
          <span>NASA MARS TREK / NORTH UP</span>
        </div>
      </div>
      {experience && (mission.id === 'pathfinder' || mission.id === 'phoenix') && (
        <div className="map-experience-note">
          <span className="map-experience-marker" aria-hidden="true" />
          <div>
            <p className="eyebrow">{mission.name.toUpperCase()} · REGIONAL EXPLORATION</p>
            <strong>{experience.heading}</strong>
            <p>{experience.summary}</p>
            {showRegional && (
              <small>Dashed outline marks the available HiRISE mosaic coverage.</small>
            )}
          </div>
        </div>
      )}
      {pois.length > 0 && (
        <section className="poi-explorer" aria-label={`${mission.name} points of interest`}>
          <div className="poi-picker">
            <p className="eyebrow">MAPPED LOCATIONS</p>
            <div className="poi-picker-list">
              {pois.map((poi, index) => (
                <button
                  key={poi.id}
                  className={`poi-picker-button ${selectedPoiId === poi.id ? 'active' : ''}`}
                  aria-pressed={selectedPoiId === poi.id}
                  onClick={() => choosePoi(poi.id)}
                >
                  <span className="poi-picker-index">0{index + 1}</span>
                  <span>
                    <strong>{poi.title}</strong>
                    <small>{poi.category}</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>
          {selectedPoi && (
            <article className="poi-detail" aria-live="polite">
              <div className="poi-detail-copy">
                <p className="eyebrow">SELECTED LOCATION · {selectedPoi.category.toUpperCase()}</p>
                <h3>{selectedPoi.title}</h3>
                <p>{selectedPoi.summary}</p>
                <p className="poi-coordinate">
                  <strong>{selectedPoi.coordinateLabel}</strong>
                  <span>{selectedPoi.locationNote}</span>
                </p>
                <div className="poi-sources">
                  <a href={selectedPoi.source} target="_blank" rel="noreferrer">
                    Landing coordinates source ↗
                  </a>
                  {selectedMedia && (
                    <a href={selectedMedia.source} target="_blank" rel="noreferrer">
                      Evidence image source ↗
                    </a>
                  )}
                </div>
              </div>
              {selectedMedia && (
                <figure className="poi-evidence">
                  <img src={selectedMedia.src} alt={selectedMedia.alt} loading="lazy" />
                  <figcaption>
                    <strong>{selectedMedia.title}</strong>
                    <span>{selectedMedia.caption}</span>
                    <small>{selectedMedia.credit}</small>
                  </figcaption>
                </figure>
              )}
            </article>
          )}
        </section>
      )}
      <div className="map-status">
        <span role="status">{status}</span>
        <button onClick={() => setRetry((v) => v + 1)}>Reload imagery</button>
        <a href="https://trek.nasa.gov/mars/" target="_blank" rel="noreferrer">
          Open Mars Trek ↗
        </a>
      </div>
      <p className="map-disclaimer">
        The imagery itself does not measure hazards. Any modeled terrain overlay is described
        separately. Landing markers are approximate. Regional mosaics have limited coverage; zoom
        out or choose Global color for wider context.
      </p>
    </section>
  );
}
