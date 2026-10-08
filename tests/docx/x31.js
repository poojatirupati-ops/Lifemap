const { open } = require('./lib'); const collect = require('./s26lib');
(async () => { const { browser, page, errors } = await open(); page.on('pageerror', e => console.log('PAGEERR at', new Date().toISOString().slice(17,23), e.stack.split('\n').slice(0,4).join(' | ')));
const orig = page.evaluate.bind(page); let n=0; page.evaluate = async (f, a) => { n++; try { return await orig(f, a); } finally { if (errors.length && !page._rep) { page._rep = 1; console.log('first error after evaluate #', n, String(f).slice(0,200)); } } };
await collect(page, false); await browser.close(); })();
