import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { buildArticlePackageGeneratorInput } from "@/lib/articlePackageContext";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = new URL(request.url).searchParams.get("plan")?.trim() ?? "";
  if (!plan) {
    return NextResponse.json({ error: "Missing plan query parameter" }, { status: 400 });
  }

  try {
    const input = await buildArticlePackageGeneratorInput(plan);
    return NextResponse.json({ ok: true, input });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to build article generator context.";
    const status = message.startsWith("Publishing-calendar item not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
