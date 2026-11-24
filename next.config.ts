import type { NextConfig } from 'next'

// Previous caching model: no cacheComponents. Route segment config (dynamic, revalidate,
// dynamicParams) only works here; with cacheComponents: true those exports are build errors.
const nextConfig: NextConfig = {}

export default nextConfig
