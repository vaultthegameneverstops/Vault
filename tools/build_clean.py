# Build clean.css from clean.src.css: every rule is scoped under "html body.vc" so it outranks
# the older "html body X{...!important}" theme layers in styles.css / fx.css.
import re, sys
src, out = sys.argv[1], sys.argv[2]
s = open(src).read()
s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)

def pre(sel):
    sel = sel.strip()
    if sel.startswith(':root'): return sel
    if sel == 'html': return 'html:has(body.vc)'
    if sel.startswith('body'): return 'html body.vc' + sel[4:]
    if re.search(r'\bh[1-4]\b', sel): return 'html body.vc #view ' + sel + ',html body.vc ' + sel
    return 'html body.vc ' + sel

def rules(block):
    res = []
    for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', block):
        sel, body = m.group(1), m.group(2)
        if re.match(r'\s*(from|to|\d+%)\s*$', sel.split(',')[0]):
            res.append(m.group(0)); continue
        res.append(','.join(pre(x) for x in sel.split(',') if x.strip()) + '{' + body.strip() + '}')
    return '\n'.join(res)

parts = re.split(r'(@(?:media|keyframes)[^{]+\{(?:[^{}]*\{[^{}]*\})*\s*\})', s)
res = ['/* VAULT clean theme (generated; scoped under body.vc). Charcoal, one blue accent, plain type, no glow. */']
for p in parts:
    if p.startswith('@media'):
        res.append(p[:p.index('{') + 1] + '\n' + rules(p[p.index('{') + 1:p.rindex('}')]) + '\n}')
    elif p.startswith('@keyframes'):
        res.append(p.strip())
    elif p.strip():
        res.append(rules(p))
open(out, 'w').write('\n'.join(res) + '\n')
