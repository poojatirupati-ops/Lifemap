// §26 and the fix rounds (planner, developer): live strings and screenshots
const { open } = require('./lib'); const fs = require('fs'); const collect = require('./s26lib');
(async () => { const { browser, page, errors } = await open(); const out = await collect(page, true);
  out.errors = errors; fs.writeFileSync(__dirname + '/s26.json', JSON.stringify(out, null, 1)); console.log('s26 done', errors); await browser.close(); })();
