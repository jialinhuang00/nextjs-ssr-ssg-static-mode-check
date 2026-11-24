import { SOURCES } from './sources.generated'

// '/ssg' lives in src/app/ssg/[id]/page.tsx, so a base also matches one [param] segment under it.
export function sourceFor(base: string): (typeof SOURCES)[string] | undefined {
  const key = Object.keys(SOURCES).find((k) => k === base || new RegExp(`^${base}/\\[[^/]+\\]$`).test(k))
  if (key) return SOURCES[key]
  // '/ssg/9' is one value of '/ssg/[id]': fall back to the parent's file
  const parent = base.slice(0, base.lastIndexOf('/'))
  return parent ? sourceFor(parent) : undefined
}
