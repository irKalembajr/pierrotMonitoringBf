import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setCommand, popCommand, peekCommand } from "@/utils/store";
import { checkToken } from "@/utils/auth";

const cmdSchema = z.object({
  relay1: z.boolean().optional(),
  relay2: z.boolean().optional()
}).refine(d => d.relay1 !== undefined || d.relay2 !== undefined, {
  message: "Provide relay1 or relay2"
});

// UI / admin sends a command
export async function POST(req: NextRequest) {
  if (!checkToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = cmdSchema.parse(body);
    const saved = setCommand(parsed);
    return NextResponse.json({ ok: true, saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// Device polls for command (then consumes it)
export async function GET(req: NextRequest) {
  if (!checkToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const mode = req.nextUrl.searchParams.get("mode") || "pop";
  const payload = mode === "peek" ? peekCommand() : popCommand();
  return NextResponse.json({ command: payload });
}
