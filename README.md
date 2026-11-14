# Apollos — shared team foundation
React + TypeScript + Vite + OpenLayers. Two starting modules: Perseverance (Jezero) and Curiosity (Gale / Mount Sharp).

Open this project
The repository is the Martian-Map-Challenge folder inside the NASA Hackathon workspace. Open that folder in your editor. Changes are local on feature/otis until committed and pushed; they do not appear on GitHub automatically.

Run
Node.js 22+ recommended. Run npm install, then npm run dev. Open the local URL printed by Vite. npm run build checks TypeScript and builds to dist/.

Where teammates work
src/App.tsx: shared page layout, mission selector and section navigation.
src/components/MissionMap.tsx: OpenLayers map with verified NASA Mars Trek regional and global imagery.
src/data/missions.ts: mission catalog and required source links. Add missions using the same structure.
src/types.ts: shared Mission, Discovery and RouteRequest contracts. Coordinates are [east longitude, north latitude] in Mars degrees, not Earth WGS84.
src/styles.css: shared responsive styling.
prototype/: preserved earlier plain-JavaScript experiment. Its routing tests run with npm test; these are not tests of the new map or real terrain. Run node prototype/server.js to view that separate experiment on port 3000.
Current scope
Functional mission switching, NASA orbital imagery, scientific exploration records, source-backed image panels and a historical Curiosity route animation. Validated route planning, discovery uploads, authentication and Supabase remain future chunks. Worldview is Earth-only and is listed as an interaction reference.

The map shows approximate landing locations over Mars orbital imagery. It does not calculate elevation, slope or safe astronaut routes. Each routing dataset must declare its projection, resolution, provenance and no-data handling before calculations use it.

Team integration
Build the foundation on feature/otis, review it through a pull request, then merge into main with team approval. Teammates can branch from the accepted foundation and implement separate components/data modules. Avoid editing the shared App layout for every mission: select mission data by ID and reuse components. Agree contract changes before merging.

Suggested next chunks: precise destination coordinates; measured-terrain route planning; discovery forms and photo storage. Keep secrets in ignored .env files, never source control.

Sourced imagery and exploration content (0.2)
The map now loads real NASA Mars Trek WMTS imagery: Viking global color, a controlled HiRISE Jezero mosaic, and the Gale CTX mosaic. src/data/trek-layers.json contains metadata verified against NASA GetCapabilities on 2026-11-14, including coverage, tile sizes, matrix widths and zoom limits. Grid resolutions derive from the 360-degree world and published matrix widths, not terrestrial scale denominators. No Earth reprojection or Earth distance calculation is used. Regional tiles require an internet connection; partial availability and errors are shown in the UI.

src/data/exploration.ts contains cited scientific summaries and media provenance. public/media/ contains the NASA route GIF and still, Perseverance Mastcam-Z sampling mosaic, a WATSON raw image, and the USGS SIM 3464 geological-map preview. Exact download URLs are preserved in public/media/sources.json; captions, credits, dates and source pages are rendered with the images. Images are included as provided by NASA/USGS (web-sized variants where available), not AI-generated. The geology sheet is a reference image with its original legend, not a georeferenced hazard overlay.

Exploration areas: Jezero delta, Wildcat Ridge, Skinner Ridge; Yellowknife Bay, Pahrump Hills and Vera Rubin Ridge. These are sourced records, not precise waypoints. Do not infer coordinates from gallery images. The supplied Mount Sharp animation is a 2019 proposed route, not a current traverse or astronaut route. WATSON sol 1934 is not assigned to a map position. Worldview supplies Earth observations only and remains a design/reference link.

Code formatting
Run npm run format before sharing changes. Run npm run format:check to check formatting without modifying files. The shared Prettier configuration uses two-space indentation, single quotes and semicolons. Generated files, dependencies and downloaded media are excluded.
