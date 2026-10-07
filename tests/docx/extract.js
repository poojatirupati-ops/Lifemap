// runs in the page: extract every visible string and number of the calculator screen
module.exports = () => { if (!document.querySelector("#cout")) return null;
  const q = (s, r) => (r || document).querySelector(s), qa = (s, r) => [...(r || document).querySelectorAll(s)];
  const txt = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null;
  const main = q('#main'), head = q('header.sky');
  const sub = q('p.sub', head), note = q('.note', head);
  const subText = sub ? txt([...sub.childNodes].filter(n => !(n.classList && n.classList.contains('note'))).reduce((a, n) => (a.appendChild(n.cloneNode(true)), a), document.createElement('span'))) : null;
  const inCard = qa(':scope > .card', main).filter(c => !c.classList.contains('asmg'));
  const fields = qa('.field', main).filter(f => !f.closest('.infl') && !f.closest('.asmg') && !f.classList.contains('asmf') && (q('input[type=range]', f) || q('[data-a="ckset"]', f) || q('input.nb[data-nb^="ck|"]', f))).map(f => {
    const tagsOf = lab => qa('.tag', lab).map(t => txt(t)), labTxt = lab => { const lt = lab.cloneNode(true); [...lt.querySelectorAll('.tag')].forEach(t => t.remove()); return txt(lt); };
    const std = q('[data-a="ckstd"]', f), guide = qa(':scope > span.small', f).map(txt).join(' ') || null, common = { stdChip: std ? txt(std) : null, guide, whatIf: !!f.closest('.card[style*="dashed"]') };
    const chipsEl = q('.chips', f);
    if (chipsEl && q('[data-a="ckset"]', f)) { const lab = q('.flabel', f), tags = tagsOf(lab), cs = qa('[data-a="ckset"]', f), sel = cs.find(c => c.getAttribute('aria-pressed') === 'true');
      return Object.assign({ kind: 'chip', k: cs[0].dataset.p.split('|')[0], label: labTxt(lab), tag: tags.find(t => /statement/.test(t)) || null, look: tags.find(t => t === 'Not chosen yet' || t === 'Not added yet') || false, chips: cs.map(c => ({ t: txt(c), v: c.dataset.p.split('|')[1], pressed: c.getAttribute('aria-pressed') })), box: sel ? txt(sel) : '', pre: '', suf: '', role: chipsEl.getAttribute('role'), labelledby: chipsEl.getAttribute('aria-labelledby'), lid: lab.id }, common); }
    const lab = q('label', f), tags = tagsOf(lab), box = q('input.nb', f), rg = q('input[type=range]', f), us = qa('.nbu', f).map(u => ({ t:u.textContent, before: !!(u.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING) }));
    const base = { k: box.dataset.nb.split('|')[1], label: labTxt(lab), tag: tags.find(t => /statement/.test(t)) || null, look: tags.find(t => t === 'Not chosen yet' || t === 'Not added yet') || false, pre: (us.find(u => u.before) || {}).t || '', suf: (us.find(u => !u.before) || {}).t || '', box: box.value, inputmode: box.getAttribute('inputmode'), hint: txt(q('.nbhint', f)) || '', labelledby: box.getAttribute('aria-labelledby'), lid: lab.id };
    if (!rg) return Object.assign({ kind: 'blank' }, base, common);
    return Object.assign({ kind: 'slider', min: rg.min, max: rg.max, step: rg.step, value: rg.value, valuetext: rg.getAttribute('aria-valuetext') }, base, common); });
  const ab = q('details.asmg[data-g^="c-"]', main);
  const calcAsm = ab ? { summary: txt(q('summary', ab)), open: ab.open, fields: qa('.field.asmf', ab).map(f => { const lab = q('.flabel', f), lt = lab.cloneNode(true); [...lt.querySelectorAll('.tag')].forEach(t => t.remove()); const bx = q('input.nb', f);
      return { k: f.dataset.k, label: txt(lt), tag: txt(q('.tag', lab)), chips: qa('[data-a="asmset"]', f).map(c => ({ t: txt(c), pressed: c.getAttribute('aria-pressed') })), box: bx ? bx.value : null, std: txt(q('[data-a="asmstd"], [data-a="asmsug"]', f)), guide: txt(q(':scope > span.small', f)) }; }), useAll: txt(q('[data-a="useall"]', ab)), note: qa('p.small', ab).map(txt).filter(t => /plan-wide/.test(t))[0] || null } : null;
  const gateEl = q('#cgate');
  const gate = gateEl ? { eyebrow: txt(q('.eyebrow', gateEl)), b: txt(q('b', gateEl)), also: txt(q('p', gateEl)) } : null;
  const gateEl0 = null; const cout = q('#cout .card');
  const result = cout && !gateEl ? { lbl: txt(q('.eyebrow', cout)), val: txt(cout.children[1]), line: txt(q('p:not(.exres)', cout)), rows: qa('.row', cout).map(r => [txt(r.children[0]), txt(r.children[1])]) } : null;
  const adj = q('[data-a="adjinfl"]');
  const ic = q('.infl', main);
  const inflNote = qa('p.small', main).find(p => /Prices rising/.test(p.textContent));
  const wi = qa('.card', main).find(c => /dashed/.test(c.getAttribute('style') || ''));
  return { gate, calcAsm, title: txt(q('h2.t', head)), sub: subText, tip: txt(note), back: txt(q('.backb', head)),
    eyebrow: txt(q(':scope > .eyebrow', main)),
    adj: adj ? { text: txt(adj), checked: adj.getAttribute('aria-checked'), role: adj.getAttribute('role'), help: txt(adj.nextElementSibling) } : null,
    infl: ic ? { title: txt(q('b', ic)), help: txt(q('p.small', ic)), chips: qa('.chip', ic).map(c => ({ t: txt(c), pressed: c.getAttribute('aria-pressed') })), other: txt(q('.flabel span', ic)), otherBox: (q('input.nb', ic) || {}).value || null } : null,
    fields, result, inflNote: txt(inflNote), whatIfTitle: wi ? txt(q('b', wi)) : null,
    buttons: qa(':scope > .grid2 button', main).map(b => ({ t: txt(b), a: b.dataset.a, p: b.dataset.p, cls: b.className })), disc: txt(q(':scope > p.disc', main)) };
};
