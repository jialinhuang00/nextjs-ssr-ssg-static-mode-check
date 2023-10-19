import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SSR",
  description:
    "Make user experiences last. Explore our UI/UX design and web development solutions and boost user engagement today with Confetti Studio.",
};

export default async function SSRPage() {
  const data = await getData();
  return (
    <div>
      <p className="text-black">/users</p>;
      <Link href={"/users/2"} className="text-black">
        /users/2
      </Link>
      <Link href={"/users/3"} className="text-black">
        /users/3
      </Link>
      <Link href={"/users/4"} className="text-black">
        /users/4
      </Link>
      <Link href={"/users/5"} className="text-black">
        /users/5
      </Link>
      ;
    </div>
  );
}

async function getData() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");

  if (!res.ok) throw new Error("Failed to fetch data");

  return res.json();
}
