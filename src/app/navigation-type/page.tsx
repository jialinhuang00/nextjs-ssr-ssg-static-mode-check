import Link from "next/link";

export default function About() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <Link href="/navigation-type/client-side-about">
        Client-Side Navigation Page by `next/link`
      </Link>
      <p className="text-xs mb-4">
        because default prefetch in next/link is true, it will also prefetch
        /navigation-type/client-side-about when loaded this page
      </p>
      <Link
        href="/navigation-type/client-side-no-prefetch-about"
        prefetch={false}
      >
        Client-Side Navigation Page by `next/link prefetch=false`
      </Link>
      <p className="text-xs mb-4">
        prefetch is false, it WONT prefetch when loaded this page, but still act
        like CSN
      </p>
      <a href="/navigation-type/traditional-navigation-about">
        Go to Traditional Navigation Page by `html anchor tag`
      </a>

      <h1 className="text-3xl">How?</h1>
      <p>Open Console, let `html` be red background, then click these two</p>
      <p>
        If Javascript disabled, `Client-Side Navigation` will fallback to
        `Traditional Navigation`
      </p>
      <p>Inspiration here:</p>
      <a href="https://stackoverflow.com/questions/64644248/next-js-client-side-navigation-vs-changes-in-html">
        Next.js - Client Side Navigation vs. changes in html
      </a>
    </div>
  );
}
