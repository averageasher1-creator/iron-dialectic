/* Plan quotas (Marxism-Leninism): self-check, then headless measurement against the bands in PLAN.md (engine B).
   node tools/quotas.js [--runs 6] [--years 50]
   Bands: the AI lies on 20–50% of misses; exposure ends 10–30% of lying streaks; no state sits above 80 plan
   distortion for more than five years. */
'use strict';
const ID = require('./load.js');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const runs = +arg('runs', 6), years = +arg('years', 50);
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0) + '%';
const month = (G) => { for (let d = 0; d < 30; d++) ID.Game.tick(G); };

{
  let fails = 0; const ok = (c, msg) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + msg); };
  const G = ID.newGame({ scenario: 'meridia', headless: true, difficulty: 'iron', historical: false, seed: 7 });
  G.autoPlayer = true;
  const n = ID.alive(G).find((x) => x.ideo === 'ml'), E = ID.Economy;
  ID.Game.tick(G); while (G.tick % 30) ID.Game.tick(G);
  if (!n.plan) E.startPlan(G, n);
  const p = n.plan;
  ok(p.grain >= 1 && p.arms >= 0 && p.y === 0, 'a plan sets grain ' + E.quotaFmt('grain', p.grain) + ' and arms ' + E.quotaFmt('arms', p.arms) + ' quotas');
  ok(E.quotaTarget(p, 'ind', 5) === p.target && E.quotaTarget(p, 'ind', 1) < p.target, 'the industry quota climbs year by year to the plan target');

  const miss = [{ k: 'ind', real: n.ind, t: n.ind * 1.3 }, { k: 'arms', real: n.a.armsMade, t: n.a.armsMade * 1.3 + 1 }];
  E.lie(G, n, miss);
  ok(n.paper && n.paper.ind === n.ind * 1.3 && n.paperSince === G.tick, 'false figures are booked on paper');
  const calm = E.paperGap(G, n, true);
  n.nwars = 1; G.attacks.push({ from: n.id, to: 1 });
  ok(E.paperGap(G, n, true) > calm * 1.5, 'a war checks the arms books harder (gap ' + calm.toFixed(2) + ' → ' + E.paperGap(G, n, true).toFixed(2) + ')');
  G.attacks.pop(); n.nwars = 0;
  n.plan = null; E.startPlan(G, n);
  ok(n.plan.base >= n.paper.ind - 1e-9, 'the next plan is built on the reported figure (' + Math.round(n.plan.base) + ' vs real ' + Math.round(n.ind) + ')');
  const paper0 = n.paper; E.clearPaper(n);
  ok(Math.abs(n.plan.base - Math.max(1, n.ind)) < 1e-6, 'exposure rebases that plan on the real figures');
  n.paper = paper0; n.paperSince = G.tick;

  n.paper = { ind: n.ind * 0.5 }; Object.assign(n.plan, { start: G.tick - 360, y: 0, base: n.ind * 0.5, target: n.ind * 0.5, lie: 1.3 }); const b0 = n.plan.base; month(G);
  ok(n.plan.base === b0, 'growing into a lie keeps the plan built on it (only exposure rebases it)');
  ok(!n.paper || !n.paper.ind, 'a gap the real figures have caught up with closes on the anniversary');

  const r0 = n.cnt.quotaMiss || 0; n.plan.start = G.tick - 360 * 2 + 30; n.plan.y = 1; n.plan.target = n.ind * 9;
  for (let m = 0; m < 2; m++) month(G);
  ok((n.cnt.quotaMiss || 0) > r0, 'an impossible quota is missed and answered (' + ((n.cnt.lies || 0) > 1 ? 'the AI lied' : 'the AI told the truth') + ')');

  ID.Politics.changeIdeology(G, n, 'socdem', 'reform');
  ok(!n.paper && !n.plan, 'a change of regime clears the plan and the paper');
  if (fails) process.exit(1);
}

let qy = 0, missN = 0, lies = 0, streaks = 0, exposed = 0, longDist = 0, mlYears = 0;
for (let r = 0; r < runs; r++) {
  const G = ID.newGame({ seed: 3 + r * 7919, scenario: r % 2 ? 'random' : 'meridia', headless: true, difficulty: 'iron', historical: !(r % 2) });
  G.autoPlayer = true;
  const hi = {};
  for (let d = 0; d < years * 360; d++) {
    ID.Game.tick(G);
    if (G.tick % 30) continue;
    for (const n of ID.alive(G)) {
      if (!ID.ideo(n).flags.quotas) { hi[n.id] = 0; continue; }
      mlYears += 1 / 12;
      hi[n.id] = n.dist > 80 ? (hi[n.id] || 0) + 1 : 0;
      if (hi[n.id] === 61) longDist++;
    }
  }
  for (const n of G.nations) if (n && n.cnt) { qy += n.cnt.quotaYears || 0; missN += n.cnt.quotaMiss || 0; lies += n.cnt.lies || 0; streaks += n.cnt.paperStreaks || 0; exposed += n.cnt.exposed || 0; }
}
console.log('ML state-years', Math.round(mlYears), '| quota years', qy, '| missed', pct(missN, qy), '| lies', pct(lies, missN), 'of misses (band 20–50%)',
  '| lying streaks', streaks, '| exposures', exposed, '=', pct(exposed, streaks), 'of streaks (band 10–30%) | states above 80 distortion for 5+ years:', longDist);
