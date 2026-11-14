import type { Mission } from '../types';
import type { Exploration } from './exploration';

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
      'Viking 1 landed on 20 July 1976 on the western slope of Chryse Planitia, the “Plains of Gold”. Its first photograph was taken minutes after landing, and the first color image followed the next day.',
    source: 'https://science.nasa.gov/astrobiology/missions/viking-project/',
  },
  {
    name: 'Searching the soil for life',
    focus: 'Soil experiments',
    summary:
      'The lander carried three biology experiments designed to look for signs of microbial life. They found unexpected chemical activity in the soil but no definitive evidence of living microorganisms.',
    source: 'https://science.nasa.gov/astrobiology/missions/viking-project/',
  },
  {
    name: 'Weather and atmosphere',
    focus: 'Atmospheric measurements',
    summary:
      'A meteorology boom and other instruments recorded the Martian atmosphere and weather from the surface. The lander kept transmitting until contact was lost on 11 November 1982.',
    source: 'https://science.nasa.gov/astrobiology/missions/viking-project/',
  },
];
