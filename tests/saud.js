// Independent calculator audit (8 Oct 2026): fixes 1 to 12, prototype side. The workbook side is checked by calc-vs-xlsx.js (extra cases).
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); let fails = 0, n = 0; const errs = [];
  const chk = (name, ok, d) => { n++; if (!ok){ fails++; console.log('FAIL |', name, '|', JSON.stringify(d)); } };
  const p = await (await b.newContext({viewport:{width:390, height:900}})).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300); const ev = (f, a) => p.evaluate(f, a);
  const run = (id, o, asm, infl) => ev(([id, o, asm, infl]) => { S = fresh(); S.infl = infl === undefined ? 0.02 : infl; S.asm = Object.assign({}, asm || {}); applyAssume(); const c = C(id), v = calcVals(c); Object.assign(v, o); const r = c.run(v); return {lbl:r.lbl, val:r.val, line:r.line, rows:r.rows, num:r.num, goal:r.goal}; }, [id, o, asm, infl]);
  // 1. C12 bridge: the target never rises with other income
  const T = []; for (const o of [10000, 20000, 30000, 45000]) T.push((await run('retirement', {age:40, ra:60, d:20000, o, pot:60000, m:500, g:4.5})).num.Target_Today);
  chk('[audit 1] C12 target, desired 20,000, retire 60, other 10k/20k/30k/45k = 310,000 / 120,000 / 120,000 / 120,000 (never rises with other income)', JSON.stringify(T) === '[310000,120000,120000,120000]' && T.every((x, i) => i === 0 || x <= T[i - 1]), T);
  const T2 = []; for (const o of [0, 5000, 15000, 25000]) T2.push((await run('retirement', {age:40, ra:62, d:30000, o, less:0})).num.Target_Today);
  chk('[audit 1] A normal case: target falls as other income rises (30,000 needed, retire 62)', T2.every((x, i) => i === 0 || x <= T2[i - 1]), T2);
  // 5. gate
  const g = await run('retirement', {age:70, ra:50});
  chk('[audit 5] C12 retirement age at or before your age: "Choose a retirement age after your age to see this", no silent 1 year', g.val === 'Choose a retirement age after your age to see this' && g.num.Years_To_Retirement === g.val && g.goal.kind === 'blocked', g);
  const g2 = await run('retirement', {age:40, ra:40}); chk('[audit 5] Same age also gates', g2.val === 'Choose a retirement age after your age to see this', g2.val);
  // 2. lump sum
  const L = await ev(() => ({big:lumpSum(4870000, 0.25), mid:lumpSum(1000000, 0.25), small:lumpSum(500000, 0.15), law:LAW.ls, gov:govRows().find(x => x[0] === 'Retirement lump sum')[1]}));
  chk('[audit 2] Lump sum on a 4.87m fund is 25% (1,217,500), tax = 20% of 300,000 + 40% of the 717,500 above 500,000 = 347,000', L.big.gross === 1217500 && Math.round(L.big.tax) === 347000 && Math.round(L.big.net) === 870500, L.big);
  chk('[audit 2] Ordinary fund: 1,000,000 gives 250,000 less 10,000 tax; 15% of 500,000 = 75,000 tax-free', L.mid.net === 240000 && L.small.tax === 0, L);
  chk('[audit 2] The wording says what happens above €500,000', /marginal rate/.test(L.law) && /marginal rate/.test(L.gov), L);
  const big = await run('retirement', {age:30, ra:65, pot:1500000, m:5000, d:150000, g:7});
  chk('[audit 2] C12 shows the uncapped lump sum (gross above 500,000 for a big fund)', big.num.Lump_Sum > 500000 && big.num.Lump_Sum_Tax > 60000, big.num);
  // 4 (SFT)
  const s1 = await run('retirement', {age:30, ra:65, pot:1500000, m:5000, d:150000, g:7}), s0 = await run('retirement', {age:40, ra:65, pot:60000, m:500, d:40000});
  chk('[audit 6] SFT warning compares the fund in today\'s money with the 2026 threshold (warning only when Fund_Today > 2.2m)', (s1.num.Fund_Today > 2200000) === /Standard Fund Threshold/.test(s1.num.SFT_Warning) && s0.num.SFT_Warning === '', {ft:s1.num.Fund_Today, w:s1.num.SFT_Warning});
  const s3 = await run('retirement', {age:30, ra:65, pot:150000, m:1500, d:60000, g:6});
  chk('[audit 6] A 30-year-old whose fund is below 2.2m in today\'s money gets no warning even if the future fund is above it', s3.num.Projected_Fund > 2200000 && s3.num.Fund_Today < 2200000 && s3.num.SFT_Warning === '', {f:s3.num.Projected_Fund, t:s3.num.Fund_Today, w:s3.num.SFT_Warning});
  const sf = await ev(() => { S = fresh(); S.infl = 0.02; applyAssume(); return [sftFor(2026), sftFor(2029), Math.round(sftFor(2040))]; });
  chk('[audit 6] Standard Fund Threshold: law to 2029, then rises with prices (2040 = 2.8m x 1.02^11)', sf[0] === 2200000 && sf[1] === 2800000 && sf[2] === Math.round(2800000 * Math.pow(1.02, 11)), sf);
  // 3. C22
  const i0 = await run('incomegap', {e:200, sp:3, s:8000, inc:60000, ib:254}), i1 = await run('incomegap', {e:2500, sp:3, s:200000, inc:60000, ib:254}), i2 = await run('incomegap', {e:2500, sp:3, s:8000, inc:60000, ib:254});
  const all = x => JSON.stringify([x.val, x.line, x.rows]);
  chk('[audit 3] C22: spending covered by Illness Benefit never prints "Indefinitely": "up to 2 years", savings "Not needed"', i0.val === 'up to 2 years' && !/Indefinitely/.test(all(i0)) && i0.num.Months_Coping === 24 && i0.num.Savings_Months === 'Not needed', i0);
  chk('[audit 3] C22: a long time on savings is capped at 24 months (Illness Benefit is paid for at most 2 years)', i1.num.Months_Coping === 24 && i1.val === 'up to 2 years' && /up to 2 years \(624 days\)/.test(i1.line), i1);
  chk('[audit 3] C22: a short time is shown as before (3 months sick pay + savings / gap) and the wording is guidance, not product steering', i2.num.Months_Coping < 24 && /months/.test(i2.val) && !/designed for this/.test(i2.line) && /your adviser can explain the options/.test(i2.line), i2);
  // 4. C20
  const r1 = await run('riskreturn', {p:20000, y:10, s:1}, {riskMu1:0.08, riskVol1:0.01}), r2 = await run('riskreturn', {p:20000, y:10, s:2});
  chk('[audit 4] C20: no "fall of around −6%" when the 1-in-20 year is not a fall; says so plainly', !/fall of around/.test(r1.line) && /not expected to bring a fall/.test(r1.line), r1.line);
  chk('[audit 4] C20: says the yearly range narrows but the euro gap widens (no "Longer timeframes narrow the range")', /yearly return range narrows, but the gap in euros/.test(r2.line) && !/Longer timeframes narrow the range/.test(r2.line) && /fall of around \d+%/.test(r2.line), r2.line);
  // 6. C15 / C16
  const m0 = await run('lastmoney', {pot:10000, w:24000, g:3, age:55}), m1 = await run('lastmoney', {pot:400000, w:24000, g:3.15, age:66}), d0 = await run('drawdown', {pot:10000, w:24000});
  chk('[audit 7] C15: a withdrawal larger than the pot says "Less than a year", not "0 years" or "lasts to about age"', m0.val === 'Less than a year' && /run out in the first year/.test(m0.line) && !/lasts to about age/.test(m0.line) && m0.rows[0][1] === 'Less than a year after you start' && m0.num.Lasts_To_Age === 'Less than a year', m0);
  chk('[audit 7] C15: starting before 60 shows the early-access note; starting at 66 does not', /can't be taken before 60/.test(m0.line) && !/can't be taken before 60/.test(m1.line), [m0.line.slice(0, 400), m1.line.slice(0, 200)]);
  chk('[audit 7] C16: the same wording ("Less than a year") for every scenario', d0.val === 'Less than a year' && d0.rows.every(r => r[1] === 'Less than a year'), d0);
  // 7. C10
  const w0 = await run('lumpsum', {p:10000, r:1, y:15, f:1, wait:6}), w1 = await run('lumpsum', {p:10000, r:4, y:15, f:0, wait:5});
  chk('[audit 8] C10: says the money earns nothing while it waits; no negative "cost of waiting" when growth after fees is zero or negative', /earns nothing while it waits/.test(w0.line) && /costs nothing here/.test(w0.line) && !/less, which is the cost of waiting/.test(w0.line) && !/−/.test(w0.line.slice(0, 200)), w0.line);
  chk('[audit 8] C10: a normal case still reports the cost of waiting', /earns nothing while it waits/.test(w1.line) && /less, which is the cost of waiting/.test(w1.line), w1.line);
  // 8, 9. C07, C01, C03
  const rb1 = await run('rentbuy', {rent:1800, price:350000, dep:400000, rate:3.75, term:30, y:10, g:2}), rb2 = await run('rentbuy', {rent:1800, price:350000, dep:0, rate:3.75, term:30, y:10, g:2});
  chk('[audit 9] C07: a deposit above the price is capped with a message (and below 10% as before); equity is "before selling costs"', /can't be more than the price/.test(rb1.line) && rb1.num.Loan === 0 && /at least 10% of the price/.test(rb2.line) && Math.round(rb2.num.Loan) === 315000 && /before selling costs/.test(rb1.line), [rb1.line.slice(-300), rb2.num.Loan]);
  const bo = await run('borrow', {inc:60000, inc2:0, dep:25000, ftb:1, rate:3.75, term:30}), dp = await run('deposit', {price:350000, pc:10, saved:500000, mo:800});
  const VAT = /new home it is charged on the price excluding VAT, and Help to Buy is not included/;
  chk('[audit 10] C01, C03 and C07 say stamp duty on a new home is on the price excluding VAT and that Help to Buy is not included', VAT.test(bo.line) && VAT.test(dp.line) && VAT.test(rb1.line), [bo.line.slice(-200), dp.line.slice(-200)]);
  chk('[audit 12] C03: no double space when already saved enough', !/  /.test(dp.line), dp.line);
  // 11. conventions
  const c02 = await run('repayment', {loan:300000, rate:4, term:30, dr:0}), c28 = await run('loan', {a:15000, apr:8, y:5}), c13 = await run('contrib', {sal:60000, inc:2, y:25, g:4.5, tr:40, age:40, ex:0});
  chk('[audit 11] C02 says "yearly rate, compounded monthly"; C28 says the APR is an effective yearly rate; C13 says the extra is level', /yearly rate, compounded monthly/.test(c02.line) && /effective yearly rate/.test(c28.line) && /does not rise with pay/.test(c13.line), [c02.line, c28.line]);
  const tm = await ev(() => { loadSample(); const r = assumeRows().find(x => x[0] === 'How timing is counted'); return r ? r[1] : null; });
  chk('[audit 11] "What your plan assumes" says how timing is counted (pension contributions at the end of each year)', !!tm && /paid at the end of each year/.test(tm) && /start of each year/.test(tm), tm);
  // plan engine with the lump sum rule (no cap): the retirement-year lump sum comes into savings after tax
  const pe = await ev(() => { loadSample(); S.fin.pension = 3000000; S.src.pension = 'typed'; S.fin.pensionM = 3000; applyAssume(); const P = project(); const r = P.rows.find(x => x.a === S.retireAge); return {a:r.a, pen:r.pen, liquid:r.liquid}; });
  chk('[audit 2] The plan engine takes the 25% lump sum above 500,000 too (large fund: liquid savings jump in the first retired year)', pe.liquid > 300000, pe);
  console.log('FAILS', fails, 'of', n, 'ERRORS', errs.length, errs.slice(0, 3)); await b.close(); })();
