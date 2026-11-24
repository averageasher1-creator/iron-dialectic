/* Loads the simulation into Node in the order index.html loads it (core, data and sim scripts only),
   so the tools can never drift from the game's own file list. Returns the global ID. */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
globalThis.ID = {};
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
// ID_SKIP=engines leaves a script out, to measure the game without it
for (const m of html.matchAll(/src="(js\/(?:core|data|sim)\/[\w-]+\.js)"/g)) if (!process.env.ID_SKIP || !m[1].includes(process.env.ID_SKIP)) require(path.join(root, m[1]));
module.exports = globalThis.ID;
