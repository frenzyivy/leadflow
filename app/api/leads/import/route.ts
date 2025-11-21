import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin, requireUser } from "@/lib/supabaseAdmin";
import { buildLeadPayload } from "@/lib/leadPayload";
import type { Lead } from "@/types/lead";

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = (await req.json()) as
    | {
        leads?: Array<Partial<Lead>>;
      }
    | undefined;

  if (!body?.leads?.length) {
    return NextResponse.json(
      { error: "No leads supplied. Provide an array under `leads`." },
      { status: 400 },
    );
  }

  const cleaned = [];
  for (const raw of body.leads) {
    const payload = buildLeadPayload(raw ?? {});
    const hasPrimaryContact =
      Boolean(payload.first_name) || Boolean(payload.emails?.length);
    if (!hasPrimaryContact) {
      return NextResponse.json(
        {
          error:
            "Each lead must include at least a first_name or one email address.",
        },
        { status: 400 },
      );
    }
    if (!payload.status) {
      payload.status = "New";
    }
    cleaned.push(payload);
  }

  const { data, error: dbError } = await supabaseAdmin
    .from("leads")
    .insert(cleaned)
    .select();

  if (dbError) {
    return NextResponse.json(
      { error: dbError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ inserted: data?.length ?? 0, leads: data }, { status: 201 });
}

