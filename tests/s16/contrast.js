const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const fs = require('fs');
const L = require(__dirname + '/look.json');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const res = {};
  for (const [k, v] of Object.entries(L)) { const data = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/bg-' + k + '.png').toString('base64');
    res[k] = await p.evaluate(async ([data, boxes]) => { const img = new Image(); img.src = data; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const lum = (r, g, b) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
      return boxes.filter(bx => bx.vis).map(bx => { const d = x.getImageData(Math.round(bx.x * 2), Math.round(bx.y * 2), Math.max(1, Math.round(bx.w * 2)), Math.max(1, Math.round(bx.h * 2))).data; let mx = 0, mn = 1; for (let i = 0; i < d.length; i += 4) { const l = lum(d[i], d[i + 1], d[i + 2]); mx = Math.max(mx, l); mn = Math.min(mn, l); } const [r, g, bb] = bx.c.match(/\d+/g).map(Number), lt = lum(r, g, bb);
        return [bx.t, bx.fs, +(lt > .5 ? (lt + .05) / (mx + .05) : (mn + .05) / (lt + .05)).toFixed(2)]; }); }, [data, v.boxes]); }
  console.log(JSON.stringify(res, null, 0)); await b.close(); })();
