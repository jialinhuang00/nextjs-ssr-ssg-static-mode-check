# Does the second visit to a fresh id in cc/ still fail when it comes long after the first?
# Visits one fresh id per wait, all at the start, then visits each id again after its wait.
# The guess being tested: the second visit fails because it reaches the isolate that served
# the first visit. If so, a second visit that comes after that isolate is gone should work.
# usage: python3 -I bench/cc-second-visit-wait.py https://cc.nextmode.jialin00.com 300 1800 7200
# The waits are in seconds. Every request here also reaches the Worker, so the id with the
# longest wait sees a Worker that was last used at the previous revisit, not at the start.
import random
import re
import sys
import time
import urllib.request

origin = sys.argv[1]
waits = sorted(float(x) for x in sys.argv[2:])


def visit(label, path):
    t0 = time.time()
    req = urllib.request.Request(origin + path, headers={"User-Agent": "cc-second-visit-wait"})
    with urllib.request.urlopen(req) as r:
        body = r.read().decode("utf8", "replace")
        status, ray = r.status, r.headers.get("cf-ray")
    m = re.search(r'data-rendered[^>]*>([^<]+)<', body)
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    print(
        f"{now}  {label:<22} {path:<12} {status}  {time.time() - t0:5.2f}s  {len(body):6d} bytes  "
        f"rendered {m.group(1) if m else '(none)'}  errored {'$RX(' in body}  cf-ray {ray}",
        flush=True,
    )


start = time.time()
ids = [f"/{random.randint(1000, 10**9)}" for _ in waits]
for w, path in zip(waits, ids):
    visit(f"visit 1 (wait {w:.0f}s)", path)
for w, path in zip(waits, ids):
    left = start + w - time.time()
    if left > 0:
        time.sleep(left)
    visit(f"visit 2 after {w:.0f}s", path)
