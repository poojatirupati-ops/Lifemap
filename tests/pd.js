function parseDoc(xml) {
  const body = xml.slice(xml.indexOf('<w:body>'));
  const ptext = p => norm(ent([...p.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>|<w:tab\/>/g)].map(m => m[1] == null ? '\t' : m[1]).join('')));
  const blocks = []; const re = /<w:tbl>[\s\S]*?<\/w:tbl>|<w:p[ >][\s\S]*?<\/w:p>/g; let m;
  while ((m = re.exec(body))) { const s = m[0];
    if (s.startsWith('<w:tbl>')) blocks.push({ t: 'tbl', rows: [...s.matchAll(/<w:tr[ >][\s\S]*?<\/w:tr>/g)].map(r => [...r[0].matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g)].map(c => norm([...c[0].matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)].map(p => ptext(p[0])).join(' ')))) });
    else { const st = (s.match(/<w:pStyle w:val="([^"]+)"/) || [])[1]; blocks.push({ t: 'p', style: st, text: ptext(s) }); } }
  const secs = []; let cur = null, h2 = null;
  for (const b of blocks) { if (b.t === 'p' && b.style === 'Heading1') { cur = { title: b.text, blocks: [] }; secs.push(cur); h2 = null; continue; }
    if (!cur) continue; if (b.t === 'p' && b.style === 'Heading2') h2 = b.text; b.h2 = h2; cur.blocks.push(b); }
  secs.forEach(s => { s.text = s.blocks.map(b => b.t === 'p' ? b.text : b.rows.map(r => r.join(' | ')).join(' || ')).join(' ## '); s.cells = new Set(s.blocks.filter(b => b.t === 'tbl').flatMap(b => b.rows.flat())); });
  return secs; }
