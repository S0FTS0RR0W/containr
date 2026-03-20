import { NextResponse } from "next/server";

import { runContainerAction } from "@/lib/host-snapshot";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let containerId = "";

  try {
    const body = (await request.json()) as { containerId?: string };
    containerId = body.containerId?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!containerId) {
    return NextResponse.json(
      { error: "Container ID is required" },
      { status: 400 },
    );
  }

  try {
    await runContainerAction(containerId, "start");
    return NextResponse.json({ ok: true, action: "start", containerId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start container";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
