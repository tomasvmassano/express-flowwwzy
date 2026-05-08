import { NextRequest, NextResponse } from "next/server";
import { matchLibrary } from "@/lib/studio/match";
import { LIBRARY } from "@/lib/studio/library";
import { MatchRequestSchema } from "@/lib/studio/types";

export const runtime = "nodejs";

const isProd = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  // Light auth — Studio is internal.
  const STUDIO_KEY = process.env.STUDIO_API_KEY;
  if (isProd && STUDIO_KEY) {
    const provided = req.headers.get("x-studio-key");
    if (provided !== STUDIO_KEY) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = MatchRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  }

  const result = matchLibrary(parsed.data, LIBRARY);
  return NextResponse.json(result);
}

// Quick GET handler for sanity check — returns the library catalog so
// the client side can preview what's available.
export async function GET() {
  return NextResponse.json({
    library: LIBRARY.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      moodTags: c.moodTags,
      compatiblePalettes: c.compatiblePalettes,
    })),
    count: LIBRARY.length,
  });
}
