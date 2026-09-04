/*
 * Connecticut normalisation — the one place the pre-2022 CT counties are mapped.
 *
 * Three data files disagree about what Connecticut is:
 *   data/counties-10m.json   the eight pre-2022 COUNTIES (09001 … 09015)
 *   data/game-data.json      the nine 2022 PLANNING REGIONS (09110 … 09190)
 *   data/areas.json          no 09* entries at all
 *
 * So `Game.areaIdOf('09001')` returns '09001' unchanged — the alias table has
 * nothing to say about it. Any mesh predicate keyed on `areaIdOf` alone sees
 * eight distinct CT keys and draws eight interior boundaries, while the nine
 * coloured fills come from ct-planning-regions.geojson. The lines and the fills
 * are different shapes.
 *
 * Two consequences, and the renderer needs both:
 *   1. `baseGeomToArea` collapses an old-CT county onto its planning region, so
 *      the nation-border mesh and the nation outline agree with ownership.
 *   2. The AREA-border layer cannot be fixed by a predicate at all — the
 *      topology only holds the old county polygons, so every arc it emits inside
 *      CT follows an old county edge. CT is excluded from that mesh and drawn
 *      from the planning-region geojson instead.
 */

/** old CT county FIPS -> the 2022 planning region that now carries its ownership */
export const OLD_CT_TO_REGION = {
  '09001': '09190', // Fairfield        -> Western Connecticut
  '09003': '09110', // Hartford         -> Capitol
  '09005': '09160', // Litchfield       -> Northwest Hills
  '09007': '09130', // Middlesex        -> Lower Connecticut River Valley
  '09009': '09170', // New Haven        -> South Central Connecticut
  '09011': '09180', // New London       -> Southeastern Connecticut
  '09013': '09110', // Tolland          -> Capitol
  '09015': '09150', // Windham          -> Northeastern Connecticut
};

/** The nine 2022 planning regions, which are what the model and the fills use. */
export const CT_REGIONS = [
  '09110', '09120', '09130', '09140', '09150', '09160', '09170', '09180', '09190',
];

export const OLD_CT = new Set(Object.keys(OLD_CT_TO_REGION));

/**
 * Base-geometry id -> Area id.
 * @param {string} id a county id from data/counties-10m.json
 * @param {(f:string)=>string} areaIdOf normally Game.areaIdOf
 */
export function baseGeomToArea(id, areaIdOf) {
  return areaIdOf(OLD_CT_TO_REGION[id] || id);
}

export default { OLD_CT_TO_REGION, CT_REGIONS, OLD_CT, baseGeomToArea };
