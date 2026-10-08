"""E4: make the calculators' gate wording and order identical to the app.
Reads gates_static.json (from the prototype: calcMissing order and texts) and tools/ui_calc_map.json (prototype key -> workbook name),
then rewrites every Need_ helper chain: assumption items use the app text and come in the app order, then the retirement-age
check, then the inflation gate (the app shows inflation only after every other choice)."""
import json, re, sys, openpyxl

SRC = sys.argv[1] if len(sys.argv) > 1 else None; OUT = sys.argv[2] if len(sys.argv) > 2 else None
R15 = '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r15'
G = json.load(open(R15 + '/gates_static.json'))
MAP = {e['id']: e for e in json.load(open('/home/user/lifegoals-prototype/tools/ui_calc_map.json'))}

def split_args(s):
    """split the inside of f(...) on top-level commas"""
    out, depth, cur, i, instr = [], 0, '', 0, False
    while i < len(s):
        ch = s[i]
        if instr:
            cur += ch
            if ch == '"':
                if i + 1 < len(s) and s[i + 1] == '"': cur += '"'; i += 1
                else: instr = False
        elif ch == '"': instr = True; cur += ch
        elif ch == '(': depth += 1; cur += ch
        elif ch == ')': depth -= 1; cur += ch
        elif ch == ',' and depth == 0: out.append(cur); cur = ''
        else: cur += ch
        i += 1
    out.append(cur); return out

def inner(call):
    """'IF(a,b,c)' -> ['a','b','c'] (None if not a call that spans the whole string)"""
    m = re.match(r'^IF\(', call)
    if not m or not call.endswith(')'): return None
    body = call[3:-1]
    # make sure the closing paren matches the opening one
    d = 0; instr = False
    for i, ch in enumerate(call[2:], start=2):
        if ch == '"': instr = not instr
        if instr: continue
        if ch == '(': d += 1
        elif ch == ')':
            d -= 1
            if d == 0 and i != len(call) - 1: return None
    return split_args(body)

def parse_chain(f):
    segs = []; cur = f.lstrip('=')
    while True:
        a = inner(cur)
        if a is None or len(a) != 3: return segs, cur
        segs.append((a[0], a[1])); cur = a[2]

def build(segs, tail):
    s = tail
    for c, t in reversed(segs): s = f'IF({c},{t},{s})'
    return '=' + s

def names_for(cid):
    e = MAP[cid]; m = {i['key']: i['name'] for i in e['inputs']}
    if len(e['extra']) > 2:
        for x in e['extra'][2]: m[x[0]] = x[1]
    return m

def run(wb):
    report = []
    for cid, e in MAP.items():
        ws = wb[e['sheet']]; nm = names_for(cid)
        items = [it for it in G[cid] if it['kind'] in ('input', 'asm') and not it.get('std')]
        stdn = {nm[it['key']] for it in G[cid] if it.get('std') and it['key'] in nm}; allnames = set(nm.values())
        order = []   # (workbook name, app text)
        for it in items:
            w = nm.get(it['key'])
            if not w: report.append((cid, 'no workbook name for', it['key'])); continue
            if w not in [o[0] for o in order]: order.append((w, it['text'] + ' to see this'))
        # budget: three keys, one text; keep one entry per name
        txt = dict(order); idx = {w: i for i, (w, _) in enumerate(order)}
        chains = {}
        for dn in list(ws.defined_names):
            if not dn.startswith('Need_'): continue
            cell = ws.defined_names[dn].attr_text.split('!')[1].replace('$', '')
            f = ws[cell].value
            if not isinstance(f, str): continue
            segs, tail = parse_chain(f)
            if not segs or tail.strip() != '""': report.append((cid, dn, 'not a plain chain', f[:80])); continue
            def only_std(c, t):   # a segment that waits only for LifeMap standards never fires now: they always have a value
                refs = {w for w in re.findall(r'\b(?:Used_)?([A-Z][A-Za-z0-9_]*)\b', c + ' ' + t) if w in allnames}
                return bool(refs) and refs <= stdn
            segs = [(c, t) for c, t in segs if not only_std(c, t)]
            chains[dn] = (cell, segs)
        def rankof(c, t):
            blob = c + ' ' + t
            toks = set(re.findall(r'\b(?:Used_)?([A-Z][A-Za-z0-9_]*)\b', blob))
            hits = [idx[w] for w in toks if w in idx]
            if 'Inflation_Choice' in toks: return (3, 0)
            if hits: return (1, min(hits))
            if 'ISNUMBER(Age)' in c and 'Retire_Later' in c: return (2, 0)
            return (0, 0)
        # the assumption items every output must wait for (the app gates the whole result), taken from all chains of the sheet
        union = {}
        for dn, (cell, segs) in chains.items():
            for c, t in segs:
                if rankof(c, t)[0] == 1: union.setdefault(c, (c, t))
        for dn, (cell, segs) in chains.items():
            if not segs: ws[cell].value = '=""'; continue
            have = {c for c, t in segs}
            segs = segs + [v for c, v in union.items() if c not in have]
            new = []
            for k, (c, t) in enumerate(segs):
                def fix(m):
                    w = m.group(1)
                    return f'{w}="",' + '"' + txt[w] + '"' if w in txt else m.group(0)
                c2 = re.sub(r'\b(\w+)="","(?:Choose|Add) [^"]*? to see this"', fix, c)
                t2 = re.sub(r'\b(\w+)="","(?:Choose|Add) [^"]*? to see this"', fix, t)
                mm = re.match(r'^(\w+)=""$', c)
                if mm and mm.group(1) in txt and re.match(r'^"(?:Choose|Add) [^"]*? to see this"$', t): t2 = '"' + txt[mm.group(1)] + '"'
                rank = rankof(c, t)
                new.append((rank, k, c2, t2))
            new.sort(key=lambda x: (x[0], x[1]))
            ws[cell].value = build([(c, t) for _, _, c, t in new], '""')
        report.append((cid, 'ok', [w for w, _ in order]))
    return report

if __name__ == '__main__' and SRC:
    wb = openpyxl.load_workbook(SRC)
    rep = run(wb)
    for r in rep:
        if r[1] != 'ok': print(r)
    wb.save(OUT); print('saved', OUT)
