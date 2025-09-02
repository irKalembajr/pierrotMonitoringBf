import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setState, getState } from "@/utils/store";
import { checkToken } from "@/utils/auth";

const schema = z.object({
  relay1: z.boolean(),
  relay2: z.boolean(),
  switch: z.boolean(),
  source: z.string().optional()
});

export async function POST(req: NextRequest) {
  if (!checkToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const saved = setState(parsed);
    return NextResponse.json({ ok: true, saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function GET() {
  const state = getState();
  return NextResponse.json({ state });
}
