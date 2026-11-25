# Sets skipCrossRequestDedupe to true in the OpenNext output of cc/ (the workaround from
# opennextjs-cloudflare issue 1464). usage: python3 -I patch-dedupe.py <path to cc/.open-next>
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1])
compiled = re.compile(r'([A-Za-z_$][\w$]*)=[A-Za-z_$][\w$]*&&!0\|\|[A-Za-z_$][\w$]*\.isDraftMode;(?=try\{for\(;)')
source = re.compile(r'const skipCrossRequestDedupe = [^;]+;')
total = 0
for p in root.rglob('*'):
    if not p.is_file() or p.suffix not in ('.js', '.mjs'):
        continue
    text = p.read_text(encoding='utf8', errors='surrogateescape')
    new, a = compiled.subn(r'\1=!0;', text)
    new, b = source.subn('const skipCrossRequestDedupe = true;', new)
    if a + b:
        p.write_text(new, encoding='utf8', errors='surrogateescape')
        total += a + b
        print(f"{a} compiled, {b} source  {p.relative_to(root)}")
print(f"{total} replacements")
