# Apollos — shared team foundation

React + TypeScript + Vite + OpenLayers, with eight integrated mission catalogs and a Jezero navigation pilot.

## Open and run

Open the `Martian-Map-Challenge` folder inside `C:/Users/otiso/Documents/KNUST/Year2/First Semester/Nasa Space Apps Hackathon`. Changes are local on `feature/otis` until committed and pushed; they do not appear on GitHub automatically. Run `npm install`, then `npm run dev`. `npm run build` checks TypeScript and creates `dist/`. Run `npm test` for routing and budgeting tests, `npm run format` for Prettier, and `npm run format:check` before sharing.

## Team integration

Review this foundation through a pull request and merge into main only with team approval. Add mission data by ID and reuse components. Agree shared contract changes before merging. Keep secrets in ignored `.env` files.

- `src/App.tsx`: shared layout and mission/section selection.
- `src/components/MissionMap.tsx`: Mars Trek imagery and route/position overlays.
- `src/components/NavigationDemo.tsx`: measured-terrain navigation pilot.
- `src/components/TraversePlanner.tsx`: manual candidate planning and budgets.
- `src/planning/`: routing, movement and budgeting logic with tests.
- `src/data/`: mission catalog, scientific records and terrain provenance.
- `src/types.ts`: shared contracts; coordinates are east longitude and north latitude in Mars degrees, not Earth WGS84.
- `prototype/`: preserved separate synthetic experiment; `node prototype/server.js` runs it on port 3000. Its tests do not validate the real terrain.

Discovery uploads, photo storage, authentication and operational route validation remain future chunks.

## Sourced imagery and exploration content

NASA Mars Trek WMTS supplies Viking global color, a controlled HiRISE Jezero mosaic and the Gale CTX mosaic. `src/data/trek-layers.json` preserves metadata verified against NASA GetCapabilities on 2026-11-14. Grid resolution derives from published matrix widths and the 360-degree Mars world, not Earth scale denominators. Regional tiles require internet; loading failures appear on the map.

`src/data/exploration.ts` contains cited scientific summaries. `public/media/` contains NASA's Curiosity route animation and still, a Perseverance sampling mosaic, WATSON raw image, USGS SIM 3464 geology preview and dated Earth reference imagery. Exact media URLs are in `public/media/sources.json`. These are sourced images, not generated imagery. The geology sheet is a reference with its original legend, not a georeferenced hazard layer.

Exploration records cover Jezero delta, Wildcat Ridge, Skinner Ridge, Yellowknife Bay, Pahrump Hills and Vera Rubin Ridge. They are scientific records, not precise waypoints. The Mount Sharp animation is a 2019 proposed rover route, not astronaut guidance. WATSON imagery is not assigned an inferred map location.

All five organizer resources are represented: Mars Trek, USGS geological maps, NASA's Mount Sharp route, NASA Worldview and Perseverance raw images. Worldview/GIBS contributes a dated Earth-only reference image and interaction example; Earth observations never feed Mars calculations.

## Manual traverse workbench

Open Routes to place a hypothetical base and up to 20 waypoints, or enter Mars coordinates. Candidates A and B share a base and editable assumptions. Drafts persist per mission in the browser. Export produces a JSON planning brief with inputs, assessments, source links and unresolved evidence. No server or API key is required.

Operational defaults are demonstration assumptions; organizers supplied no walking-speed, oxygen, battery, suit or reserve limits. A 50 km input scope limit is not a safe exploration radius. Approximate rover landing points are hypothetical bases, never actual astronaut habitats.

Manual distance sums spherical surface arcs using Mars mean radius 3389.5 km, excluding elevation and terrain detours. Time includes outward travel, science, retracing the path and contingency. Uncertainty multiplies travel only. Oxygen, battery and entered daylight each protect the selected reserve; the smallest usable duration limits the plan. Headroom rounds down and required durations round up. The manual planner does not sample the Navigate terrain grid or calculate illumination or communications.

## Guided Jezero navigation

Choose Perseverance, then Navigate. A candidate path connects an editable hypothetical base to the published Three Forks study-site center. Simulated movement updates position, distance and ETA, with pause/resume, walking-speed changes, science stops and return-to-base. Position is simulated, never GPS or live Mars telemetry. Gale navigation awaits a verified elevation grid and destination.

