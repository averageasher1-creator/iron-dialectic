/* The specialization engines (js/data/engines.js): self-check, then headless measurement against PLAN.md.
   node tools/engines.js [--runs 8] [--years 50]
   Self-check: every system with an engine is forced onto a state that then runs four years; every new action
   and dispatch runs once; every forbidden verb says no. Soak: what the engines did, and whether any one
   chain system (trot, pannat, technosoc, revival) spread to more than a quarter of the living states. */
'use strict';
const ID = require('./load.js');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const runs = +arg('runs', 8), years = +arg('years', 50), seed0 = +arg('seed', 17);
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0) + '%';
const months = (G, m) => { for (let d = 0; d < m * 30; d++) ID.Game.tick(G); };

const SYS = ['trot', 'council', 'mao', 'marketsoc', 'demsoc', 'ansyn', 'ancom', 'liberal', 'socdem', 'minarchy', 'conmon', 'absmon', 'theocracy', 'agrarian',
  'junta', 'corporatist', 'technocracy', 'personalist', 'merchant', 'cybernetic', 'natpop', 'thirdpos', 'pannat', 'revival', 'juche', 'natsyn', 'technosoc', 'nrx', 'natsoc'];
const NEW_EVENTS = ['ju_deadline', 'tc_replaced', 'ms_square', 'table', 'co_motions', 'tp_offers', 'pe_test', 'ag_harvest', 'ag_consent', 'inst_turn', 'nsy_capital', 'heir_edu', 'mi_company', 'tr_chain_thermidor', 'pn_schism'];
if (!process.env.ID_SKIP && !process.env.ID_FORBID_OFF && !process.env.ID_ENG_OFF) { // experiments that switch parts off skip the self-check
  let fails = 0; const ok = (c, msg) => { if (!c) fails++; if (!c || process.argv.includes('--verbose')) console.log((c ? 'ok   ' : 'FAIL ') + msg); };
  const engineActs = new Set(); for (const k in ID.DOCTRINE) for (const a of ID.DOCTRINE[k].acts) engineActs.add(a.id);
  for (const ideo of SYS) {
    const G = ID.newGame({ scenario: 'random', headless: true, difficulty: 'iron', seed: 5 + SYS.indexOf(ideo) });
    G.autoPlayer = true;
    const n = ID.alive(G).sort((a, b) => b.tiles - a.tiles)[1];
    let err = null;
    try {
      ID.Politics.changeIdeology(G, n, ideo, 'reform');
      months(G, 2);
      // every action of the doctrine, once, with the means to pay
      for (const a of ID.DOCTRINE[ideo].acts) { n.gold = 2000; n.auth = 100; n.cd['dc_' + a.id] = 0; ID.Doctrine.run(G, n, a.id); }
      months(G, 46);
    } catch (e) { err = e; }
    ok(!err, ideo.padEnd(12) + ' four years with every action' + (err ? ': ' + err.stack.split('\n').slice(0, 3).join(' | ') : ''));
    if (n.alive && n.ideo === ideo) {
      const rows = ID.DOCTRINE[ideo].extra ? ID.DOCTRINE[ideo].extra(n, G) : [];
      ok(Array.isArray(rows) && rows.every((r) => r.length >= 2 && typeof r[1] === 'string'), ideo.padEnd(12) + ' State panel rows render (' + rows.length + ')');
    }
  }
  // every new dispatch resolves for an AI state with any context it needs
  const G = ID.newGame({ scenario: 'random', headless: true, difficulty: 'iron', seed: 99 }); G.autoPlayer = true;
  const ctxOf = { table: (n) => ({ sys: 'socdem', seats: ['unions', 'employers', 'treasury'], dem: [0, 1, 0] }), co_motions: () => ({ m: [1, 2, 3] }), inst_turn: () => ({ key: 'mao' }), pe_test: (n) => ({ seat: n.circle[0].seat, name: n.circle[0].name, loy: 20 }), ju_deadline: () => ({ post: 3 }) };
  const sysOf = { table: 'socdem', co_motions: 'council', inst_turn: 'mao', pe_test: 'personalist', ju_deadline: 'junta', tc_replaced: 'technocracy', ms_square: 'marketsoc', tp_offers: 'thirdpos', ag_harvest: 'agrarian', ag_consent: 'agrarian', nsy_capital: 'natsyn', heir_edu: 'absmon', mi_company: 'minarchy', tr_chain_thermidor: 'trot', pn_schism: 'pannat' };
  for (const id of NEW_EVENTS) {
    let err = null; const n = ID.alive(G).filter((o) => o.id !== G.player)[NEW_EVENTS.indexOf(id) % 6];
    try { if (n.ideo !== sysOf[id]) ID.Politics.changeIdeology(G, n, sysOf[id], 'reform'); months(G, 1); ID.Regime && ID.Regime.ensure(G, n); n.gold = 500; n.auth = 60; ID.Events.queue(G, n, id, ctxOf[id] ? ctxOf[id](n) : {}); months(G, 1); } catch (e) { err = e; }
    ok(!err && ID.Events.def(id), 'dispatch ' + id.padEnd(18) + (err ? err.stack.split('\n').slice(0, 2).join(' | ') : ''));
  }
  // forbidden verbs say no, with the system's own reason
  const H = ID.newGame({ scenario: 'random', headless: true, difficulty: 'iron', seed: 3 });
  const [a, b] = ID.alive(H).sort((x, y) => y.tiles - x.tiles);
  const as = (ideo) => { ID.Politics.changeIdeology(H, a, ideo, 'reform'); ID.Doctrine.ensure(H, a); return a; };
  ok(/joins no bloc/.test(ID.Diplomacy.evalProposal(H, as('thirdpos'), b, 'ally').why), 'Third Positionism cannot join a bloc');
  ok(/builds no works/.test(ID.canBuild(H, as('minarchy'), a.capital, ID.B.FACTORY)) && !/night-watchman/.test(ID.canBuild(H, a, a.capital, ID.B.FORT)), 'Minarchism builds forts but no works');
  ok(/draft/.test(ID.Politics.lawAllowed(H, as('ansyn'), 'recruit', 'conscription')) && !ID.Politics.lawAllowed(H, a, 'recruit', 'militia'), 'Anarcho-Syndicalism explains why it has no draft, and keeps its militia');
  ok(/censor/.test(ID.Politics.lawAllowed(H, as('technocracy'), 'press', 'censored')), 'Technocracy cannot censor');
  ok(/thaw/i.test(ID.Events.decisionBlock(H, as('mao'), ID.Events.decision('thaw'))), 'Maoism cannot thaw');
  as('liberal'); ok(!ID.Events.options(H, a, ID.Events.def('emergency_offer'), {}).some((o) => (o.fx || []).some((f) => f[0] === 'emergency' && f[1])), 'Classical Liberalism is never offered emergency rule');
  as('natpop'); a.a.coreLost = 0.2; ok(/never sign away/.test(ID.Diplomacy.evalProposal(H, a, b, 'peace').why), 'National Populism makes no peace while the enemy holds its land');
  // the twists do what they say
  const T = ID.newGame({ scenario: 'random', headless: true, difficulty: 'iron', seed: 8 }); T.autoPlayer = true;
  const s = ID.alive(T).sort((x, y) => y.tiles - x.tiles)[2];
  ID.Politics.changeIdeology(T, s, 'liberal', 'reform'); months(T, 1);
  s.sigx.pl = [{ id: 'peace', at: T.tick, due: T.tick + 30, v: 0, bad: true }]; s.electionAt = T.tick + 30; const el0 = s.cnt.elections || 0;
  months(T, 1);
  ok(s.mods.some((m) => m.label === 'A promise broken' && m.k === 'vote' && m.v < 0) && s.electionAt > T.tick, 'a broken liberal promise counts against the vote at the election it was due for');
  ID.Politics.changeIdeology(T, s, 'socdem', 'reform'); months(T, 1);
  const c = { sys: 'socdem', seats: ['unions', 'employers', 'treasury'], dem: [0, 0, 0] };
  ID.Events.applyFx(T, s, ID.Events.options(T, s, ID.Events.def('table'), c)[1].fx, c);
  ok(s.sigx.gr.employers >= 1 && !s.sigx.gr.unions, 'refusing the employers gives them a grudge; the unions, granted, carry none');
  ID.Politics.changeIdeology(T, s, 'demsoc', 'reform'); months(T, 1);
  if (s.ideo === 'demsoc') { s.sigx.patience = -1; months(T, 1); ok((s.cnt.demsocCoup || 0) >= 1, 'democratic socialism out of patience: the officers move'); }
  ID.Politics.changeIdeology(T, s, 'socdem', 'reform'); s.laws.labor = 'company'; ID.applyIdeology(T, s, 'socdem');
  ok(s.laws.labor !== 'company', 'a new system drops a law it forbids');
  ID.Politics.changeIdeology(T, s, 'theocracy', 'reform'); months(T, 1); s.laws.trade = 'free'; s.auth = 100; s.cd.dc_th_usury = 0; ID.Doctrine.run(T, s, 'th_usury');
  ok(s.laws.trade !== 'free', 'the edict against usury ends free trade at once');
  s.flags.edict_war = 1; const th2 = ID.alive(T).find((o) => o !== s);
  ID.Politics.changeIdeology(T, th2, 'theocracy', 'reform');
  ok(!/unbeliever/.test(ID.Diplomacy.evalProposal(T, s, th2, 'nap').why || ''), 'holy war still allows a pact with a fellow theocracy');
  // peace by ideology (sim/diplomacy.js: D.terms, D.dictate, the monthly tribute)
  const Q = ID.newGame({ scenario: 'random', headless: true, difficulty: 'iron', seed: 12 }); Q.autoPlayer = true;
  const [w1, l1, l2, l3] = ID.alive(Q).sort((x, y) => y.tiles - x.tiles), Dq = ID.Diplomacy;
  ID.Politics.changeIdeology(Q, w1, 'liberal', 'reform'); const d0 = l1.debt || 0, g0 = w1.gold;
  ok(/reparations/.test(Dq.terms(Q, w1, l1, 0.5)) && l1.debt > d0 && w1.gold > g0, 'a liberal victor takes reparations, which the loser borrows');
  ID.Politics.changeIdeology(Q, w1, 'absmon', 'reform'); Dq.terms(Q, w1, l2, 0.5); l2.rev = 100; const gw = w1.gold, gl = l2.gold; Dq.month(Q);
  ok(l2.trib && l2.trib.to === w1.id && w1.gold > gw && l2.gold < gl, 'a monarch takes tribute, paid every month');
  ID.Politics.changeIdeology(Q, w1, 'liberal', 'reform'); Dq.startWar(Q, w1, l3, 'none');
  ok(Dq.dictate(Q, l3, w1) && l3.alive && l3.dep && l3.dep.kind === 'treaty' && l3.dep.over === w1.id, 'a liberal capitulation leaves the loser alive, as a treaty state with our bases');
  if (fails) process.exit(1);
  console.log('self-check passed: ' + SYS.length + ' systems, ' + NEW_EVENTS.length + ' dispatches, 7 forbidden verbs');
}

