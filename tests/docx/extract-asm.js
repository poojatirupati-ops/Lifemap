module.exports = () => { const txt = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null;
  const main = document.getElementById('main'), top = main.querySelector(':scope > .card:not(.asmg)');
  const groups = [...document.querySelectorAll('details.asmg')].filter(d => d.open).map(d => ({ g: d.dataset.g, title: txt(d.querySelector('summary')),
    infl: !!d.querySelector('.infl'), set: d.querySelector('.asm') ? txt(d.querySelector('.asm')) : null,
    law: d.dataset.g === 'law' ? { rows: [...d.querySelectorAll('.mini')].map(m => [txt(m.querySelector('span')), txt(m.querySelector('b'))]), note: txt(d.querySelector('p.small')) } : null,
    fields: [...d.querySelectorAll('.field.asmf')].map(f => { const lab = f.querySelector('.flabel'), lt = lab.cloneNode(true); [...lt.querySelectorAll('.tag')].forEach(t => t.remove()); const box = f.querySelector('input.nb');
      const us = [...f.querySelectorAll('.nbu')].map(u => ({ t: u.textContent, before: box && !!(u.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING) }));
      return { k: f.dataset.k, label: txt(lt), tag: txt(lab.querySelector('.tag')), chips: [...f.querySelectorAll('[data-a="asmset"]')].map(c => ({ t: txt(c), pressed: c.getAttribute('aria-pressed') })),
        box: box ? { val: box.value, pre: (us.find(u => u.before) || {}).t || '', suf: (us.find(u => !u.before) || {}).t || '', inputmode: box.getAttribute('inputmode'), labelledby: box.getAttribute('aria-labelledby') } : null,
        std: txt(f.querySelector('[data-a="asmback"], [data-a="asmsug"]')), guide: txt(f.querySelector(':scope > span.small')) }; }) }));
  return { top: top ? { b: txt(top.querySelector('b')), p: txt(top.querySelector('p.small')), btn: txt(top.querySelector('[data-a="useall"]')), note: txt(top.querySelector('.btn + p.small')) } : null, groups,
    foot: [...main.querySelectorAll(':scope > p.small, :scope > .btn')].map(txt) }; };
