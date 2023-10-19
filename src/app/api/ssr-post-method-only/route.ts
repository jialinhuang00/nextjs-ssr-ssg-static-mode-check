import { NextResponse } from "next/dist/server/web/spec-extension/response";

export async function POST() {
  try {
    return NextResponse.json({ mess: "success", status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Errorrrr" }, { status: 400 });
  }
}
