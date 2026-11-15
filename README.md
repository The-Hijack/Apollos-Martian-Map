# Apollos

A Mars exploration planning prototype by Team Apollos for the NASA Space Apps Challenge. Explore eight mission regions, plan a round trip, review the return budget, and record discoveries during a simulated traverse.

Built with React, TypeScript, Vite and OpenLayers.

## Run locally

Install **Node.js 22** with npm. Verified with Node 22.18.0 and npm 10.9.3. Internet is needed to install packages and load NASA imagery. The current app does **not** require an API key or environment file.

If you have not cloned the repository:

```sh
git clone https://github.com/The-Hijack/Martian-Map-Challenge.git
cd Martian-Map-Challenge
```

Switch to your assigned branch before editing. The integration work is on `feature/otis`:

```sh
git switch feature/otis
npm ci
npm run dev
```

Open the **Local** URL printed in the terminal. Vite normally uses `http://127.0.0.1:5173`, but chooses another port if that port is occupied. Keep the terminal running; press **Ctrl+C** to stop the server.

Already have a checkout? Open a terminal in the folder containing `package.json`, switch to your branch, then run `npm ci` and `npm run dev`. Do not clone a second copy into that folder. Use the branch containing the team's latest merged work if `feature/otis` has already been merged.

## Check your changes

```sh
npm run format
npm run check
```

`format` applies Prettier. `check` runs the formatting check, all tests and the production build. You can also run the checks individually:

```sh
npm run format:check
npm test
npm run build
```

The tests cover catalogs, local asset references, routing, distances, budgets and observation storage, plus the earlier synthetic prototype. The build checks TypeScript and creates `dist/`.

To inspect the production build locally:

```sh
npm run preview
```

Open its printed URL. Preview does not deploy the site. Do not commit `dist/`, `node_modules/`, credentials or `.data-cache/`.

## Try the main flow

1. Select **Perseverance** and choose **Plan exploration**.
2. Select a science objective and choose **Plan the route**.
3. Set the base, slope limit and time assumptions. Add no-go areas if needed.
4. Open **Review**, inspect the assumptions, then start the simulation.
5. Choose **Record discovery** to pause and add a note or photo at the simulated position.
6. Return to the traverse, choose **Return to base**, and export your field records.

Other missions use the same workflow with manually placed routes. Choose a base distinct from the landing reference before reviewing the trip. Distance rings adapt to zoom; they do not define a safe area or a 10 km travel limit.

## Project structure

```text
src/
  App.tsx                 Navigation and mission selection
  components/
    map/                  NASA imagery, overlays and distance guides
    missions/             Mission selection, science records and media
    traverse/             Planning, review and the field notebook
  data/                   Mission catalogs, terrain and source provenance
  planning/               Routing, distance, budget and storage logic with tests
  styles/                 Base styles and application layout
  utils/                  Shared browser utilities
public/media/             App images and source credits
scripts/                  Terrain extraction tooling
docs/                     Contributor and data guidance
reference/downloads/      Preserved research downloads; not app assets
prototype/                Earlier synthetic routing experiment
```

Read [Contributing](docs/CONTRIBUTING.md) before adding mission content. Read [Data and limitations](docs/DATA.md) before changing map measurements or terrain inputs.

## Current capabilities and limits

- Eight missions: Perseverance, Curiosity, Pathfinder, Phoenix, Spirit, Opportunity, InSight and Viking 1.
- NASA orbital imagery, cited science records and source-based distance guides.
- Measured terrain routing within the Jezero DEM window; manual route planning elsewhere.
- User-entered no-go areas, travel estimates, return-budget review and simulated travel.
- Per-mission discoveries with optional JPEG, PNG or WebP photos up to 600 KB, stored in the current browser, with JSON export.

This is a research prototype, not operational astronaut guidance. There is no live Mars tracking, team synchronization or validated spacesuit model. Outside Jezero, terrain clearance is unassessed. Geology is a reference image rather than an aligned routing layer. Adding a new no-go area requires returning to the planning step and reviewing the revised route.

## Troubleshooting

- **Old or wrong page:** use the exact URL printed by your server. Different ports can point to different project copies.
- **Missing packages:** run `npm ci` from the folder containing `package.json`. It installs the versions in `package-lock.json`.
- **NASA imagery unavailable:** try **Reload imagery** or **Global color**. Tile availability depends on your connection and NASA's services.
- **No Jezero route:** check that the base is inside the measured coverage, clear of exclusions and reachable under your slope limit.
- **No manual route:** select distinct endpoints and avoid entered exclusions. Add detour waypoints if needed.
- **Simulation cannot start:** acknowledge the review and ensure the trip fits the entered endurance budget.
- **Notes cannot be saved:** browser storage may be full or blocked. Export existing notes first. Clearing site data deletes locally stored discoveries and exclusions.

## Team workflow

Work on your own branch and open a pull request. Preserve mission IDs, source credits and teammates' contributions. Include the checks you ran and any limitations. Merge shared changes through the team's agreed review process.
