const D=require('docx');const fs=require('fs');
const doc=new D.Document({sections:[{children:[new D.Paragraph({children:[new D.TextRun('hello')]})]}]});
D.Packer.toBuffer(doc).then(b=>fs.writeFileSync('pdf/mini.docx',b));
