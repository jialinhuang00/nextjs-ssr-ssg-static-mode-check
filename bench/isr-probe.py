# Requests a page at fixed offsets and prints the rendered time, uuid and cache header of each
# response, to see when an ISR page is replaced.
# usage: python3 -I isr-probe.py https://nextmode.jialin00.com /isr 0 3 8 40 45 50
import re
import sys
import time
import urllib.request

origin, path = sys.argv[1], sys.argv[2]
offsets = [float(x) for x in sys.argv[3:]]
t0 = time.time()
for off in offsets:
    wait = t0 + off - time.time()
    if wait > 0:
        time.sleep(wait)
    req = urllib.request.Request(origin + path, headers={"User-Agent": "isr-probe"})
    with urllib.request.urlopen(req) as r:
        body = r.read().decode("utf8", "replace")
        m = re.search(r'data-rendered[^>]*>([^<]+)<', body)
        u = re.search(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', body)
        now = time.strftime("%H:%M:%S", time.gmtime())
        print(f"t+{off:>4.0f}s  at {now}Z  rendered {m.group(1) if m else '(none)'}  uuid {u.group(0)[:8] if u else '-'}  x-nextjs-cache {r.headers.get('x-nextjs-cache')}")
