import { NextResponse } from "next/server";

import { getHostSnapshot } from "@/lib/host-snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getHostSnapshot();
  const status = snapshot.connected ? 200 : 503;
  return NextResponse.json(snapshot, { status });
}
