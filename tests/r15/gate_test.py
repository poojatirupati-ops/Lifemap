import json, re, sys, openpyxl
sys.path.insert(0, '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14')
import xl
MAP = {e['id']: e for e in json.load(open('/home/user/lifegoals-prototype/tools/ui_calc_map.json'))}
spec = json.load(open('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r15/gate_spec.json'))
path = sys.argv[1]; verbose = len(sys.argv) > 2
wb = openpyxl.load_workbook(path)
x = xl.XL(path)
def loc(sheet):
    ws = wb[sheet]; return {n: ws.defined_names[n].attr_text.rsplit('!', 1)[1].replace('$', '') for n in ws.defined_names}
LOC = {e['sheet']: loc(e['sheet']) for e in MAP.values()}
NOI = 'Choose your inflation rate to see this'
GATE = re.compile(r'^(Choose|Add) .* to see this$')
maxr = max(len(s['rounds']) for s in spec); bad = []; n = 0; ok = 0; other = 0
def put(sh, name, v):
    a = LOC[sh].get(name + '_Entry') or LOC[sh].get(name)
    if a is None: bad.append((sh, 'NONAME', name)); return
    c = x.sh(sh).getCellRangeByName(a)
    if isinstance(v, str): c.setString(v)
    else: c.setValue(float(v))
    x.touched.append((sh, a))
for r in range(maxr):
    for s in spec:
        e = MAP[s['id']]; sh = e['sheet']
        if r >= len(s['rounds']): continue
        rd = s['rounds'][r]; ex = s['exp'][r]
        for i in e['inputs']:
            k = i['key']
            if k in ex['given']:
                v = ex['given'][k]
                v = v / 100 if i['kind'] == 'pct' else ('Yes' if v else 'No') if i['kind'] == 'yn' else v
                put(sh, i['name'], v)
        xt = {a[0]: a for a in (e['extra'][2] if len(e['extra']) > 2 else [])}
        for k, v in ex['asmg'].items():
            if k in xt:
                if len(xt[k]) > 2 and xt[k][2] == 'T': v = 'End of year' if v == 'end' else 'Start of year'
                put(sh, xt[k][1], v)
        if rd['infl'] is not None and 'Inflation_Choice' in LOC[sh] or ('Inflation_Choice_Entry' in LOC[sh] and rd['infl'] is not None): put(sh, 'Inflation_Choice', rd['infl'])
    x.calc()
    for s in spec:
        e = MAP[s['id']]; sh = e['sheet']
        if r >= len(s['rounds']): continue
        rd = s['rounds'][r]; ex = s['exp'][r]; n += 1
        vals = {o: x.getcell(sh, LOC[sh][o]) for o in e['outputs'] if o in LOC[sh]}
        gates = {o: v for o, v in vals.items() if isinstance(v, str) and GATE.match(v)}
        head = e['outputs'][0]
        if ex['gate']:
            if gates.get(head) == ex['gate']: ok += 1
            else: bad.append((s['id'], r, 'HEAD', ex['gate'], gates.get(head) or vals.get(head), rd['omit']))
            for o, v in gates.items():
                if v != ex['gate']: other += 1; bad.append((s['id'], r, 'OTHER', o, v, ex['gate']))
        else:
            if ex['infl']:
                if NOI in gates.values() and all(v == NOI for v in gates.values()): ok += 1
                else: bad.append((s['id'], r, 'INFL-missing', list(gates.items())[:2]))
            else:
                if not gates: ok += 1
                else: bad.append((s['id'], r, 'UNEXPECTED-GATE', list(gates.items())[:2]))
    x.clear()
print('cases', n, 'ok', ok, 'bad', len(bad))
from collections import Counter
print(Counter(b[2] for b in bad))
for b in bad[:int(sys.argv[2]) if verbose else 25]: print(b)
x.close()
