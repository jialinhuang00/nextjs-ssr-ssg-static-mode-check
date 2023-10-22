# Note

The purpose of this project is to understand what factors Next.js uses to generate different types of pages, including SSG (Static Site Generation), SSR (Server-Side Rendering), and static pages.

# Result

```bash
 ✓ Creating an optimized production build
 ✓ Compiled successfully
 ✓ Linting and checking validity of types
 ✓ Collecting page data
 ✓ Generating static pages (19/19)
 ✓ Collecting build traces
 ✓ Finalizing page optimization

Route (app)                                         Size     First Load JS
┌ λ /                                               158 B          80.5 kB
├ ○ /_not-found                                     882 B          81.2 kB
├ λ /api/ssr-post-method-only                       0 B                0 B
├ ○ /api/static-get-only                            0 B                0 B
├ ○ /navigation-type                                185 B          87.5 kB
├ ○ /navigation-type/client-side-about              184 B          87.5 kB
├ ○ /navigation-type/client-side-no-prefetch-about  184 B          87.5 kB
├ ○ /navigation-type/traditional-navigation-about   158 B          80.5 kB
├ ○ /ssg-comments                                   158 B          80.5 kB
├ ● /ssg-comments/[commentId]                       158 B          80.5 kB
├   ├ /ssg-comments/16
├   ├ /ssg-comments/17
├   ├ /ssg-comments/18
├   └ [+2 more paths]
├ ○ /ssg-no-spec-generating-comments                158 B          80.5 kB
├ ● /ssg-no-spec-generating-comments/[commentId]    158 B          80.5 kB
├ ○ /ssr-users                                      184 B          87.5 kB
└ λ /ssr-users/[userId]                             158 B          80.5 kB
+ First Load JS shared by all                       80.3 kB
  ├ chunks/472-23f435a9c16afa13.js                  27.5 kB
  ├ chunks/fd9d1056-e4950b334bc218cf.js             50.9 kB
  ├ chunks/main-app-b81a62f80b3e9d35.js             230 B
  └ chunks/webpack-bfe13959c70bd239.js              1.69 kB


λ  (Server)  server-side renders at runtime (uses getInitialProps or getServerSideProps)
○  (Static)  automatically rendered as static HTML (uses no initial props)
●  (SSG)     automatically generated as static HTML + JSON (uses getStaticProps)
```

# Inspiration

https://www.youtube.com/watch?v=E1HzFvXgrCs&ab_channel=DaveGray
