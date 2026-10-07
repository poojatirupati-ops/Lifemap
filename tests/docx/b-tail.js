// ---------- assemble ----------
const doc = new Document({
  creator: 'LifeMap UI/UX design', title: 'LifeMap Calculators UI/UX Spec', description: 'Exact-replica calculator specification',
  features: { updateFields: true },
  styles: { default: { document: { run: { font: FONT, size: 20, color: '1F2D3D' } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 36, bold: true, color: INK }, paragraph: { spacing: { before: 0, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 26, bold: true, color: SEA_D }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 21, bold: true, color: INK }, paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } }] },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 260 } } } }, { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 800, hanging: 260 } } } }] },
    { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1020, bottom: 1020, left: 1020, right: 1020, header: 500, footer: 500 } } },
    headers: { default: new Header({ children: [new Paragraph({ children: [run('LifeMap · Calculators UI/UX build specification', { size: 15, color: MUTED })], alignment: AlignmentType.RIGHT })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], font: FONT, size: 15, color: MUTED }), run('   ·   Guidance, not advice. Figures are illustrative.', { size: 15, color: MUTED })] })] }) },
    children }],
});
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const TOCP = path.join(__dirname, 'toc.json'), tocPages = fs.existsSync(TOCP) ? JSON.parse(fs.readFileSync(TOCP, 'utf8')) : {};
const H1S = children.filter(p => p instanceof Paragraph && p.__h1).map(p => p.__h1);
const xe = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
Packer.toBuffer(doc).then(async b => { const JSZip = require('jszip'); const z = await JSZip.loadAsync(b); let x = await z.file('word/document.xml').async('string');
  const entries = H1S.map(t => '<w:p><w:pPr><w:pStyle w:val="TOC1"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9860"/></w:tabs><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="19"/></w:rPr><w:t xml:space="preserve">' + xe(t) + '</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="19"/></w:rPr><w:tab/><w:t>' + (tocPages[t] || '') + '</w:t></w:r></w:p>').join('');
  const sep = '<w:fldChar w:fldCharType="separate"/></w:r></w:p>'; if (!x.includes(sep)) throw new Error('toc sep'); x = x.replace(sep, sep + entries);
  z.file('word/document.xml', x); const out = await z.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }); fs.writeFileSync(OUT, out); fs.writeFileSync(path.join(__dirname, 'h1.json'), JSON.stringify(H1S)); console.log('wrote', OUT, out.length, 'toc entries', H1S.length); });