`src/data/jezero-terrain.json` is a native 20 m, 198 by 120 crop of the [USGS CTX DEM](https://planetarymaps.usgs.gov/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL/M20_JezeroCrater_CTXDEM_20m.tif). Source projection is Mars spherical equirectangular, radius 3396190 m, standard parallel 18.4663 degrees. Metadata preserves the source URL, projection, crop origin and SHA256. Reproduce by downloading the source to `.data-cache/jezero-dem.tif`, installing Python numpy and tifffile, and running `python scripts/extract_jezero.py` from the repository root. The original raster is ignored; the extracted grid is bundled.

Central-difference slopes require a valid 3 by 3 neighborhood. Unknown cells and crop boundaries are blocked. A* rejects excessive cell and inter-cell slopes, prevents diagonal corner-cutting and penalizes steeper travel. Distance includes elevation differences. Endpoints snap to cell centers, up to about 14 m. The default approximately 2.39 km candidate at a 10-degree threshold is a demonstration, not a cleared traverse.

Destination coordinates come from [LPSC 2023 paper 2618](https://www.hou.usra.edu/meetings/lpsc2023/pdf/2618.pdf): 18.45369687 N, 77.41359752 E, a proposed landing-site center near Three Forks. This is not an individual sample-tube location. The [NASA depot map](https://science.nasa.gov/resource/perseverances-three-forks-sample-depot-map/) provides context.

The simulated return budget protects 25% of editable endurance and includes 30 minutes contingency. Outbound projection includes a planned 30-minute science stop; at arrival the stop button charges elapsed simulation time. Pausing freezes the simulated clock. Public datasets need no API key.

The 20 m grid cannot resolve rocks, soil strength, shadows, radiation, communications or crew capability. These remain evidence gaps and no candidate receives a safe/approved verdict. Real positioning requires a mission localization feed. Tests cover measured-grid constraints, blocked cells, interpolation, movement transitions, Mars distances and resource accounting.

## Team consolidation (0.5)

This checkout is the combined working project on feature/otis. Restored mission records from commits 7a1a840 (Pathfinder/Phoenix) and 0587244 (Spirit/Opportunity), preserved the latest InSight/Viking 1 modules and media, and integrated the original OneDrive project's Routes and Navigate components. No shared branch was changed. The earlier OneDrive project remains intact.

Eight missions are selectable: Perseverance, Curiosity, Pathfinder/Sojourner, Phoenix, Spirit, Opportunity, InSight and Viking 1. Pathfinder and Phoenix restore their regional imagery, location markers, evidence panels and photo records. InSight, Viking 1, Spirit and Opportunity use global imagery. Spirit/Opportunity scientific records are restored; unverified loose image downloads remain preserved but are not presented as sourced mission media. Opportunity's east longitude is normalized to -5.52583 degrees for the map's -180 to 180 range.

Navigate is enabled only for the measured Jezero pilot. Routes provides manual planning for every mission, without implying terrain clearance. Discovery recording remains the next separate feature. Formatting targets app source and project configuration, preserving downloaded third-party pages and assets untouched.

## Guided exploration experience (0.6)

The home screen now presents Jezero as the guided demonstration and Gale as a science reference. The eight rover/lander catalogs remain in Mission library, with the manual comparison tool under an expandable advanced section. The main path is Objective → Plan → Review → Traverse; one map stays beside the current task.

Jezero's proposed objective is surface reconnaissance around the published Three Forks study-site center. Regional imagery is explicitly not labeled as a photograph of that destination. Planning accepts a base by map click or numerical coordinates, with slope, walking speed and endurance assumptions. Departure into the simulation requires a review acknowledgment and a modeled round trip that fits the protected budget. Returning to a previous step or leaving the workspace pauses movement. The current plan stays in memory while navigating the app; refreshing resets it.

The field notebook stores up to 20 observations locally, each with a title, observation, timestamp, simulated Mars coordinates and optional JPEG/PNG/WebP photo up to 600 KB. Records can be exported as JSON including photos, removed, or restored with Undo while the notebook stays open. Saved notes appear on the map and survive refresh on the same browser origin. Browser storage limits are handled without clearing the form or overwriting unreadable records. This is not cloud storage or team synchronization. Unsaved form drafts are not retained after closing the notebook.

New styling lives in src/workflow.css. NavigationDemo owns the staged workflow and delegates observation entry to FieldNotebook; journal.js validates and stores records. Existing NASA/USGS sources remain available in the evidence drawer and library. No third independent science-data layer, rock-clearance validation or live Mars localization has been added.

## Exclusions and all-mission planning (0.7)

All eight mission catalogs now open the shared Objective / Plan / Review / Traverse workflow directly from Explore or Mission library. Teammate mission modules, science records and imagery are retained. Each visited mission retains its in-memory plan while switching within the app; saved exclusions and observations use separate browser-storage keys. The existing Jezero notebook key is preserved.

Jezero retains measured DEM routing, with manual circular exclusions conservatively expanded by the raster-cell half-diagonal. The other seven regions support manual candidate paths with detour waypoints, segment-level intersection checks against entered exclusions, time/reserve review, simulated movement, return-to-base and field records. They do NOT borrow Jezero elevations or invent flat terrain. Their elevation profiles and slope controls are absent. A separate hypothetical base must be selected; the former arbitrary 10 km landing-radius limit has been removed; the default destination is the mission's approximate landing reference, not the precise feature named by a scientific objective.

No-go areas have a title, reason, optional HTTPS evidence link, radius (5–2000 m), center and creation time. All are visibly labeled manual boundaries, even when linked to NASA evidence. Historical NASA/JPL cautions for soft soil, sand, rocks and disturbed ground appear in the evidence drawer. No exact obstacle footprints are invented from those reports. A candidate that intersects an entered exclusion cannot start rehearsal. Manual paths need a revised base or detour points; only Jezero can automatically recalculate against its measured grid.

Route-review export records mission, objective, route, model, assumptions, exclusions, sources and unresolved hazards. Saved exclusions fail closed if corrupted or mismatched to a mission. Unknown rock clearance, bearing strength, light, radiation, communications and evacuation alternatives remain unresolved. No API keys or external writes are needed. Visual redesign is deferred until these functional workflows are reviewed.

Maps now show optional 1, 2, 5 and 10 km distance rings centered on the planned base (or landing reference before planning), plus a zoom-dependent horizontal scale at map center. These use a Mars spherical radius, represent surface distances rather than terrain-following walking distances, and do not designate safe areas. Jezero routing remains limited to the measured DEM coverage.

Distance verification (15 November 2026): `src/data/distance-provenance.json` records live NASA WMTS matrix geometry and the checksum-verified source GeoTIFF metadata. Distances use its Mars 2000 sphere (radius 3,396,190 m). The prior mean-radius model differed by approximately 0.197%. Pathfinder and Phoenix zoom matrices now match the live service (maximum index 16). Scale width uses spherical geometry at map-center latitude, not an Earth default or a fixed pixel-to-meter conversion. Distances remain reference-surface estimates; terrain relief, image registration and approximate landing coordinates limit physical accuracy.
