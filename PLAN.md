# Plan: ideological specialization (v2)

Goal: make play itself, not just the numbers, depend on the country's system. Today all 31 doctrines share one
shape: a gauge, three to five actions that spend authority or gold to nudge the gauge and a modifier, a war trait
and a war order. Only the four accelerated systems (`js/data/accel.js`) have `month` mechanics of their own. The
actions differ in flavour, not in kind: almost every one is "pay, then +gauge and a timed modifier".

v1 (commit f5b0697) listed a good idea per system. v2 changes three things:

1. **Nine shared engines instead of thirty one-offs.** Each system gets one primary engine, configured with its own
   data. One engine built well covers four to eight systems, and every system is still covered. Each system on a
   shared engine also gets a **twist**: a rule of its own, so twins never play as reskins.
2. **Built on what already exists.** The Five-Year Plan already has a target (`n.plan.target`), plan distortion
   (`n.dist`) is already a stat, the council already tables motions (`n.a.mot`), elections already have a mandate,
   the monarchy has favourites, the junta can return to barracks, National Populism already promises the lost
   provinces (`np_promise`) and National Socialism already purges its street army (`ns_knives`).
3. **A fun gate every mechanic must pass**, taken from the design notes (Interesting Decisions, Iron Dialectic
   Lessons, Grand Strategy Design), plus a headless metric for each engine.

## Principles (kept from v1)

- **A decision every year or two of game time, never bookkeeping.** No new number unless it asks for a choice.
- **Something you cannot do.** Every system gets a forbidden verb, shown greyed out with its reason, not hidden.
  A visible "no" teaches what the system is.
- **Its own way to lose.** Each system fails in a way that teaches something about it.
- **Stories, not percentages.** Aim for "I faked the plan figures and the war found me out", not "+5% efficiency".

## The fun gate

A mechanic is not merged until every box is ticked.

**Before building**
- [ ] **Feeling first.** One sentence on what the player should feel (the dread of the audit, the gambler's
      high of a mass campaign). Rules are chosen to produce it.
- [ ] **Every option is arguable.** For each choice, name a situation where it is the right one. If one option
      is never right, cut it.
- [ ] **No dominant strategy.** Write down the degenerate play (always lie, promise everything, never hand over)
      and the rule that stops it paying.
- [ ] **Not a trap.** Check the net effect on every stat the mechanic touches; doing what the game offers must
      not be a hidden loss.

**In play**
- [ ] **Cadence.** One prompt per one to two game years per mechanic, through the tray, never a modal unless
      the decision is urgent.
- [ ] **The target shows at once.** Any slow stat a choice moves shows where it is heading in the tooltip.
- [ ] **Consequences name their cause.** When the bill comes, the headline names the decision that ran it up
      ("the figures reported in 1934 were false").
- [ ] **Red means trouble.** New gauges turn red only when the player must act.
- [ ] **No stacking.** Dramatic failures (exposure, purge, a coup by your own instrument) cannot fire during a
      civil war or within a year of another dramatic event.
- [ ] **No snowball.** Anything that compounds has a cap, a decay, and a world that reacts to it.

**After building**
- [ ] **The AI uses it**, through a simple, readable rule (`ai:` predicates, as the doctrine actions already do).
- [ ] **A self-check script** in `tools/` and a row in `tools/metrics.js`; soak runs hit the target bands below.
- [ ] **Extreme-play test.** Force the AI to always take one option for 10 headless games and compare outcomes
      with normal play. If one option wins everywhere, rebalance.
- [ ] **Read the histories** (`tools/history.js`). Absurd stories show up there before they show up in numbers.
- [ ] **Twins test.** Play two systems that share the engine back to back (two short campaigns, or switch with
      the dev console). With the names hidden, could you tell which is which from what you decide and how it goes
      wrong? If not, the twist rule (see *Twins and their twists*) is too weak. Fix it with a rule, not more text.

## The engines

Each engine is a gauge-or-state on the nation, a yearly or event-driven decision, and its own actions, hooked
in through the doctrine's `month` and `extra` (as `accel.js` does) and a section on the State panel.

