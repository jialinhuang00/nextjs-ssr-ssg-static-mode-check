import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue'
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache'

// ISR needs all three, otherwise /isr and /isr-on-demand would never change:
//   incremental cache  R2 bucket holding the rendered pages and fetch responses
//   queue              Durable Object that runs the background rebuild after revalidate seconds
//   tag cache          Durable Object that records revalidatePath / revalidateTag
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  tagCache: doShardedTagCache({ baseShardSize: 4 }),
})
