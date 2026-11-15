import type { Mission } from '../types';
import type { Exploration, MediaRecord } from './exploration';

export const insightMission: Mission = {
  id: 'insight',
  name: 'InSight',
  region: 'Elysium Planitia',
  landingYear: 2018,
  coordinates: [135.62, 4.5],
  description:
    'Listen for marsquakes and measure how seismic waves travel through the planet to reveal the crust, mantle and core beneath a flat, smooth plain near the Martian equator.',
  topics: ['Marsquakes', 'Planet interior', 'Crust, mantle and core'],
  source: 'https://science.nasa.gov/mission/insight/',
};

export const insightExplorations: Exploration[] = [
  {
    name: 'Marsquakes recorded by SEIS',
    focus: 'Seismology',
    summary:
      'InSight placed a seismometer on the Martian surface to measure how powerful and how frequent seismic activity is on Mars. It also tracked how often meteoroids strike the planet, since some marsquakes are caused by impacts.',
    source: 'https://science.nasa.gov/mission/insight/science/',
  },
  {
    name: 'Crust, mantle and core',
    focus: 'Planet interior',
    summary:
      'Seismic waves from marsquakes gave the first direct measurements of the thickness of the Martian crust and of the size of the core. Scientists also confirmed that the core is liquid.',
    source:
      'https://www.jpl.nasa.gov/edu/resources/teachable-moment/how-insight-revealed-the-heart-of-mars/',
  },
  {
    name: 'The heat probe “mole”',
    focus: 'Heat flow',
    summary:
      'The self-hammering heat probe was designed to burrow about five meters down and measure how heat flows out of Mars. The soil at the landing site did not give it enough friction to dig in as planned, and the team ended its attempts in January 2021.',
    source:
      'https://www.jpl.nasa.gov/edu/resources/teachable-moment/how-insight-revealed-the-heart-of-mars/',
  },
  {
    name: 'Landing site and end of mission',
    focus: 'Environment',
    summary:
      'InSight landed on 26 November 2018 on a flat, smooth plain in western Elysium Planitia. The site was chosen for safety rather than surface features, because the mission was built to study the interior. NASA ended the mission on 15 December 2022.',
    source: 'https://science.nasa.gov/mission/insight/',
  },
];

export const insightMedia: MediaRecord[] = [
  {
    id: 'selfie',
    title: 'InSight’s first selfie',
    src: '/media/insight-selfie.png',
    alt: 'InSight lander on the surface of Mars seen from above, with its solar panels spread wide and its science instruments on the deck',
    caption:
      'A mosaic of 11 images from the camera on InSight’s robotic arm. It shows the solar panels and the deck, with the science instruments, weather sensor booms and UHF antenna on top.',
    credit: 'NASA/JPL-Caltech',
    source: 'https://science.nasa.gov/resource/insights-first-selfie/',
    date: '6 December 2018 · Sol 10',
    kind: 'LANDER SELFIE',
  },
  {
    id: 'landing-site',
    title: 'InSight landing site',
    src: '/media/insight-landing-site.png',
    alt: 'Grayscale orbital view of a flat plain in Elysium Planitia with a red dot marking the lander and a blue ellipse around it',
    caption:
      'The red dot marks the final landing location of NASA’s InSight lander in this annotated THEMIS image of the surface of Mars, taken by the 2001 Mars Odyssey orbiter in 2015.',
    credit: 'NASA/JPL-Caltech/ASU',
    source: 'https://science.nasa.gov/mission/insight/',
    date: '2015 · THEMIS image',
    kind: 'ORBITAL VIEW',
  },
];
