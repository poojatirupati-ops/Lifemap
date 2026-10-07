const fs=require('fs'); eval(fs.readFileSync('base.js','utf8')+fs.readFileSync('newproj.js','utf8')+`;global.run=run;`);
function run(){}
