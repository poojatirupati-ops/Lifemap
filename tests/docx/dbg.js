const fs=require('fs'),JSZip=require('jszip');
(async()=>{const z=await JSZip.loadAsync(fs.readFileSync('/home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators-UIUX-Spec.docx'));const x=await z.file('word/document.xml').async('string');
const i=x.indexOf('Payment too low to cover interest</w:t>'); const seg=x.slice(i, i+9000); console.log(seg.replace(/<[^>]+>/g,'|').replace(/\|+/g,'|').slice(0,1500));})();
