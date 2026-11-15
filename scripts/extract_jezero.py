"""Extract a small native-resolution USGS Jezero CTX DEM window.
Run from repository root after downloading the source into .data-cache/jezero-dem.tif.
Requires numpy and tifffile. No interpolation or invented elevations.
"""
import hashlib
import json
import math
from pathlib import Path
import numpy as np
import tifffile

source = Path('.data-cache/jezero-dem.tif')
with tifffile.TiffFile(source) as image:
    metadata = image.geotiff_metadata
    elevation = image.asarray()
assert metadata['ProjCoordTransGeoKey'] == 17
assert metadata['ModelPixelScale'][:2] == [20.0, 20.0]
radius = metadata['GeogSemiMajorAxisGeoKey']
parallel = metadata['ProjStdParallel1GeoKey']
meters_per_degree_y = radius * math.pi / 180
meters_per_degree_x = meters_per_degree_y * math.cos(math.radians(parallel))
origin_x, origin_y = metadata['ModelTiepoint'][3:5]
west, south, east, north = 77.395, 18.425, 77.465, 18.465
left = math.floor((west * meters_per_degree_x - origin_x) / 20)
right = math.ceil((east * meters_per_degree_x - origin_x) / 20)
top = math.floor((origin_y - north * meters_per_degree_y) / 20)
bottom = math.ceil((origin_y - south * meters_per_degree_y) / 20)
window = elevation[top:bottom, left:right].astype(float)
valid = np.isfinite(window) & (window > -10000) & (window < 30000)
# Central-difference slope; any unknown neighbor blocks the cell.
slope = np.full(window.shape, np.nan)
for row in range(1, window.shape[0]-1):
    for column in range(1, window.shape[1]-1):
        if valid[row-1:row+2,column-1:column+2].all():
            dx = (window[row,column+1] - window[row,column-1]) / 40
            dy = (window[row+1,column] - window[row-1,column]) / 40
            slope[row,column] = math.degrees(math.atan(math.hypot(dx,dy)))
def flatten(values):
    return [round(float(value), 3) if np.isfinite(value) else None for value in values.ravel()]
window[~valid] = np.nan
result = {
    'source': 'https://planetarymaps.usgs.gov/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL/M20_JezeroCrater_CTXDEM_20m.tif',
    'sourcePage': 'https://astrogeology.usgs.gov/search/map/mars_2020_science_investigation_ctx_dem_mosaic',
    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'credit': 'USGS Astrogeology / NASA / JPL, Mars 2020 Science Investigation CTX DEM',
    'resolutionMeters': 20,
    'radiusMeters': radius,
    'standardParallel': parallel,
    'originX': origin_x + left * 20,
    'originY': origin_y - top * 20,
    'metersPerDegreeX': meters_per_degree_x,
    'metersPerDegreeY': meters_per_degree_y,
    'width': window.shape[1], 'height': window.shape[0],
    'elevations': flatten(window), 'slopes': flatten(slope),
    'slopeMethod': 'Central differences at native 20 m spacing; 3x3 nodata neighborhood and crop boundary blocked.',
    'limitations': 'Coarse terrain prototype. Subpixel obstacles, soil bearing strength, communications and actual astronaut mobility are not assessed.'
}
Path('src/data/jezero-terrain.json').write_text(json.dumps(result, separators=(',', ':'))+'\n')
print(json.dumps({key:result[key] for key in ['width','height','resolutionMeters','sourceSha256']}))
print('Valid terrain slope cells:', int(np.isfinite(slope).sum()), 'slope range:', float(np.nanmin(slope)), float(np.nanmax(slope)))
