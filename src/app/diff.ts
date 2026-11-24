// Line diff by longest common subsequence. Inputs are a few lines long, so O(n·m) is fine.
// Used for the page sources (server) and for the API responses (browser).
export type Line = { op: ' ' | '+' | '-'; text: string }

export function lcsDiff(a: string[], b: string[]): Line[] {
  const n = a.length
  const m = b.length
  const t = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1])
  const out: Line[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ op: ' ', text: b[j++] })
      i++
    } else if (t[i + 1][j] >= t[i][j + 1]) out.push({ op: '-', text: a[i++] })
    else out.push({ op: '+', text: b[j++] })
  }
  while (i < n) out.push({ op: '-', text: a[i++] })
  while (j < m) out.push({ op: '+', text: b[j++] })
  return out
}
