const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const p = await (await b.newContext()).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:''})); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'); await p.waitForTimeout(300);
  const P = {
    '#4 Seasoned investor (expect Achiever · first Balanced · full Growth K17)': [{'2':1,'4':1,'6':3,'7':0,'8':3,'9':3,'12':2}, {u9:3,u10:2,u11:3,u12:3,u4:0,u13:2}],
    '#8 Budgeter, home in 3 yrs (expect Achiever · first Balanced · full Cautious–balanced (time) K14t)': [{'2':0,'4':1,'6':2,'7':0,'8':2,'9':2,'12':2}, {u9:1,u10:2,u11:1,u12:3,u4:1,u13:2}],
    '#7 Keen, thin cushion (expect Explorer · first Cautious–balanced · full Cautious–balanced (can) K14c)': [{'2':2,'4':1,'6':1,'7':2,'8':3,'9':3,'12':1}, {u9:3,u10:1,u11:2,u12:2,u4:0,u13:2}],
    '#1 Anxious starter (expect Balancer · Cautious · Cautious K16)': [{'2':1,'4':3,'6':0,'7':3,'8':0,'9':0,'12':0}, {u9:0,u10:0,u11:0,u12:1,u4:2,u13:2}],
    '#12 Only Q6-Q9 (expect null)': [{'6':1,'7':1,'8':1,'9':1}, {}],
  };
  for (const [n, [ans, um]] of Object.entries(P)) {
    const r = await p.evaluate(([ans, um]) => { S = fresh(); Object.assign(S.ans, ans);
      const pf = personality(), first = riskRead(false); const pre = pf ? pf.name : null; Object.assign(S.um.a, um); const full = riskRead(true);
      return {typeBeforeU4:pre, type:(personality() || {}).name || null, first:first.label, firstMis:first.misKey, full:full.label, setBy:full.limit, WCHKE:[full.want, full.can, full.time, full.level].join('/'), mis:full.misKey, umCount:umCount()}; }, [ans, um]);
    console.log(n, JSON.stringify(r)); }
  // cashflow sanity
  console.log(JSON.stringify(await p.evaluate(() => ({net45:Math.round(netPay(45000)), net60:Math.round(netPay(60000)), ret:Math.round(netRet(40000, 15564, 67)), pc:Math.round(pensionCost(45000, 1350*1, 42))}))));
  console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close(); })();
