#!/bin/bash
# Full suite; prints FAILS/ERRORS lines per script
cd /tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad
export NODE_PATH=/opt/node22/lib/node_modules
mkdir -p r7/logs
for w in 390 1280 844; do timeout 1200 node e2e.js $w > r7/logs/e2e-$w.log 2>&1; echo "== e2e $w exit $? | $(grep -E 'ERRORS|FAIL' r7/logs/e2e-$w.log | tail -3 | tr '\n' ' ' | cut -c1-300)"; done
for s in precedence.js chart.js fp4.js fp/mono.js road.js landfit.js noret.js v5.js v6.js v7.js v8.js v9.js v10.js v11.js v12.js rules.js asm.js choices.js emerg.js cta2.js s19.js s21.js s22.js s23.js s24.js s24c.js s25.js s26.js s27.js; do [ -f $s ] || { echo "== $s MISSING"; continue; }; timeout 1200 node $s > r7/logs/$(basename $s).log 2>&1; echo "== $s exit $? | $(grep -E 'ERRORS|FAILS|nFails|BAD|\"fail\"' r7/logs/$(basename $s).log | tail -4 | tr '\n' ' ' | cut -c1-300)"; done
for s in sfix.js saud.js overridetest.js; do timeout 1200 node $s > r7/logs/$s.log 2>&1; echo "== $s exit $? | $(grep -E 'ERRORS|FAILS' r7/logs/$s.log | tail -2 | tr '\n' ' ')"; done
