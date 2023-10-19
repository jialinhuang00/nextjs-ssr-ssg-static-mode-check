import { NextResponse } from "next/server";

export async function GET() {
  // const res = await fetch("https://jsonplaceholder.typicode.com/todos/2", {
  //   next: { revalidate: 20 },
  // });
  // const data = await res.json();

  return NextResponse.json({ hello: "world" });
}
