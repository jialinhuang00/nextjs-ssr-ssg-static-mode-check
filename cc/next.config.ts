import type { NextConfig } from 'next'

// The new caching model, for the one thing the parent app cannot show: the Pages Router's
// fallback: true. Per node_modules/next/dist/docs/01-app/02-guides/
// incremental-static-regeneration-cache-components.md, both flags are needed for an unlisted
// id to get the fallback first and then a stored, URL-specific page.
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // the parent folder has its own lockfile; this app is its own root
  turbopack: { root: __dirname },
  experimental: {
    // On Workers, the second visit to an id failed with "Failed to parse postponed state"
    // (RangeError ERR_OUT_OF_RANGE): workerd's zlib rejects the maxOutputLength Next passes
    // when it inflates the stored resume data. Storing it uncompressed skips that inflate, and
    // that error is gone. The second visit still fails on Workers, with a different error
    // ("This promise was created by a request that has since ended"); see
    // results/cc-stream-timing-2026-11-22.txt. Under next start both visits work.
    disableResumeDataCacheCompression: true,
  },
}

export default nextConfig
