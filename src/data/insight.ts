import type { Mission } from '../types';
import type { Exploration } from './exploration';

export const insightMission: Mission = {
  id: 'insight',
  name: 'InSight',
  region: 'Elysium Planitia',
  landingYear: 2018,
  coordinates: [135.62, 4.5],
  description:
    'Listen for marsquakes and measure how seismic waves travel through the planet to reveal the crust, mantle and core beneath a flat volcanic plain near the Martian equator.',
  topics: ['Marsquakes', 'Planet interior', 'Crust, mantle and core'],
  source: 'https://science.nasa.gov/mission/insight/',
};

export const insightExplorations: Exploration[] = [
  {
    name: 'Marsquakes recorded by SEIS',
    focus: 'Seismology',
    summary:
      'InSight carried the first seismometer placed on the surface of another planet. Over about four years it detected more than 1,300 marsquakes, some caused by meteoroid impacts.',
    source: 'https://science.nasa.gov/mission/insight/',
  },
  {
    name: 'Crust, mantle and core',
    focus: 'Planet interior',
    summary:
      'Seismic waves from marsquakes revealed a thinner-than-expected crust, a mantle, and a core that is larger than expected and liquid. This was the first seismic picture of the interior of another planet.',
    source: 'https://science.nasa.gov/mission/insight/',
  },
  {
    name: 'The heat probe “mole”',
    focus: 'Heat flow',
    summary:
      'The self-hammering heat probe was meant to measure how heat escapes from the interior. Unusual soil kept it from digging as deep as planned, so this was the one part of the mission that fell short of its goals.',
    source: 'https://science.nasa.gov/mission/insight/',
  },
  {
    name: 'Landing site and weather',
    focus: 'Environment',
    summary:
      'InSight sat on a flat, smooth plain chosen for safe landing and for deploying instruments. Its weather sensors returned some of the most detailed atmospheric records from the Martian surface. Dust on its solar panels ended the mission in December 2022.',
    source: 'https://www.jpl.nasa.gov/missions/insight',
  },
];
