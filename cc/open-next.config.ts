import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'

// Only the incremental cache: the stored page for each id lives in R2. No revalidate and
// no revalidatePath here, so no queue and no tag cache.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
})
