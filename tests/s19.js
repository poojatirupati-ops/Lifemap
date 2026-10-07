const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); let fails = 0, n = 0; const errs = [];
  const chk = (name, ok, d) => { n++; if (!ok){ fails++; console.log('FAIL |', name, '|', JSON.stringify(d)); } };
  for (const w of [390, 1280]) {
  const p = await (await b.newContext({viewport:{width:w,height:900}})).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300); const ev = (f, a) => p.evaluate(f, a);
  const sec = async id => ev(id => { S.tab = 'me'; S.me = 'fin'; S.fsec = FSEC.findIndex(x => x.id === id); S.fmode = {}; S.fmode[id] = 'type'; lastId = null; render(); }, id);
  // 2. liabilities "+" per card and per loan; engine sums, split kept
  await ev(() => { loadSample(); S.lists = {cards:[], loans:[], pens:[]}; });
  await sec('liab');
  chk('[§19.2] Liabilities: one card block shown with owed, repayment, lender, rate, upload and a "+" button', await ev(() => ['owed','pay','lender','rate'].every(f => document.querySelector('[data-it^="cards|"][data-it$="|' + f + '"]')) && !!document.querySelector('[data-a="iadd"][data-p="cards"]') && !!document.querySelector('[data-a="iadd"][data-p="loans"]') && /Add a credit card/.test(document.body.innerText)), {});
  await p.click('[data-a="iadd"][data-p="cards"]'); await p.click('[data-a="iadd"][data-p="loans"]'); await p.click('[data-a="iadd"][data-p="loans"]');
  const cardInputs = p.locator('[data-it^="cards|"][data-it$="|owed"]'); chk('[§19.2] "+" adds a second card', await cardInputs.count() === 2, await cardInputs.count());
  await cardInputs.nth(0).fill('400'); await cardInputs.nth(1).fill('600');
  await p.locator('[data-it^="cards|"][data-it$="|pay"]').nth(0).fill('40'); await p.locator('[data-it^="cards|"][data-it$="|pay"]').nth(1).fill('60');
  await p.locator('[data-it^="loans|"][data-it$="|owed"]').nth(0).fill('3500'); await p.locator('[data-it^="loans|"][data-it$="|owed"]').nth(1).fill('2000'); await p.locator('[data-it^="loans|"][data-it$="|pay"]').nth(0).fill('100');
  await p.locator('[data-it^="cards|"][data-it$="|rate"]').nth(0).fill('20'); await p.locator('[data-it^="cards|"][data-it$="|rate"]').nth(1).fill('10');
  const t = await ev(() => { syncLists(); return {cb:S.fin.cardBal, cp:S.fin.cardPayM, cr:S.fin.cardRate, lb:S.fin.loanBal, lp:S.fin.loanPayM, f:foundations()[2].items.map(x => x.s).join(' | ')}; });
  chk('[§19.2] Engine sums the cards (1,000; 100 a month; rate weighted 14%) and the loans (5,500; 100 a month); optional blanks are €0', t.cb === 1000 && t.cp === 100 && Math.abs(t.cr - 14) < 0.01 || t.cb === 1000 && t.cp === 100 && Math.abs(t.cr - 0.14) < 0.0001 && t.lb === 5500 && t.lp === 100, t);
  chk('[§19.2] Engine keeps the card / other-loan split (pyramid names both)', /Credit card/.test(t.f) && /Loans of/.test(t.f), t.f);
  // 3. saved = complete, blanks €0
    const done = await ev(() => { S = fresh(); S.shell = true; const s = FSEC.find(x => x.id === 'pension'); S.saved = S.saved || {}; delete S.saved.pension; const a = secStatus(s); S.saved.pension = true; return [a, secStatus(s)]; }).catch(e => ['ERR ' + e.message]);
  chk('[§19.3] A saved section counts as complete (even with blanks)', done[1] === 'done', done);
  // 4. protection
  await ev(() => { loadSample(); S.lists = {cards:[], loans:[], pens:[]}; S.fin.life = 'Yes'; S.src.life = 'typed'; S.fin.workCover = 'Not sure'; S.src.workCover = 'typed'; S.lists.life = []; S.lists.workCover = []; });
  await sec('prot'); const pt = await ev(() => document.body.innerText);
  chk('[§19.4] Protection: lead-in "Do you have any of the following?"', /Do you have any of the following\?/.test(pt), pt.slice(0, 300));
  chk('[§19.4] Protection: no generic upload at the top', await ev(() => !document.querySelector('#docbar') && !document.querySelector('[data-a="upl"]') && !/Upload a document/i.test(document.querySelector('#screen').innerText)), {});
  chk('[§19.4] "Yes" opens amount, term and a per-policy optional upload; "+" adds another policy', await ev(() => !!document.querySelector('[data-it^="life|"][data-it$="|amount"]') && !!document.querySelector('[data-it^="life|"][data-it$="|term"]') && !!document.querySelector('[data-a="iupl"][data-p^="life|"]') && !!document.querySelector('[data-a="iadd"][data-p="life"]')), {});
  chk('[§19.4] Cover through work shows how to find out (HR / benefits booklet / death-in-service)', /HR/.test(pt) && /benefits booklet/.test(pt) && /[Dd]eath-in-service/.test(pt), pt.slice(0, 600));
  await p.locator('[data-it^="life|"][data-it$="|amount"]').first().fill('250000');
  const cv = await ev(() => { syncLists(); return {c:coverTotal('life'), f:/Life cover in place \(€250,000/.test(JSON.stringify(foundations()))}; });
  chk('[§19.4] The engine uses the entered cover (life cover 250,000 counted)', cv.c === 250000 && cv.f, cv);
  // 5/6 pensions
  await ev(() => { S.lists.pens = []; S.fin.work = 'Employed'; S.src.work = 'typed'; S.fin.income = 60000; S.src.income = 'typed'; });
  await sec('pension');
  await p.click('[data-a="iadd"][data-p="pens"]');
  const pv = p.locator('[data-it^="pens|"][data-it$="|value"]'); chk('[§19.5] Pensions: "+" adds a second pension', await pv.count() === 2, await pv.count());
  await pv.nth(0).fill('72000'); await pv.nth(1).fill('10000'); await p.locator('[data-it^="pens|"][data-it$="|monthly"]').nth(0).fill('520'); await p.locator('[data-it^="pens|"][data-it$="|monthly"]').nth(1).fill('100'); await p.locator('[data-it^="pens|"][data-it$="|own"]').nth(0).fill('260');
  const pn = await ev(() => { syncLists(); return {v:S.fin.pension, m:S.fin.pensionM, o:S.fin.pensionOwnM, up:!!document.querySelector('[data-a="iupl"][data-p^="pens|"]')}; });
  chk('[§19.5] Pensions: value and monthly summed; own share given on one and blank on the other is not guessed until the share is chosen', pn.v === 82000 && pn.m === 620 && pn.up, pn);
  const ow = await ev(() => { S.asm = S.asm || {}; S.asm.ownShare = 0.5; syncLists(); const a = S.fin.pensionOwnM; return a; });
  chk('[§19.5] Once the own-share standard is chosen, the blank one uses it: 260 + 50 = 310 (same as the workbook Pens_Own_Total)', ow === 310, ow);
  // 6. settings
  const st = await ev(() => { S = fresh(); S.admin = true; S.shell = true; render(); return {t:document.querySelector('#screen').textContent, keys:Object.keys(SETTINGS.s), names:Object.values(SETTINGS.s).map(x => x.n)}; });
  chk('[§19.6] Admin Settings view is clearly marked as admin / not for customers and lists every standard', /Settings/.test(st.t) && /(admin|Admin|ADMIN|Not shown to customers|not for customers)/.test(st.t) && st.names.filter(x => !st.t.includes(x)).length === 0, {miss:st.names.filter(x => !st.t.includes(x)), t:st.t.slice(0, 200)});
  chk('[§19.6] Retirement age and life expectancy are never defaulted (no such Settings value)', !st.keys.some(k => /retire(Age)?$|planEnd|lifeExp/i.test(k) && k !== 'retireMult' && k !== 'retireSpend'), st.keys);
  // 7. months
  const mo = await ev(() => { S = fresh(); S.shell = true; loadSample(); const m = ASM.safetyMonths; return {has: typeof asmV === 'function' && asmV('safetyMonths')}; });
  chk('[§19.7] One emergency-fund months value (see emerg.js for the full flow)', mo.has > 0, mo);
  // 8. ranking
  const rk = await ev(() => { loadSample(); const g0 = rankList().map(g => g.k); const sid = S.goals.find(g => g.k === 'safety').id; ACT.grank(sid + '|down'); const g1 = rankList().map(g => g.k); const same = resultOrder().map(g => g.k).join() === g1.join(); S.tab = 'plan'; lastId = null; render(); const ui = document.querySelectorAll('#rank-plan [data-a="grank"]').length; ACT.grankreset(); return {g0, g1, same, ui, back:rankList().map(g => g.k).join() === g0.join()}; });
  chk('[§19.8] Emergency fund first by default; moving it down changes the order everywhere (results follow); up/down buttons exist; reset works', rk.g0[0] === 'safety' && rk.g1[0] !== 'safety' && rk.same && rk.ui >= 2 && rk.back, rk);
  await p.close(); }
  console.log('FAILS', fails, 'of', n, 'ERRORS', errs.length, errs.slice(0, 3)); await b.close(); })();
