import type { Mission } from '../types';
export const missions: Mission[] = [
  {
    id: 'perseverance',
    name: 'Perseverance',
    region: 'Jezero Crater',
    landingYear: 2021,
    coordinates: [77.45, 18.44],
    description:
      'Explore an ancient lake and river delta, investigate past habitability, and discover the story behind collected rock samples.',
    topics: ['Ancient river delta', 'Rock samples', 'Past habitability'],
    source: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
  },
  {
    id: 'curiosity',
    name: 'Curiosity',
    region: 'Gale Crater / Mount Sharp',
    landingYear: 2012,
    coordinates: [137.44, -4.59],
    description:
      'Read the layers of Mount Sharp and investigate how water and environmental conditions changed through Martian history.',
    topics: ['Sedimentary layers', 'Ancient environments', 'Mount Sharp'],
    source: 'https://science.nasa.gov/mission/msl-curiosity/',
  },
  {
    id: 'pathfinder',
    name: 'Pathfinder / Sojourner',
    region: 'Ares Vallis',
    landingYear: 1997,
    coordinates: [-33.22, 19.13],
    description:
      'Explore the rock-strewn Ares Vallis floodplain, where rounded cobbles, varied rocks, and windblown soil preserve clues to ancient catastrophic floods.',
    topics: ['Ancient floodplain', 'Rocks and cobbles', 'Flood-deposited terrain'],
    source: 'https://science.nasa.gov/mission/mars-pathfinder/',
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    region: 'Vastitas Borealis · Northern Polar Plains',
    landingYear: 2008,
    coordinates: [-125.75, 68.22],
    description:
      'Investigate the arctic plains where Phoenix exposed near-surface water ice, analyzed soil chemistry, and measured polar weather.',
    topics: ['Subsurface water ice', 'Polar soil chemistry', 'Arctic weather and frost'],
    source: 'https://science.nasa.gov/mission/mars-phoenix/',
  },
];
export const resources = [
  {
    name: 'JPL Mars Trek',
    purpose: 'Mars imagery and terrain layer research',
    url: 'https://trek.nasa.gov/mars/',
  },
  {
    name: 'USGS geological maps',
    purpose: 'Geological context and regional mapping',
    url: 'https://astrogeology-usgs.hub.arcgis.com/pages/interactive-maps-mars',
  },
  {
    name: 'Curiosity proposed route',
    purpose: 'Historical route visualization reference',
    url: 'https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/',
  },
  {
    name: 'NASA Worldview',
    purpose: 'Earth-only reference for map interactions',
    url: 'https://worldview.earthdata.nasa.gov/',
  },
  {
    name: 'Perseverance raw images',
    purpose: 'Source gallery for rover imagery',
    url: 'https://mars.nasa.gov/mars2020/multimedia/raw-images/',
  },
];
