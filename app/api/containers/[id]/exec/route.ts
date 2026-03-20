import { NextResponse } from "next/server";

import { executeContainerCommand } from "@/lib/host-snapshot";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  let command = "";

  try {
    const body = (await request.json()) as { command?: string };
    command = body.command?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!command) {
    return NextResponse.json(
      { error: "Command cannot be empty" },
      { status: 400 },
    );
  }

  const result = await executeContainerCommand(id, command);
  return NextResponse.json(
    {
      containerId: id,
      command,
      output: result.output,
      exitCode: result.exitCode,
    },
    { status: result.ok ? 200 : 500 },
  );
}
