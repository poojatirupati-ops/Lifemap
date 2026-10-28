#!/bin/sh
# Print the board: status per card
cd "$(dirname "$0")"; for s in todo doing review changes done; do echo "== $s"; grep -l "^status: $s" [TB][0-9]*.md 2>/dev/null | while read f; do echo "  ${f%.md} $(head -1 $f | cut -c3-)"; done; done
