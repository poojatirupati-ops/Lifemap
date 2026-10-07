#!/bin/bash
# Rebuild the round-4 harness engine from the live prototype (regions by marker) + the instrumented project() tail from engine7_i.js
H=/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html
L(){ grep -n "$1" $H | head -1 | cut -d: -f1; }
A1=$(L "^const RULES_VERSION"); A2=$(L "^const ruleCount"); B1=$(L "^const GOALCAT"); B2=$(L "^const GC = "); C1=$(L "^const own = "); C2=$(awk -v s=$(L "^const FF = {") 'NR>s && /^};/{print NR; exit}' $H)
E1=$(L "^const eur = "); E2=$(L "^const clamp = "); R1=$(L "^const RM = "); R2=$((R1+1)); M1=$(L "^function mkGoal"); M2=$(L "^function setRetireAge"); G1=$(L "^const AS = {infl"); G2=$(L "^function pensionAt")
{ echo 'let S; function syncLists(){}'; sed -n "${A1},${A2}p" $H; sed -n "${B1},${B2}p" $H; sed -n "${C1},${C2}p" $H; sed -n "${E1}p;${E2}p" $H; sed -n "${R1},${R2}p" $H; sed -n "${M1},${M2}p" $H; sed -n "${G1},${G2}p" $H; sed -n '336,476p' engine7_i.js; } > engine8_i.js
