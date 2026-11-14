import { missions } from './missions.js';
import { makeTerrain, route } from './routing.js';
const $ = (id) => document.getElementById(id),
  grid = makeTerrain();
let selected = missions[0],
  destination = [22, 22],
  notes = [];
try {
  const data = JSON.parse(localStorage.getItem('mars-notes') || '[]');
  if (Array.isArray(data))
    notes = data.filter(
      (n) =>
        typeof n.title === 'string' &&
        typeof n.notes === 'string' &&
        Number.isFinite(n.lat) &&
        Math.abs(n.lat) <= 90 &&
        Number.isFinite(n.lon) &&
        Math.abs(n.lon) <= 180,
    );
} catch {
  $('save-status').textContent = 'Saved notes could not be loaded.';
}
function el(tag, text) {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  return e;
}
function atlas() {
  $('atlas').replaceChildren();
  function shape(tag, attrs, text) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text) e.textContent = text;
    $('atlas').append(e);
    return e;
  }
  for (let x = 0; x <= 720; x += 60)
    shape('line', { x1: x, y1: 0, x2: x, y2: 360, stroke: '#4c3a2c' });
  for (let y = 0; y <= 360; y += 60)
    shape('line', { x1: 0, y1: y, x2: 720, y2: y, stroke: '#4c3a2c' });
  for (const m of [...missions, ...notes]) {
    const x = (m.lon + 180) * 2,
      y = (90 - m.lat) * 2;
    shape('circle', {
      cx: x,
      cy: y,
      r: m === selected ? 7 : 4,
      fill: m.name ? '#e5b279' : '#bedbac',
    });
    if (m === selected)
      shape(
        'text',
        { x: x - 10, y: y - 15, fill: '#fff', 'font-size': 14, 'text-anchor': 'end' },
        m.name,
      );
  }
}
function catalog() {
  $('missions').replaceChildren();
  for (const m of missions.filter((m) =>
    (m.name + ' ' + m.site).toLowerCase().includes($('search').value.toLowerCase()),
  )) {
    const b = el('button', m.name);
    b.className = 'mission';
    b.setAttribute('aria-pressed', String(m === selected));
    b.append(el('small', m.year + ' · ' + m.site));
    b.onclick = () => {
      selected = m;
      $('latitude').value = m.lat;
      $('longitude').value = m.lon;
      catalog();
      atlas();
    };
    $('missions').append(b);
    if (m === selected) {
      const p = el('p', m.purpose);
      p.className = 'muted';
      const a = el('a', 'NASA mission source ↗');
      a.href = m.source;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      $('missions').append(p, a);
    }
  }
  if (!$('missions').childElementCount) $('missions').textContent = 'No matching missions.';
}
function plan() {
  const slope = Number($('slope').value);
  $('slope-value').textContent = slope;
  const result = route(grid, [1, 1], destination, slope, Number($('risk').value)),
    path = new Set(result?.path.map((p) => p.join(',')) || []);
  $('terrain').replaceChildren();
  grid.forEach((row, y) =>
    row.forEach((c, x) => {
      const b = el('button');
      b.type = 'button';
      b.style.setProperty('--cell', c.slope > slope ? '#884e39' : `hsl(32 24% ${20 + c.slope}%)`);
      b.setAttribute('aria-label', `Destination ${x}, ${y}; slope ${c.slope} degrees`);
      b.title = b.getAttribute('aria-label');
      b.classList.toggle('path', path.has(`${x},${y}`));
      b.classList.toggle('start', x === 1 && y === 1);
      b.classList.toggle('destination', x === destination[0] && y === destination[1]);
      b.onclick = () => {
        destination = [x, y];
        plan();
      };
      $('terrain').append(b);
    }),
  );
  $('route-result').textContent = result
    ? `${result.distanceKm.toFixed(1)} km simulated traverse · ${result.path.length - 1} steps`
    : 'No traversable route. Choose another destination or increase the slope limit.';
}
function notebook() {
  $('discoveries').replaceChildren();
  for (const n of notes) {
    const a = el('article');
    a.className = 'note';
    a.append(el('strong', n.title), el('p', n.notes), el('small', `${n.lat}° N, ${n.lon}° E`));
    $('discoveries').append(a);
  }
  $('export').disabled = !notes.length;
  atlas();
}
$('discovery').onsubmit = (e) => {
  e.preventDefault();
  const title = $('title').value.trim(),
    observation = $('notes').value.trim(),
    lat = Number($('latitude').value),
    lon = Number($('longitude').value);
  if (
    !title ||
    !observation ||
    !Number.isFinite(lat) ||
    Math.abs(lat) > 90 ||
    !Number.isFinite(lon) ||
    Math.abs(lon) > 180
  ) {
    $('save-status').textContent = 'Enter a title, observation, and valid coordinates.';
    return;
  }
  notes.push({
    id: crypto.randomUUID(),
    title,
    notes: observation,
    lat,
    lon,
    createdAt: new Date().toISOString(),
  });
  try {
    localStorage.setItem('mars-notes', JSON.stringify(notes));
    $('save-status').textContent = 'Saved in this browser.';
  } catch {
    $('save-status').textContent = 'Storage unavailable. Export before closing to keep this note.';
  }
  $('title').value = '';
  $('notes').value = '';
  notebook();
};
$('export').onclick = () => {
  const data = {
    type: 'FeatureCollection',
    coordinateReference: 'Mars planetocentric, east-positive longitude; not Earth WGS84',
    features: notes.map(({ lat, lon, ...properties }) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: { ...properties, planet: 'Mars' },
    })),
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/geo+json' }),
  );
  const a = el('a');
  a.href = url;
  a.download = 'mars-discoveries.geojson';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$('search').oninput = catalog;
$('slope').oninput = plan;
$('risk').onchange = plan;
$('latitude').value = selected.lat;
$('longitude').value = selected.lon;
catalog();
plan();
notebook();
