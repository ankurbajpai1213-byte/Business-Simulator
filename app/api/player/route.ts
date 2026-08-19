import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const PLAYER_COOKIE = "bs_player";
const NAME_COOKIE = "bs_player_name";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function GET() {
  const cookieStore = await cookies();
  const id = cookieStore.get(PLAYER_COOKIE)?.value;
  const display_name = cookieStore.get(NAME_COOKIE)?.value;
  return NextResponse.json({ player: id && display_name ? { id, display_name } : null });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const name = String(body.name ?? "").trim().slice(0, 60);
    if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    const cookieStore = await cookies();
    const id = cookieStore.get(PLAYER_COOKIE)?.value || crypto.randomUUID();
    const response = NextResponse.json({ player: { id, display_name: name } });
    response.cookies.set(PLAYER_COOKIE, id, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE });
    response.cookies.set(NAME_COOKIE, name, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE });
    return response;
  } catch (error) {
    console.error("[player] create failed", error);
    return NextResponse.json({ error: "Unable to save player." }, { status: 500 });
  }
}
