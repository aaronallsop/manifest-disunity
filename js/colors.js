/*
 * Nation colors.
 * Every former state (nation) gets one visually distinct color.
 * Counties inherit the exact color of the nation they belong to.
 *
 * Colors are generated from a golden-angle hue rotation so that the 51
 * nations are well separated around the color wheel. Assignment is keyed
 * by (sorted) state FIPS so the palette is stable between runs.
 */
const Colors = (function () {
  const map = {};

  function assign(stateFipsList) {
    const sorted = [...stateFipsList].sort();
    sorted.forEach((fips, i) => {
      const hue = (i * 137.508) % 360;      // golden angle -> max spread
      const sat = 58 + (i % 3) * 7;         // 58 / 65 / 72
      const light = 56 + (i % 2) * 7;       // 56 / 63
      map[fips] = `hsl(${hue.toFixed(1)}deg ${sat}% ${light}%)`;
    });
  }

  function forState(fips) {
    return map[fips] || '#c9ced6';
  }

  // distinct colors for nations minted during play (annexation fallout, releases)
  let gen = 0;
  function newColor() {
    const i = 51 + gen++;
    const hue = (i * 137.508 + 40) % 360;
    const light = 54 + (i % 2) * 8;
    return `hsl(${hue.toFixed(1)}deg 60% ${light}%)`;
  }

  const reset = () => { for (const k of Object.keys(map)) delete map[k]; gen = 0; };

  return { assign, forState, newColor, map, reset, getGen: () => gen, setGen: (g) => { gen = g | 0; } };
})();
