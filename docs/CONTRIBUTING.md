# Contributing

## Code ownership

`App.tsx` owns navigation and keeps visited mission workspaces mounted so switching screens preserves an in-progress plan. `TraverseWorkspace` owns route and simulation state. `ObjectiveBriefing`, `MissionEvidence`, `ExclusionEditor` and `FieldNotebook` handle separate views.

`src/components/map/` owns OpenLayers rendering. Keep calculations in `src/planning/`, not in presentation components. Planning modules use plain JavaScript with TypeScript declarations so Node can test them without a separate compilation step. Update the `.d.ts` contract and relevant tests whenever a public function changes.

## Mission content

1. Add mission metadata with a stable ID in `src/data/missions.ts`.
2. Add science objectives and media in `src/data/exploration.ts`. InSight and Viking 1 retain dedicated contributed modules imported by the shared catalogs.
3. Place app images in `public/media/`. Record original links and credits in `public/media/sources.json` and the media record.
4. Add only verified map coordinates in `src/data/pointsOfInterest.ts`. Keep ungeoreferenced features as science records rather than inventing waypoints.
5. Add cited hazard context in `src/data/hazardEvidence.ts`. Historical reports are not mapped exclusion boundaries.
6. Run `npm run check` and inspect the mission in the app. Update the catalog test's expected mission list only when intentionally changing the supported missions.

Never reuse Jezero elevations for another region. A new measured-routing region needs a verified raster, projection metadata, coverage limits and tests.

## Coordinates and assets

Coordinates are `[eastLongitude, northLatitude]` in Mars degrees, not Earth WGS84. Longitudes use −180 to 180. Preserve source precision; displaying extra decimal places does not make an approximate landing position exact.

Use `public/media/` for production imagery, `src/data/` for application data, and `reference/downloads/` for research material. The archive preserves original downloaded pages and their companion files. It is not part of the production build. `reference/manifest.json` lists the root items moved there.

## Styles and reviews

`src/styles/base.css` contains shared base and existing component styles. `src/styles/workflow.css` owns the atlas and staged workspace layout. Scope new styles to their component and check mobile and desktop layouts.

Before a pull request, run `npm run format` and `npm run check`. Explain the behavior changed, affected missions, checks performed and data limitations. Do not include generated builds or dependencies.
