import { NextResponse } from "next/server";

import { type ContainerAction, runContainerAction } from "@/lib/host-snapshot";

const ALLOWED_ACTIONS: ContainerAction[] = ["start", "stop", "restart"];

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  let action = "";

  try {
    const body = (await request.json()) as { action?: string };
    action = body.action ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!ALLOWED_ACTIONS.includes(action as ContainerAction)) {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  try {
    await runContainerAction(id, action as ContainerAction);
    return NextResponse.json({ ok: true, action, id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Container action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