const K = ['reparations', 'tributes', 'dictated', 'pledgeKept', 'pledgeBroken', 'demsocCoup', 'prerog', 'postponed', 'colonelsCoup', 'fcHit', 'fcMiss', 'square', 'gdHit', 'gdMiss', 'ceoOut', 'tables', 'motionPass', 'motionFail', 'tpCaught',
  'gstrikes', 'instUsed', 'instReined', 'instTurned', 'heirReigns', 'heirCrisis', 'marriages', 'inheritClaims', 'occOrders', 'charters', 'routes', 'routesCut', 'guidance', 'holyTaken', 'links', 'chainBroken', 'schism'];
const CHAINED = ['trot', 'pannat', 'technosoc', 'revival']; // the chain engine's systems: the snowball guard is about them
const tot = {}; let snow = 0, games = 0, maxShare = 0; const yrs = {};
for (let r = 0; r < runs; r++) {
  const G = ID.newGame({ seed: seed0 + r * 7919, scenario: r % 2 ? 'random' : 'meridia', headless: true, difficulty: 'iron', historical: !(r % 2) });
  if (!(r % 2)) G.rng = new ID.RNG((seed0 + r * 7919) >>> 0); // the scenario fixes its seed, so a historical run only differs if its history is reseeded
  G.autoPlayer = true; games++;
  let big = 0;
  for (let y = 0; y < years; y++) {
    months(G, 12);
    const A = ID.alive(G), c = {}; for (const o of A) { c[o.ideo] = (c[o.ideo] || 0) + 1; yrs[o.ideo] = (yrs[o.ideo] || 0) + 1; }
    for (const k of CHAINED) if (c[k] && A.length >= 8) { const s = c[k] / A.length; if (s > maxShare) maxShare = s; if (s > 0.25) big = 1; }
  }
  snow += big;
  for (const n of G.nations) if (n && n.cnt) for (const k of K) tot[k] = (tot[k] || 0) + (n.cnt[k] || 0);
}
console.log('games', games, '| a chain system above 25% of states in', snow, 'games (band: at most 1 in 10) | its largest share', pct(maxShare, 1), '| compare state-years with ID_SKIP=engines');
console.log('pledges kept', pct(tot.pledgeKept, tot.pledgeKept + tot.pledgeBroken), '(band 50–80%) |', Object.keys(tot).map((k) => k + ' ' + tot[k]).join(', '));
console.log('state-years by system:', Object.keys(yrs).sort((a, b) => yrs[b] - yrs[a]).map((k) => k + ' ' + yrs[k]).join(', '));
