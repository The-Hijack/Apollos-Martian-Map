export interface HazardEvidence {
  title: string;
  detail: string;
  source: string;
}
export const hazardEvidence: Record<string, HazardEvidence[]> = {
  perseverance: [
    {
      title: 'Rock and sand clearance remains unverified',
      detail:
        'Perseverance wheel design reflects the rock damage experienced by Curiosity. A coarse elevation model cannot establish clearance for an astronaut or equipment.',
      source: 'https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/',
    },
  ],
  curiosity: [
    {
      title: 'Sharp rocks and soft sand',
      detail:
        'NASA describes both wheel-damaging rocks and loss of traction in sand along Curiosity’s route. This is regional evidence, not a mapped boundary in this app.',
      source:
        'https://www.nasa.gov/missions/mars-science-laboratory/curiosity-rover/nasas-curiosity-mars-rover-reaches-long-awaited-salty-region/',
    },
  ],
  spirit: [
    {
      title: 'Crust can conceal weak soil',
      detail:
        'At Troy, Spirit broke through a crust into soft sand. The event is documented; its exact hazard footprint has not been registered to this map.',
      source:
        'https://www.jpl.nasa.gov/news/nasa-trapped-mars-rover-finds-evidence-of-subsurface-water/',
    },
  ],
  opportunity: [
    {
      title: 'Entrapment at Purgatory Dune',
      detail:
        'Opportunity became embedded in a soft sand ripple. Use the historical event as a caution; no dune boundary has been inferred from the photograph.',
      source: 'https://science.nasa.gov/resource/looking-back-at-purgatory-dune/',
    },
  ],
  insight: [
    {
      title: 'Unexpected soil behavior',
      detail:
        'The mole encountered soil behavior that differed from its design assumptions. This is evidence of subsurface uncertainty, not a measurement of astronaut bearing capacity.',
      source: 'https://science.nasa.gov/missions/insight/common-questions-about-insights-mole/',
    },
  ],
  phoenix: [
    {
      title: 'Disturbed soil and shallow ice',
      detail:
        'Phoenix exposed icy soil while trenching. Trench images do not establish walkability or exact exclusion boundaries for a future crew.',
      source: 'https://www.jpl.nasa.gov/news/phoenix-scrapes-to-icy-soil-in-wonderland/',
    },
  ],
  pathfinder: [],
  viking1: [],
};
