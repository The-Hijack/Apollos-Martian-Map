export interface MediaRecord {
  id: string;
  title: string;
  src: string;
  alt: string;
  caption: string;
  credit: string;
  source: string;
  date: string;
  kind: string;
}
export interface Exploration {
  name: string;
  summary: string;
  focus: string;
  source: string;
}
export const media: Record<string, MediaRecord[]> = {
  perseverance: [
    {
      id: 'samples',
      title: 'Wildcat Ridge & Skinner Ridge',
      src: '/media/jezero-sampling.jpg',
      alt: 'Mastcam-Z mosaic showing sedimentary rock outcrops at Wildcat Ridge and Skinner Ridge in Jezero delta',
      caption:
        'Two delta outcrops sampled by Perseverance, about 20 meters apart. Mastcam-Z captured the mosaic on sol 518; the colors were processed to emphasize differences in the rocks.',
      credit: 'NASA/JPL-Caltech/ASU/MSSS',
      source:
        'https://science.nasa.gov/photojournal/2-perseverance-sampling-locations-in-jezeros-delta/',
      date: '4 August 2022 · Sol 518',
      kind: 'SURFACE MOSAIC',
    },
    {
      id: 'geology',
      title: 'Jezero & Nili Planum geology',
      src: '/media/jezero-geology.png',
      alt: 'USGS colored geological map of Jezero crater and Nili Planum, with map-unit legend',
      caption:
        'Sun and Stack’s regional map distinguishes geological units across Jezero and Nili Planum. Published at 1:75,000 using a CTX image base. Open the original to inspect the legend and full-resolution map.',
      credit: 'USGS · Vivian Z. Sun and Kathryn M. Stack (2020) · Public domain',
      source: 'https://www.usgs.gov/maps/geologic-map-jezero-crater-and-nili-planum-region-mars',
      date: '2020 · USGS SIM 3464',
      kind: 'GEOLOGICAL MAP',
    },
    {
      id: 'watson',
      title: 'A closer look with WATSON',
      src: '/media/perseverance-watson.png',
      alt: 'Perseverance SHERLOC WATSON raw camera observation acquired on sol 1934',
      caption:
        'A raw image from the camera on Perseverance’s robotic arm, selected from the supplied NASA gallery. This image is not assigned to a map point because its exact location has not been verified.',
      credit: 'NASA/JPL-Caltech',
      source:
        'https://mars.nasa.gov/mars2020/multimedia/raw-images/SIF_1934_0838664054_968EBY_N0894246SRLC08062_0000LMJ',
      date: '30 July 2026 · Sol 1934',
      kind: 'RAW ROVER IMAGE',
    },
  ],
  curiosity: [
    {
      id: 'mount-sharp',
      title: 'The proposed climb up Mount Sharp',
      src: '/media/curiosity-route.gif',
      alt: 'NASA animated annotated orbital map showing the 2019 proposed route up lower Mount Sharp',
      caption:
        'NASA’s 2019 route animation identifies regions proposed for exploration on lower Mount Sharp. It combines orbital observations from MRO and Mars Express. This is a historical proposal, not a current rover track or validated astronaut route.',
      credit:
        'NASA/JPL-Caltech/ESA/University of Arizona/JHUAPL/MSSS/USGS Astrogeology Science Center',
      source: 'https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/',
      date: '15 May 2019 · PIA23179',
      kind: 'HISTORICAL ROUTE ANIMATION',
    },
  ],
};
export const explorations: Record<string, Exploration[]> = {
  perseverance: [
    {
      name: 'Jezero delta',
      focus: 'Ancient water',
      summary:
        'River-delivered sediment accumulated where water entered an ancient crater lake. The preserved layers are targets for studying past environments and possible ancient biosignatures.',
      source: 'https://science.nasa.gov/resource/perseverance-explores-the-jezero-crater-delta/',
    },
    {
      name: 'Wildcat Ridge',
      focus: 'Rock sampling',
      summary:
        'A sedimentary outcrop sampled during the delta campaign. The surface mosaic above shows the abraded rock and sampling area.',
      source:
        'https://science.nasa.gov/photojournal/2-perseverance-sampling-locations-in-jezeros-delta/',
    },
    {
      name: 'Skinner Ridge',
      focus: 'Compare outcrops',
      summary:
        'A second sampled outcrop about 20 meters from Wildcat Ridge, allowing nearby rocks in the delta to be compared.',
      source:
        'https://science.nasa.gov/photojournal/2-perseverance-sampling-locations-in-jezeros-delta/',
    },
  ],
  curiosity: [
    {
      name: 'Yellowknife Bay',
      focus: 'Ancient lakebed',
      summary:
        'Drilled mudstones provided evidence of an ancient lake environment with chemical ingredients and energy sources that could support microbial life.',
      source: 'https://science.nasa.gov/resource/sandy-martian-valleys-in-curiositys-near-future/',
    },
    {
      name: 'Pahrump Hills',
      focus: 'Changing water chemistry',
      summary:
        'Curiosity investigated layers containing minerals including jarosite, which can record acidic conditions. Compare these findings with Yellowknife Bay.',
      source: 'https://ares.jsc.nasa.gov/missions/msl/important-discoveries.cfm',
    },
    {
      name: 'Vera Rubin Ridge',
      focus: 'Landscape context',
      summary:
        'An overlook from which the mission documented its journey across Gale, including earlier stops, dunes and buttes.',
      source: 'https://www.jpl.nasa.gov/videos/curiosity-at-martian-scenic-overlook/',
    },
  ],
  spirit: [
    {
      name: 'Gusev plains',
      focus: 'Volcanic terrain',
      summary:
        'Spirit examined basaltic rocks across the plains inside Gusev Crater, a large impact basin filled with volcanic materials.',
      source: 'https://science.nasa.gov/mission/mer-spirit/',
    },
    {
      name: 'Columbia Hills',
      focus: 'Water-altered rocks',
      summary:
        'The hills revealed a diverse collection of rocks, including evidence that some materials had been altered by water.',
      source: 'https://science.nasa.gov/mission/mer-spirit/',
    },
    {
      name: 'Home Plate',
      focus: 'Silica and volcanism',
      summary:
        'A silica-rich deposit uncovered by Spirit’s dragging wheel is consistent with formation in a past hot-spring or steam-vent environment.',
      source: 'https://science.nasa.gov/mission/mer-spirit/',
    },
  ],
  opportunity: [
    {
      name: 'Eagle Crater',
      focus: 'Water-altered rocks',
      summary:
        'At its landing site, Opportunity examined layered outcrops and small hematite-rich spheres that helped establish a history of water at Meridiani Planum.',
      source: 'https://science.nasa.gov/mission/mer-opportunity/',
    },
    {
      name: 'Endurance Crater',
      focus: 'Layered outcrops',
      summary:
        'Rocks exposed along the crater’s walls let scientists investigate changes in the region’s ancient watery environment.',
      source: 'https://science.nasa.gov/mission/mer-opportunity/',
    },
  ],
};
