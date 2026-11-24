# When does each chunk of a fresh /<prefix><id> response arrive, on the first visit and the second?
#
# Checks Gin G2 (main app, /ssg-fallback/) and G8 (cc/ sub-app, cacheComponents + partialPrefetching,
# route /<id>). For an id outside generateStaticParams, a streamed fallback shows as a first chunk
# with "loading…" and the page (data-rendered) about 2 s later. If both arrive together, the
# server waited for the whole page. The second visit to the same id shows whether the finished
# page was stored: it should come back at once, with the same rendered time.
#
# In the main app the 2 s is a setTimeout; in cc/ it is a fetch to httpbin.org/delay/2, so the
# page there also includes the round trip to httpbin.
#
# The id is random and >= 1000 on every run, so the page is never already in the cache.
# Self-check: the script stops if the first chunk of the first visit already holds
# data-rendered (cached page).
#
# usage: python3 -I bench/stream-timing.py http://localhost:3000                       (main app)
#        python3 -I bench/stream-timing.py https://nextmode.jialin00.com
#        python3 -I bench/stream-timing.py http://localhost:3201 /                     (cc/, next start)
#        python3 -I bench/stream-timing.py https://cc.nextmode.jialin00.com /
import http.client
import random
import re
import sys
import time
from urllib.parse import urlparse

base = urlparse(sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000")
prefix = sys.argv[2] if len(sys.argv) > 2 else "/ssg-fallback/"
path = f"{prefix}{random.randint(1000, 10**9)}"
Conn = http.client.HTTPSConnection if base.scheme == "https" else http.client.HTTPConnection


def visit(n):
    c = Conn(base.hostname, base.port)
    t0 = time.time()
    c.request("GET", path, headers={"Accept-Encoding": "identity"})
    r = c.getresponse()
    print(f"visit {n}: {base.geturl()}{path} -> {r.status}")
    first = True
    body = ""
    while True:
        b = r.read1(65536)
        if not b:
            break
        s = b.decode("utf8", "replace")
        body += s
        if n == 1 and first and "data-rendered" in s:
            sys.exit("first chunk already has data-rendered: cached page or not streamed; pick another id")
        first = False
        print(f"  {time.time() - t0:6.2f}s {len(b):6d} bytes loading={'loading…' in s} rendered={'data-rendered' in s}")
    m = re.search(r'data-rendered[^>]*>([^<]+)<', body)
    print(f"  rendered at: {m.group(1) if m else '(none)'}")
    if "couldn" in body or r.status >= 500:
        print("  error page in the response")


visit(1)
visit(2)