### A. Pledges: promise now, pay later
Pick up to three promises from the system's list. Each pays out now (votes, enthusiasm, legitimacy) and becomes
a dated obligation shown on the State panel. Keep it and the payoff locks in; break it and the cost scales with
how loudly you made it.
- **Stops the degenerate play** (promise everything, break what's cheap): at most three, the payoff only lands at
  the next election or deadline, and a broken promise costs more than it paid.
- **Metric:** AI keeps 50–80% of promises; no system wins elections more than 70% of the time.

### B. Targets with a lie button
A target is set; the year's result is measured against it. Overshoot pays. A miss offers three answers: blame
the managers (authority, unity), blame saboteurs (a show trial: fervour up, the intelligentsia down), or **report
false figures**: nothing now, plan distortion up, and the next target is set from the reported figure, so every
lie raises the bar. Exposure risk grows with distortion and spikes in war, when the army goes looking for the kit
the reports promised.
- **Stops the degenerate play** (always lie): lies compound into higher targets, and war checks the books.
- **Metric:** AI lies on 20–50% of misses; exposure ends 10–30% of lying streaks; no state sits above 80
  distortion for more than five years.

### C. The table: seats with demands
Three named seats (unions and employers, three chambers, army, navy and air force, two blocs) each put one demand
on the table a year. Grant two, refuse one, or impose a settlement at a cost. A refused seat carries a grudge;
grudges feed the existing plots, strikes and coups.
- **Stops the degenerate play** (always refuse the same seat): grudges stack and decay slowly.
- **Metric:** every seat is refused 15–45% of the time; grudge-driven crises in 10–30% of games per system.

### D. The chain: momentum abroad
Each revolution, union or conversion abroad within two years of the last raises a multiplier (cheaper subversion,
a stronger broadcast). Break the chain and it resets.
- **Stops the snowball:** the session-14 spread problem (20+ states went techno-socialist) is the warning. The
  multiplier is capped, divided by the size of the bloc, and every link raises containment against you.
- **Metric:** no ideology exceeds 25% of living states in more than one game in ten.

### E. Occupied land as a second front
Land the enemy holds still takes orders: ambush, cut the railway, rise. Losing land becomes a different way to
play.
- **Stops the degenerate play** (giving up land on purpose): guerrilla rewards are always worse than holding the
  province, and each order needs supply sent from free land.
- **Metric:** occupiers of these systems lose 1.5–3× the usual garrison, and these systems still lose more wars
  than they win when outmatched.

### F. Province orders: the map as interface
A system-specific order placed on one province at a time: an on-the-spot guidance tour, a charter, a trade route,
a holy site. The map shows them.
- **Stops micromanagement:** one active order per system (two for a large state), lasting years.
- **Metric:** AI places one order every two to four years; the target province measurably outperforms.

### G. A stockpile that buys a moment
Save up in peace, spend it all at once: a strike fund, the village granary. Follows the arsenal lesson: a
stockpile turns a cliff into a clock.
- **Stops the degenerate play** (never spend): the stockpile has a ceiling and slow leakage.
- **Metric:** AI spends a full stockpile at least once a decade.

### H. The heir
An heir with an education track (soldier, scholar, priest, engineer) whose traits are previewed years ahead,
marriages that make alliances and claims, and a succession that can go wrong.
- **Stops the degenerate play** (always the soldier): each education closes a trait line, and the heir's
  popularity can rival the ruler's.
- **Metric:** succession crises in 15–35% of reigns; each education chosen 15–40% of the time.

### I. The unruly instrument
A second gauge that grows on its own: the Red Guards, the squads, the revolutionary guard, the street army. Use it
to break rivals; rein it in at a price before it turns on you.
- **Stops the snowball:** it grows faster the more you use it, and past 80 it acts on its own.
- **Metric:** reined in before 80 in 50–80% of games; turns on the regime in 5–20%.

## Every system

| System | Engine | The decision | Forbidden | How it fails |
|---|---|---|---|---|
| **Marxism-Leninism** | B | Three plan targets (industry, grain, arms); on a miss: purge, show trial or false figures | Change the budget mid-plan (already true) | War exposes the paper arsenal |
| **Trotskyism** | D | Spend momentum now or extend the chain | Alliances with capitalist states | The chain breaks; Thermidor drifts it to Marxism-Leninism |
| **Council Communism** | C (extends motions) | Lobby the congress on two of three motions, shown as odds | Set the budget or force a vote | The congress votes for peace, or disarmament, mid-war |
| **Maoism** | I + campaigns | Launch a campaign; loose or rein in the Red Guards | A settled bureaucracy | The Guards turn on the party |
| **Market Socialism** | B | Set the yearly quota; output above it sells at market | Selling state concerns | Princelings: inequality and a square full of students |
| **Democratic Socialism** | A | Programme pledges; each kept one shortens capital's patience | Suspending elections | The officers move (the existing coup system) |
| **Anarcho-Syndicalism** | G | Fill the strike fund; call a general strike at home or abroad | Conscription | A strike called on an empty fund collapses |
| **Anarcho-Communism** | E | Orders to occupied communes | Emergency measures (no centre to issue them) | Unsupplied communes are crushed one by one |
| **Classical Liberalism** | A | Election promises | Ruling by decree; postponing elections | Broken promises lose the election, and the system with it |
| **Social Democracy** | C | The annual bargain: unions, employers, the treasury | Expropriation without compensation | A winter of strikes, or capital flight |
| **Libertarian Minarchism** | F | Sell charters on provinces; the holder builds what pays | Any public building | A charter company becomes a state within the state |
| **Constitutional Monarchy** | A + reserve powers | Elections, plus three prerogative uses per reign | The sovereign governing | Too many prerogatives: a republic referendum |
| **Absolute Monarchy** | H | Marriages, the heir's education, inheritance claims | Elections and parliaments | No heir, or two: a succession war |
| **Theocracy** | A (permanent) + F | Irreversible edicts; holy sites on the map; heresy | Repealing an edict | Heresy tolerated drains zeal; crushed, it feeds grievance |
| **Agrarian Traditionalism** | G (the granary) | Once a year: store the harvest, sell to the cities, or hold the festival | Forced industrialisation (already `antiIndustry`) | Hoarding villages starve the cities |
| **Military Junta** | A (the clock) + C | Name the handover date; buy years with victories; the three services' demands | Elections before the date | Postpone too often: a younger officer's counter-coup |
| **Corporatist State** | C | Three sector chambers replace the pact slider | Independent unions; legal strikes | A chamber is captured by one boss |
| **Technocracy** | B | Publish forecasts (extends `tc_publish`) | Rallies; appeals to emotion | Two missed forecasts and the experts are replaced |
| **Personalist Dictatorship** | H + loyalty tests | Test a member of the circle: mercy or purge; groom or fear a successor | Naming a successor who is not a rival | A palace coup by the man you trusted |
| **Merchant Republic** | F (routes) | Open routes, subsidise other states' wars | Conscription: armies are hired | Routes cut in war: a credit crash |
| **Cybernetic Planning** | B (the honest one) | Point the network each year at the economy, the army or the people | False figures: the network reports reality | Data integrity collapses and the numbers lie back |
| **National Populism** | A (extends `np_promise`) | Promises to the crowd, with deadlines | Ceding land in a peace | A missed deadline and the crowd turns |
| **Third Positionism** | C (two blocs) | Each year: one sealed offer from each bloc; take one, both (risky) or neither | Joining a bloc | Caught playing both: both cut aid |
| **Pan-Nationalism** | D | Union with sister states; purge or tolerate the other wing | Recognising the borders | Two capitals, two wings: a schism war |
| **Religious Revival** | I + D | The revolutionary guard; exporting the revolution | Normalising relations with the leading power | The guard becomes the state |
| **Juche** | F + H | On-the-spot guidance in one province; grooming the heir | Aid without losing self-reliance (already) | The heir is not ready when the Leader dies |
| **National Syndicalism** | I | The squads against strikers and the opposition | Class struggle; independent unions | Capital tames the squads: a plain corporatist state |
| **Techno-Socialism** | D | The chain on top of the broadcast | (keeps current) | (keeps current; the chain is capped by the network size) |
| **NRX Accelerationism** | B | Yearly earnings guidance: beat it, miss it, or guide low | Welfare; elections | The board replaces the CEO |
| **National Socialism** | I (refit) | Already has rearmament and the purge; moves the street army onto engine I and shows the rearmament bill's due date | (keeps current) | (keeps current) |
| **Nazi Accelerationism** | — | Already the fire; audit against the gate only | (keeps current) | (keeps current) |

Names follow `js/data/ideologies.js` (Techno-Socialism is Techno-Socialist Accelerationism).

## Twins and their twists

A twist changes a rule: what counts, when the bill comes, who decides, or what the failure costs. Different
event text is not a twist. Anarcho-Communism (E) and Nazi Accelerationism (the fire) have no twin and need none.

**A. Pledges**
- **Classical Liberalism:** promises are judged at the next election. A broken one costs mandate then, not
  now, unless the opposition exposes it first.
- **Constitutional Monarchy:** the government makes the promises, so a broken one brings down the cabinet,
  not the crown. If the sovereign spent a prerogative backing it, prestige pays as well.
- **Democratic Socialism:** keeping promises is the danger. Each one kept shortens the patience of capital and
  the officers. Breaking one is safe from the right but splits the party's left.
- **National Populism:** no election, only deadlines. A missed one turns the crowd at once. The only way to buy
  time is a bigger promise, so the ladder only goes up.
- **Military Junta:** one promise only, the handover date. Victories and crushed risings push it back for free;
  postponing it any other way splits the services.
- **Theocracy:** edicts never expire and cannot be broken. The price is the options each one closes for good.

**B. Targets**
- **Marxism-Leninism:** the lie button. The next target is set from the reported figure; war checks the books.
- **Technocracy:** you set the forecast yourself and it is public. Forecast high for credibility now or low for
  safe beats. No lie button: a miss is public at once, and two in a row replace the experts.
- **Market Socialism:** missing the quota is cheap, because output above it is sold at market. The risk is the
  gap between plan and market, which feeds inequality and the princelings.
- **Cybernetic Planning:** no lie button; the network reports the truth, even when it hurts. In return it sees
  other states' real figures, so it can expose a lying neighbour's distortion.
- **NRX Accelerationism:** guiding too low is punished too. The judge is the board, which can replace the leader
  without an army.

**C. The table**
- **Social Democracy:** two seats bargain against each other. Whatever one gets, the other notices.
- **Corporatist State:** each chamber has a quota as well as a demand. Once a reign you may merge or abolish one.
- **Council Communism:** you do not decide. You lobby, the vote resolves by the odds shown, and you live with it.
- **Military Junta:** the seats are the army, navy and air force. Refuse one and that service fights worse in
  the next war.
- **Third Positionism:** the seats are foreign blocs and their offers are sealed. Taking both risks discovery
  every year.
- **Personalist Dictatorship:** the seats are named people, not groups. They can die, defect or plot, and nobody
  stands behind them, so a purge costs little and loyalty is never certain.

**D. The chain**
- **Trotskyism:** any socialist revolution anywhere counts. A chain broken twice brings Thermidor.
- **Pan-Nationalism:** only sister states of the nation count. Each link is a union that adds land, and each one
  also strengthens the other wing.
- **Techno-Socialist Accelerationism:** links add the broadcast's reach, not its strength, and the cap follows the
  network's size (the session-14 guards stay).
- **Religious Revival:** links are conversions, not revolutions, and each one also feeds the guard (engine I).

**F. Province orders**
- **Libertarian Minarchism:** you sell the order; the buyer chooses what to build.
- **Merchant Republic:** an order is a route between two provinces, one yours and one foreign. A war between
  them cuts it.
- **Juche:** the order is the Leader himself. The boost is large and short, and the rest of the country stalls
  while he is away.
- **Theocracy:** holy sites are fixed on the map. You cannot place them, only hold or take them.

**G. Stockpiles**
- **Anarcho-Syndicalism:** the fund is spent all at once, and the strike lasts as long as the fund does.
- **Agrarian Traditionalism:** the granary belongs to the villages. Once a year you decide their share; the
  cities cannot draw on it without the villages' consent.

**H. The heir**
- **Absolute Monarchy:** marriages and inheritance claims, the whole map as a family tree.
- **Juche:** no marriages. The heir is built over years of titles and must be presented before the Leader dies,
  or the succession is a crisis.
- **Personalist Dictatorship:** naming a successor makes a rival. The heir's popularity drains the ruler's.
- **Constitutional Monarchy:** the heir's education shapes only the prerogatives, never policy. A popular heir
  shields the crown from the republic movement.

**I. The unruly instrument**
- **Maoism:** the Guards grow only while a campaign runs. You aim them at the party; reining them in sends them
  to the countryside and costs industry.
- **National Syndicalism:** capital pays the squads too. If capital pays more than you, the squads serve capital.
- **Religious Revival:** the guard runs businesses of its own and grows from them, so reining it in costs gold as
  well as authority.
- **National Socialism:** the purge is one-shot. After the night of the long knives there is no second one.

## What changed from v1, and why

- **Agrarian seasons** (two councils a year) became one harvest decision tied to the new granaries. Twice a
  year was bookkeeping; the granary already exists.
- **Cybernetic capacity split across sectors** became "point the network at one thing". Splitting a number
  across sectors is a spreadsheet with a best answer.
- **Council agenda cards with tokens** became an extension of the existing motions. No new currency.
- **Third Positionism's auction rounds** became one sealed offer per bloc a year. Rounds were clicks, not choices.
- **Social Democracy** had two mechanics; it keeps the bargain. Promises go to the liberal and monarchic systems.
- **NRX quarterly calls** became yearly. Quarterly broke the cadence rule.
- **Merchant convoys on the map** became route lines with raids through the existing naval code. Animated
  convoys are cost without decisions.
- **International bodies and a musical theme per system** are out of scope until the engines ship.
- **Peace by ideology** is partly done (install or annex, `noPeace` for the fire). What remains is small:
  monarchies take tribute, liberals take reparations and bases. Do it alongside engine C.

## Build order

Prototype each engine with one system, play two campaigns, run the fun gate, then roll it out.

1. **B, targets with a lie button: Marxism-Leninism.** Smallest build with the biggest identity: `n.plan.target`
   and `n.dist` exist. Then Technocracy, Market Socialism, NRX, Cybernetic.
2. **A, pledges: Classical Liberalism.** Then Constitutional Monarchy, Democratic Socialism, National Populism,
   the junta's clock, theocratic edicts.
3. **I, the unruly instrument: Maoism.** Then National Syndicalism, the Revival, and National Socialism's street
   army moved onto the engine.
4. **C, the table: Social Democracy.** Then Corporatist, Council (motions), the junta's services, Third
   Positionism, and the personalist circle.
5. **H, the heir: Absolute Monarchy.** Then Juche, Personalist, Constitutional Monarchy.
6. **G, stockpiles: Anarcho-Syndicalism and the agrarian granary.**
7. **E and F, the map engines: Anarcho-Communism, Minarchism, Merchant Republic, Juche guidance, holy sites.**
   Most UI work, so last.
8. **D, the chain: Trotskyism, Pan-Nationalism, Techno-Socialism.** Last on purpose: the most snowball risk, and
   it needs the spread guards from session 14 to stay in.

After each step: `tools/ideocheck.js` and `tools/metrics.js` over 10 historical and 10 free games, compare with the
bands above, and add the lesson to `Iron Dialectic Lessons` in the vault if one turns up.
