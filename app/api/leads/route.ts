import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin, requireUser } from "@/lib/supabaseAdmin";
import { buildLeadPayload } from "@/lib/leadPayload";
import type { Lead } from "@/types/lead";

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { data, error: dbError } = await supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json(
      { error: dbError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = ((await req.json()) ?? {}) as Partial<Lead>;
  const payload = buildLeadPayload(body);
  const hasPrimaryContact =
    Boolean(payload.first_name) || Boolean(payload.emails?.length);

  if (!hasPrimaryContact) {
    return NextResponse.json(
      { error: "First name or an email address is required." },
      { status: 400 },
    );
  }

  if (!payload.status) {
    payload.status = "New";
  }

  const { data, error: dbError } = await supabaseAdmin
    .from("leads")
    .insert({
      ...payload,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json(
      { error: dbError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data, { status: 201 });
}

