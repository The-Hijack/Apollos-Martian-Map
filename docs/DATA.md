# Data and limitations

## Organizer resources

- [JPL Mars Trek](https://trek.nasa.gov/mars/) supplies orbital tiles. Capability URLs and tile geometry are in `src/data/trek-layers.json`.
- [USGS planetary mapping](https://astrogeology-usgs.hub.arcgis.com/pages/interactive-maps-mars) provides geology. The Jezero sheet is a reference image, not a registered hazard overlay.
- [Curiosity's proposed Mount Sharp route](https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/) is a historical rover-route illustration, not a current astronaut route.
- [NASA Worldview](https://worldview.earthdata.nasa.gov/) is an Earth-only interface reference. Its imagery never feeds Mars hazard calculations.
- [Perseverance raw images](https://mars.nasa.gov/mars2020/multimedia/raw-images/) provides surface imagery. Images are not assigned map positions without verified coordinates.

Image credits and original URLs are recorded in `public/media/sources.json` and the mission media catalogs.

## Measurement model

`src/data/distance-provenance.json` records NASA tile metadata checked on 15 November 2026 and the original terrain file's verified SHA-256. That GeoTIFF specifies a Mars 2000 sphere with radius **3,396,190 m**, standard parallel **18.4663°**, and **20 m** pixels.

Rings and manual-route distances use this sphere. The scale bar accounts for map-center latitude and zoom. These are reference-surface estimates, not surveyed walking distances. Relief, registration errors, approximate landing coordinates and detours affect physical accuracy.

Jezero routing uses a cropped native-resolution [USGS/NASA/JPL DEM](https://planetarymaps.usgs.gov/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL/M20_JezeroCrater_CTXDEM_20m.tif). Unknown cells, slopes above the selected limit and manual exclusions are blocked. Exclusions include a cell half-diagonal clearance; route endpoints snap to cell centers. The raster does not resolve every rock or establish soil strength.

## Rebuild the terrain extract (optional)

The grid is committed; these steps are not required to run the app.

1. Install Python with `numpy` and `tifffile`.
2. Download the original GeoTIFF linked above into `.data-cache/jezero-dem.tif` at the repository root.
3. Run `python scripts/extract_jezero.py` from the root.
4. Review `src/data/jezero-terrain.json`, verify provenance and run `npm run check`.

Keep the original raster out of Git. Document any replacement or resampling before changing the source model.

## Storage and safety scope

Notes and exclusions are stored separately for each mission in browser local storage. Photos remain local; there is no server upload, authentication or synchronization. Export JSON before clearing storage or moving to another browser.

Speeds, endurance and reserves are demonstration inputs, not NASA spacesuit requirements. Radiation, real-time weather, communications, evacuation alternatives and complete obstacle clearance are unassessed. `prototype/` uses synthetic terrain; its tests do not validate Mars conditions. Run it separately with `node prototype/server.js` if needed for research.
