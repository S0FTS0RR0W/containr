import { NextResponse } from "next/server";

import { getContainerLogs } from "@/lib/host-snapshot";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const tailParam = url.searchParams.get("tail") ?? "120";
  const parsedTail = Number(tailParam);
  const tail = Number.isFinite(parsedTail)
    ? Math.max(1, Math.min(parsedTail, 1000))
    : 120;

  try {
    const logs = await getContainerLogs(id, tail);
    return new NextResponse(logs || "No logs returned", {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch logs";
    return new NextResponse(message, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
