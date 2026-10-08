import sys, json
sys.path.insert(0, '.')
from harness import *
x = XL('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/out.xlsx')
d = json.load(open(sys.argv[1])); bad_n = 0
for k, e in enumerate(d):
    sc, out = e['sc'], e['out']
    apply_sc(x, sc); feed_typed(x, sc, out); x.calc()
    bad = [b for b in compare(x, sc, out) if b[0] == 'prof']
    if bad: bad_n += 1; print(sc['name'], bad[:6])
print('PROF FAIL', bad_n, 'of', len(d))
x.close()
