/* Headless food measurement: how often countries starve, and whether cities pay for themselves.
   node tools/food.js [--runs 4] [--years 40]
   Reports the share of country-months in famine, the share with any shortage, how long famines last,
   and famine share split by how many cities a country has per 100 tiles. */
'use strict';
const ID = require('./load.js');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const runs = +arg('runs', 4), years = +arg('years', 40);
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0) + '%';

/* self-check: a lost harvest empties the granaries first, famine follows only when they are dry, nobody grows meanwhile */
{
  let fails = 0; const ok = (c, msg) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + msg); };
  const G = ID.newGame({ scenario: 'meridia', headless: true, difficulty: 'iron', historical: false, seed: 7 });
  const n = ID.alive(G).sort((a, b) => b.tiles - a.tiles)[0], E = ID.Economy;
  n.laws.trade = 'autarky'; // no grain imports, so only the granaries stand between the harvest and famine
  ID.Game.tick(G); while (G.tick % 30) ID.Game.tick(G);
  const h0 = E.harvest(n);
  ok(n.grain > 0 && !n.famine, 'a country starts with grain in store (' + n.grain.toFixed(1) + ' months)');
  const g0 = n.grain; const cut = (n.foodLand *= 0.7 / h0); // a lost harvest: 70% of need, held there even if the country conquers farmland meanwhile
  let first = -1, grainAtFamine = -1, pop0 = n.pop, grew = false;
  for (let m = 1; m <= 36 && first < 0; m++) {
    for (let d = 0; d < 30; d++) { ID.Game.tick(G); n.foodLand = cut; if (m > 1 && n.pop > pop0 + 1e-6) grew = true; pop0 = n.pop; }
    if (n.famine && first < 0) { first = m; grainAtFamine = n.grain; }
  }
  ok(first > 1, 'the stores hold off famine for ' + first + ' months after a bad harvest (70% of need)');
  ok(grainAtFamine < 0.01, 'famine starts only once the granaries are empty');
  ok(!grew, 'population does not grow while the harvest is short (from the first monthly harvest on)');
  ok(E.harvest(n) < h0 && g0 > 0, 'harvest fell from ' + Math.round(h0 * 100) + '% to ' + Math.round(E.harvest(n) * 100) + '%');
  if (fails) process.exit(1);
}
let lsSum = 0, stabSum = 0, popEnd = 0, troopsEnd = 0, months = 0, famine = 0, short = 0, starts = 0, grainSum = 0;
const byCity = { low: [0, 0], mid: [0, 0], high: [0, 0] };
const spells = [];
for (let r = 0; r < runs; r++) {
  const G = ID.newGame({ seed: 11 + r * 7919, scenario: r % 2 ? 'random' : 'meridia', headless: true, difficulty: 'iron', historical: !(r % 2) });
  G.autoPlayer = true;
  const run = {};
  for (let d = 0; d < years * 360; d++) {
    ID.Game.tick(G);
    if (G.tick % 30) continue;
    for (const n of ID.alive(G)) {
      months++;
      if (n.famine) famine++;
      if (n.foodBal < 1) short++;
      grainSum += n.grain || 0; lsSum += n.ls; stabSum += n.stab;
      if (n.famine === 1) starts++;
      if (n.famine) run[n.id] = (run[n.id] || 0) + 1; else if (run[n.id]) { spells.push(run[n.id]); run[n.id] = 0; }
      const c = n.nb[ID.B.CITY] / Math.max(1, n.tiles / 100), k = c < 0.6 ? 'low' : c < 1.2 ? 'mid' : 'high';
      byCity[k][0]++; if (n.famine) byCity[k][1]++;
    }
  }
  for (const n of ID.alive(G)) { popEnd += n.pop / runs; troopsEnd += n.troops / runs; }
}
spells.sort((a, b) => a - b);
console.log('country-months', months, '| famine', pct(famine, months), '| food short', pct(short, months), '| famines started', starts,
  '| median famine', spells[spells.length >> 1] || 0, 'months | mean grain', (grainSum / months).toFixed(2), 'months | world pop', Math.round(popEnd), 'troops', Math.round(troopsEnd), '| mean ls', (lsSum / months).toFixed(1), 'stab', (stabSum / months).toFixed(1));
for (const k in byCity) console.log('  cities ' + k.padEnd(4), 'famine', pct(byCity[k][1], byCity[k][0]), 'of', byCity[k][0]);
