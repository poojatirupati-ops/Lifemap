import sys,subprocess,re
f=sys.argv[1]; s=open(f).read()
def rp(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:90]); s=s.replace(a,b)
code = r'''/* ================= SAVING FILES (journey-spec §24.3) =================
   Inside the shared page the viewer blocks printing and downloads, so files go through the "downloads" capability:
     claude.use("downloads").save({filename, data}).   Allowed file types: gif png jpg jpeg webp mp4 webm txt json md docx pptx epub csv ttf html svg pdf xlsx zip.
   The plan report: PDF (jsPDF + html2canvas, loaded from cdnjs only when the button is pressed) -> if that fails, the self-contained report as .html
   -> if downloads isn't available (the standalone file opened locally), window.print().
   The adviser meeting: ".ics" isn't allowed, so with downloads we save the details as a .txt; opened locally the normal .ics download still works. */
const CDN_JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', CDN_H2C = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
const dlPossible = () => { try { return !!(window.claude && typeof window.claude.use === 'function'); } catch (e) { return false; } };
async function dlGet(){ try { if (dlPossible()){ const d = await window.claude.use('downloads'); if (d && typeof d.save === 'function') return d; } } catch (e) {} return null; }
async function dlSave(filename, blob){ const d = await dlGet(); if (!d) return false;
  try { await d.save({filename, data:blob}); return true; } catch (e) { try { await d.save({filename, data:await blob.arrayBuffer()}); return true; } catch (e2) { return false; } } }
function loadScript(src){ return new Promise((res, rej) => { const old = document.querySelector('script[data-lib="' + src + '"]'); if (old) old.remove(); const el = document.createElement('script'), t = setTimeout(() => { el.remove(); rej(new Error('timeout ' + src)); }, 20000);
  el.src = src; el.async = true; el.dataset.lib = src; el.onload = () => { clearTimeout(t); res(); }; el.onerror = () => { clearTimeout(t); el.remove(); rej(new Error('load ' + src)); }; document.head.appendChild(el); }); }
async function pdfLibs(){ if (!(window.jspdf && window.jspdf.jsPDF)) await loadScript(CDN_JSPDF); if (typeof window.html2canvas !== 'function') await loadScript(CDN_H2C);
  if (!(window.jspdf && window.jspdf.jsPDF) || typeof window.html2canvas !== 'function') throw new Error('PDF library missing'); return {jsPDF:window.jspdf.jsPDF, h2c:window.html2canvas}; }
// A4 (210 x 297 mm), 12 mm side margins, 18 mm top and bottom for the header and footer. The report is drawn at 700 px wide.
const PDF = {w:210, h:297, mx:12, my:18, px:700};
function pdfPieces(el, maxPx){ const h = el.getBoundingClientRect().height; if (h <= maxPx) return [el];
  if (el.querySelector && el.querySelector(':scope > table') && el.classList.contains('tscroll')) return pdfTableChunks(el, maxPx);
  const kids = [...el.children]; return kids.length ? kids.flatMap(k => pdfPieces(k, maxPx)) : [el]; }
function pdfTableChunks(wrap, maxPx){ const t = wrap.querySelector('table'), head = t.tHead, rows = [...t.tBodies[0].rows], hh = head ? head.getBoundingClientRect().height : 0, out = []; let cur = [], h = hh;
  rows.forEach(r => { const rh = r.getBoundingClientRect().height; if (h + rh > maxPx - 4 && cur.length){ out.push(cur); cur = []; h = hh; } cur.push(r); h += rh; }); if (cur.length) out.push(cur);
  const made = out.map(rs => { const w = wrap.cloneNode(false); w.style.overflow = 'visible'; const t2 = t.cloneNode(false); t2.style.minWidth = '0'; if (head) t2.appendChild(head.cloneNode(true)); const tb = document.createElement('tbody'); rs.forEach(r => tb.appendChild(r.cloneNode(true))); t2.appendChild(tb); w.appendChild(t2); wrap.parentNode.insertBefore(w, wrap); return w; });
  wrap.style.display = 'none'; return made; }
async function buildPlanPdf(){ const {jsPDF, h2c} = await pdfLibs(), src = document.querySelector('#report .rep'); if (!src) throw new Error('no report');
  const host = document.createElement('div'); host.setAttribute('aria-hidden', 'true'); host.style.cssText = 'position:fixed;left:-12000px;top:0;width:' + PDF.px + 'px;background:#fff;color:#0B2545;z-index:-1';
  const art = src.cloneNode(true); art.style.cssText = 'margin:0;padding:0;max-width:none;width:' + PDF.px + 'px;border-radius:0'; host.appendChild(art); document.body.appendChild(host);
  try { await (document.fonts && document.fonts.ready); const contentMm = PDF.w - 2 * PDF.mx, usableMm = PDF.h - 2 * PDF.my, pxPerMm = PDF.px / contentMm, maxPx = Math.floor(usableMm * pxPerMm) - 2;
    const pieces = [...art.children].flatMap(k => pdfPieces(k, maxPx)), pdf = new jsPDF({unit:'mm', format:'a4', orientation:'portrait'}); let y = PDF.my, pages = 1;
    for (let i = 0; i < pieces.length; i++){ const el = pieces[i]; if (el.style.display === 'none') continue;
      const cv = await h2c(el, {scale:2, backgroundColor:'#ffffff', useCORS:true, logging:false}), hMm = cv.height * contentMm / cv.width;
      // keep a heading with what follows it
      let need = hMm; if (/^H[1-3]$/.test(el.tagName) && pieces[i + 1]) need += Math.min(40, pieces[i + 1].getBoundingClientRect().height / pxPerMm);
      if (y + need > PDF.h - PDF.my + 0.01 && y > PDF.my + 0.01){ pdf.addPage(); pages++; y = PDF.my; }
      pdf.addImage(cv.toDataURL('image/jpeg', 0.92), 'JPEG', PDF.mx, y, contentMm, hMm, undefined, 'FAST'); y += hMm + 2; }
    const n = pdf.getNumberOfPages(), name = (S.acct.name || 'Your') + '\'s LifeMap plan';
    for (let p = 1; p <= n; p++){ pdf.setPage(p); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(11, 37, 69); pdf.text('LifeMap', PDF.mx, 10); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(81, 98, 122); pdf.text(name.replace(/[^\x20-\x7EÀ-ſ]/g, ''), PDF.w - PDF.mx, 10, {align:'right'});
      pdf.setDrawColor(220, 228, 236); pdf.line(PDF.mx, 12.5, PDF.w - PDF.mx, 12.5); pdf.line(PDF.mx, PDF.h - 14, PDF.w - PDF.mx, PDF.h - 14);
      pdf.setFontSize(8); pdf.text('Preliminary guidance, not financial advice. Illustrative, not guaranteed.', PDF.mx, PDF.h - 9); pdf.text('Page ' + p + ' of ' + n, PDF.w - PDF.mx, PDF.h - 9, {align:'right'}); }
    return {blob:pdf.output('blob'), pages:n}; }
  finally { host.remove(); } }
function reportDocHTML(){ const src = document.querySelector('#report .rep'), css = [...document.querySelectorAll('style')].map(x => x.textContent).join('\n');
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc((S.acct.name || 'Your') + '\'s LifeMap plan') + '</title><style>' + css + '\nbody{display:block;background:#fff}.side,.stage{display:none!important}</style></head><body><article class="rep" style="margin:0 auto;max-width:820px">' + (src ? src.innerHTML : '') + '</article></body></html>'; }
function repMsg(t, bad){ const e = document.getElementById('rep-msg'); if (e){ e.textContent = t; e.style.color = bad ? '#FFD2CF' : '#C9F2DD'; } toast(t); }
let saving = false;
async function saveReport(btn){ if (saving) return;
  if (!(await dlGet())){ repMsg('Opening the print window. Choose "Save as PDF" as the printer.'); try { window.print(); } catch (e) { repMsg('Printing is blocked here. Open this page in your browser to save the PDF.', true); } return; }
  saving = true; if (btn) btn.disabled = true; repMsg('Preparing your PDF…');
  try { const r = await buildPlanPdf(), ok = await dlSave('LifeMap-plan.pdf', r.blob); if (!ok) throw new Error('save'); repMsg('Saved LifeMap-plan.pdf (' + r.pages + (r.pages === 1 ? ' page' : ' pages') + ').'); }
  catch (e) { const ok = await dlSave('LifeMap-plan.html', new Blob([reportDocHTML()], {type:'text/html'}));
    repMsg(ok ? 'We couldn\'t make the PDF here, so we saved your plan as LifeMap-plan.html. Open it and choose Print to get a PDF.' : 'We couldn\'t save your plan here. Please try again, or open this page in your browser.', !ok); }
  finally { saving = false; if (btn) btn.disabled = false; } }
async function saveMeeting(){ const b = S.book, A = ADVISERS[b.adv];
  const ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LifeMap//Prototype//EN\r\nBEGIN:VEVENT\r\nUID:lg-' + Date.now() + '\r\nDTSTAMP:20260929T090000Z\r\nDTSTART:20261001T090000Z\r\nDURATION:PT45M\r\nSUMMARY:LifeMap meeting with ' + A.n + '\r\nDESCRIPTION:' + b.mode + ' · ' + b.slot + '\r\nEND:VEVENT\r\nEND:VCALENDAR';
  if (await dlGet()){ const txt = 'Your LifeMap adviser meeting\r\n\r\nWith: ' + A.n + '\r\nWhen: ' + b.slot + '\r\nHow: ' + b.mode + '\r\nLength: 45 minutes\r\n\r\nAdd it to your calendar by hand. Confirmation was sent by email and SMS.\r\nGuidance, not advice.\r\n';
    const ok = await dlSave('LifeMap-meeting.txt', new Blob([txt], {type:'text/plain'})); toast(ok ? 'Meeting details saved as LifeMap-meeting.txt' : 'We couldn\'t save the file. Your meeting details are on this screen.'); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], {type:'text/calendar'})); a.download = 'lifemap-meeting.ics'; document.body.appendChild(a); a.click(); a.remove(); toast('Calendar file downloaded'); }
'''
rp("/* ================= RENDER ================= */\nfunction current(){", code + "/* ================= RENDER ================= */\nfunction current(){")
# button + msg
rp('<button data-r="print" style="background:var(--sun);color:var(--ink)">🖨 Print / save as PDF</button>','<button data-r="print" style="background:var(--sun);color:var(--ink)">🖨 Print / save as PDF</button><span id="rep-msg" role="status" aria-live="polite" style="font-size:13px;font-weight:700;flex:1 1 220px"></span>')
rp("if (r.dataset.r === 'print') window.print();","if (r.dataset.r === 'print') saveReport(r);")
# ics action
i=s.index("  ics:() => {"); j=s.index("  adjust:() =>")
s=s[:i]+"  ics:() => { saveMeeting(); },\n"+s[j:]
rp('data-a="ics">📆 Add to my calendar</button>','data-a="ics">\' + (dlPossible() ? \'📄 Save meeting details (.txt)\' : \'📆 Add to my calendar\') + \'</button>')
rp(".rep-bar{position:sticky",".rep-msg{font-size:13px}.rep-bar{position:sticky")
open(f,'w').write(s)
m=re.findall(r'<script>(.*?)</script>',s,re.S)[-1]
open('/tmp/_chk.js','w').write(m)
print(subprocess.run(['node','--check','/tmp/_chk.js'],capture_output=True,text=True).stderr[:800] or 'syntax ok')
