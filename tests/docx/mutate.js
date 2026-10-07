const fs=require('fs'),JSZip=require('jszip');
(async()=>{const z=await JSZip.loadAsync(fs.readFileSync('/home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators-UIUX-Spec.docx'));let x=await z.file('word/document.xml').async('string');
const rep=(a,b)=>{ if(!x.includes(a)) throw new Error('not found: '+a); x=x.replace(a,b); };
rep('>Homes up to about<','>Homes up to<');                                   // 1 C01 result label template
rep('You are {Still_To_Build} away.','You are {Still_To_Build} short.');         // 2 C11 line template
rep('>Prefix &quot;€&quot;<','>Suffix &quot;€&quot;<');                         // 3 C01 unit
rep('>Mortgage free sooner by<','>Mortgage-free sooner by<');                    // 4 C04 label template
{ const a='New credit cards can&apos;t charge more than 23% APR (Central Bank of Ireland)'; if (!x.includes(a)) throw new Error('nf card'); x = x.split(a).join('New credit cards can&apos;t charge more than 25% APR (Central Bank of Ireland)'); } // 5 card APR guidance (Your assumptions, all occurrences)
rep('3.9% · Ireland now (CSO HICP flash, Sep 2026)','3.5% · Ireland now (CSO HICP flash, Sep 2026)');  // 6 inflation chip
rep('Choose your mortgage rate to see this · Also still to add or choose: house price growth, rent rises, upkeep.','Choose your interest rate to see this · Also still to add or choose: house price growth, rent rises, upkeep.'); // 7 C07 result gate
rep('including the credit union. They enter €9,000.<','including the credit union. They enter €9,500.<'); // 8 example card sentence (Cash savings)
rep('ve">The life you&apos;d like, mapped out.</w:t>','ve">The life you&apos;d like, mapped out!</w:t>'); // 9 cover headline (5.1)
{ const a='Use the suggested rate (3.48%) · Central Bank of Ireland: average rate on new mortgages, Jul 2026'; if (!x.includes(a)) throw new Error('nf chip'); x = x.split(a).join('Use the suggested rate (3.84%) · Central Bank of Ireland: average rate on new mortgages, Jul 2026'); } // 10 suggested-rate chip text
{ const a='Straight up the motorway'; if (!x.includes(a)) throw new Error('nf q8'); x = x.split(a).join('Straight up the motorways'); } // 11 Q8 answer wording (5.2)
{ const a='Irish pay has grown about 3%–4% a year recently (CSO)'; if (!x.includes(a)) throw new Error('nf set'); x = x.split(a).join('Irish pay has grown about 2%–4% a year recently (CSO)'); } // 12 a Settings wording (3.7.1, every occurrence)
{ const a='Death-in-service: lump sum'; if (!x.includes(a)) throw new Error('nf prot'); x = x.split(a).join('Death in service: lump sum'); } // 13 a protection field label (4.8, every occurrence)
{ const a='Which goal first?'; if (!x.includes(a)) throw new Error('nf rank'); x = x.split(a).join('Which goal comes first?'); } // 14 the ranking heading (6.2, every occurrence)
{ const a='use the same number.'; if (!x.includes(a)) throw new Error('nf months'); x = x.split(a).join('use the same value.'); } // 15 reworded Emergency fund months note (6.1, Appendix A)
{ const a='stay at the 2026 rates.'; if (!x.includes(a)) throw new Error('nf limits'); x = x.split(a).join('stay at the 2027 rates.'); } // 16 reworded Known limits row (3.6)
{ const a='Life cover, income protection, serious illness'; if (!x.includes(a)) throw new Error('nf box'); x = x.split(a).join('Life cover, income cover, serious illness'); } // 17 a specialist box blurb (2.5)
{ const a='Budget, surplus and debt'; if (!x.includes(a)) throw new Error('nf tile'); x = x.split(a).join('Budget, spare cash and debt'); } // 18 a Focus on one area tile blurb (2.2)
{ const a='Use the standards for the rest'; if (!x.includes(a)) throw new Error('nf std'); x = x.split(a).join('Use the standard for the rest'); } // 19 Step 7 button (3.5)
{ const a='3 details missing.'; if (!x.includes(a)) throw new Error('nf ban'); x = x.split(a).join('3 details left.'); } // 20 results banner (3.5.1)
{ const a='Your retirement plan: how it works'; if (!x.includes(a)) throw new Error('nf vid'); x = x.split(a).join('Your retirement plan: how it work'); } // 21 a video title (every occurrence)
{ const a='With this what-if you'; if (!x.includes(a)) throw new Error('nf wi'); x = x.split(a).join('With this what-if we'); } // 22 What-if live line
{ const a='Do you have a mortgage?'; if (!x.includes(a)) throw new Error('nf mort'); x = x.split(a).join('Do you have a mortgage loan?'); } // 23 Liabilities label
{ const a='One tap uses the standard for'; if (!x.includes(a)) throw new Error('nf card26'); x = x.split(a).join('One tap uses the standards for'); } // 24 the standards card text (7.5)
{ const a='Example figures. Change them to yours.'; if (!x.includes(a)) throw new Error('nf exlab'); x = x.split(a).join('Example figures. Change them.'); } // 25 the example-figures label (2.7)
{ const a='less about 1% charges'; if (!x.includes(a)) throw new Error('nf inv'); x = x.split(a).join('less about 2% charges'); } // 26 the investment standard wording (7.7)
{ const a='3 choices will still be yours to make'; if (!x.includes(a)) throw new Error('nf 15/3'); x = x.split(a).join('18 choices will still be yours to make'); } // 27 the standards card remainder (7.5)
z.file('word/document.xml',x); fs.writeFileSync('pdf/mut.docx', await z.generateAsync({type:'nodebuffer'})); 
 console.log('mutated 27'); })();
