// Approximate landing coordinates, planetocentric latitude and east-positive longitude.
// Seed catalog only: not all Mars missions; no live operational status is implied.
export const missions = [
  {
    id: 'perseverance',
    name: 'Perseverance',
    year: 2021,
    site: 'Jezero crater',
    lat: 18.44,
    lon: 77.45,
    purpose: 'Investigate ancient habitability and collect rock samples.',
    source: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
  },
  {
    id: 'curiosity',
    name: 'Curiosity',
    year: 2012,
    site: 'Gale crater',
    lat: -4.59,
    lon: 137.44,
    purpose: 'Investigate whether Mars once had environments suitable for microbial life.',
    source: 'https://science.nasa.gov/mission/msl-curiosity/',
  },
  {
    id: 'insight',
    name: 'InSight',
    year: 2018,
    site: 'Elysium Planitia',
    lat: 4.5,
    lon: 135.62,
    purpose: 'Study the interior of Mars through seismic and geophysical measurements.',
    source: 'https://science.nasa.gov/mission/insight/',
  },
];
