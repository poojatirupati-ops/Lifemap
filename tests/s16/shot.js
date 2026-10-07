const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('file://' + __dirname + '/road.svg'); await p.screenshot({ path: __dirname + '/road.png' }); await b.close(); })();
