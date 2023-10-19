# Note

The purpose of this project is to understand what factors Next.js uses to generate different types of pages, including SSG (Static Site Generation), SSR (Server-Side Rendering), and static pages.

# Result

````bash
 $ npm run build

> nextjs-ssr-ssg-static-mode-check@0.1.0 build
> next build

 ✓ Creating an optimized production build
 ✓ Compiled successfully
 ✓ Linting and checking validity of types
 ✓ Collecting page data
 ✓ Generating static pages (9/9)
 ✓ Collecting build traces
 ✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.25 kB        85.6 kB
├ ○ /_not-found                          882 B          81.2 kB
├ ○ /about                               144 B          80.5 kB
├ λ /api/ssr-post-method-only            0 B                0 B
├ ○ /api/static-get-only                 0 B                0 B
├ ● /ssg-comments/[commentId]            145 B          80.5 kB
├ ○ /ssr-users                           7.13 kB        87.5 kB
└ λ /ssr-users/[userId]                  144 B          80.5 kB
+ First Load JS shared by all            80.3 kB
  ├ chunks/472-23f435a9c16afa13.js       27.5 kB
  ├ chunks/fd9d1056-e4950b334bc218cf.js  50.9 kB
  ├ chunks/main-app-b81a62f80b3e9d35.js  230 B
  └ chunks/webpack-6c10bcbd0a0717ad.js   1.69 kB


λ  (Server)  server-side renders at runtime (uses getInitialProps or getServerSideProps)
○  (Static)  automatically rendered as static HTML (uses no initial props)
●  (SSG)     automatically generated as static HTML + JSON (uses getStaticProps)```
````
