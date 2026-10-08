#!/bin/bash
cd /tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14
export NODE_PATH=/opt/node22/lib/node_modules
python3 harness.py $PWD/final.xlsx $1 ${2:-6} > $3 2>&1
