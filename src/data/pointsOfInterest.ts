export interface PointOfInterest {
  id: string;
  title: string;
  category: string;
  coordinates: [number, number];
  coordinateLabel: string;
  locationNote: string;
  summary: string;
  source: string;
  mediaId: string;
}

export const pointsOfInterest: Record<string, PointOfInterest[]> = {
  pathfinder: [
    {
      id: 'pathfinder-landing-site',
      title: 'Pathfinder landing site',
      category: 'Ares Vallis · ancient floodplain',
      coordinates: [-33.22, 19.13],
      coordinateLabel: '19.13° N · 33.22° W',
      locationNote: 'Published Pathfinder landing coordinates',
      summary:
        'Pathfinder landed in the boulder-strewn Ares Vallis floodplain. Sojourner examined rocks and cobbles carried into the region by ancient floods. The Dice and Yogi appear in mission imagery, but their individual positions are not plotted here.',
      source: 'https://mars.nasa.gov/internal_resources/815/',
      mediaId: 'sojourner-dice',
    },
  ],
  phoenix: [
    {
      id: 'phoenix-landing-site',
      title: 'Phoenix lander & ice study site',
      category: 'Vastitas Borealis · polar soil',
      coordinates: [-125.75, 68.22],
      coordinateLabel: '68.22° N · 234.25° E',
      locationNote: 'Published landing coordinates, rounded to 0.01°',
      summary:
        'Phoenix landed on the northern arctic plains and dug shallow trenches where bright water ice appeared beneath the soil. This marker locates the lander; individual trench positions are not separately mapped.',
      source: 'https://science.nasa.gov/mission/mars-phoenix/',
      mediaId: 'phoenix-trenches',
    },
  ],
};
