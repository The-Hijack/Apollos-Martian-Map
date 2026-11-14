import type { Mission } from '../types';
import type { Exploration, MediaRecord } from './exploration';

export const viking1Mission: Mission = {
  id: 'viking1',
  name: 'Viking 1',
  region: 'Chryse Planitia',
  landingYear: 1976,
  coordinates: [-47.95, 22.27],
  description:
    'Stand where humanity first saw the surface of Mars from the ground: photograph the plains, sample the soil, search it for signs of life and record the weather.',
  topics: ['Surface imaging', 'Soil experiments', 'Atmospheric measurements'],
  source: 'https://science.nasa.gov/astrobiology/missions/viking-project/',
};

export const viking1Explorations: Exploration[] = [
  {
    name: 'First images from the surface',
    focus: 'Surface imaging',
    summary:
      'Viking 1 landed on 20 July 1976 on the western slope of Chryse Planitia, the “Plains of Gold”. Shortly after touchdown it took the first photograph ever taken from the surface of Mars, and a color picture followed on 21 July.',
    source: 'https://science.nasa.gov/astrobiology/missions/viking-project/',
  },
  {
    name: 'Searching the soil for life',
    focus: 'Soil experiments',
    summary:
      'The Viking landers carried three biology experiments designed to look for signs of life. They found unexpected and enigmatic chemical activity in the soil but no definitive evidence of living microorganisms near the landing sites.',
    source: 'https://science.nasa.gov/astrobiology/missions/viking-project/',
  },
  {
    name: 'Atmosphere and long-term watch',
    focus: 'Atmospheric measurements',
    summary:
      'The landers monitored changes in atmospheric opacity over several Martian years and determined the mean size of the particles suspended in the atmosphere. Viking 1 worked the longest, until its end of mission on 13 November 1982.',
    source: 'https://science.nasa.gov/astrobiology/missions/viking-project/',
  },
];

export const viking1Media: MediaRecord[] = [
  {
    id: 'first-photo',
    title: 'First photograph from the surface of Mars',
    src: '/media/viking1-first-photo.png',
    alt: 'Black and white close-up of rocks and fine-grained soil, with part of a lander footpad at the lower right',
    caption:
      'The first photograph ever taken from the surface of Mars, captured by the Viking 1 lander on 20 July 1976. The center of the image is about 1.4 meters from the lander camera, and part of the footpad is visible at lower right.',
    credit: 'NASA/JPL',
    source: 'https://science.nasa.gov/photojournal/first-photograph-taken-on-mars-surface/',
    date: '20 July 1976',
    kind: 'LANDER IMAGE',
  },
];
