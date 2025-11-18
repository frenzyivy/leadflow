import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin, requireUser } from "@/lib/supabaseAdmin";
import { buildLeadPayload } from "@/lib/leadPayload";
import type { Lead } from "@/types/lead";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { user, error } = await requireUser(req);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { id } = await params;
  const { data, error: dbError } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (dbError) {
    return NextResponse.json(
      { error: dbError.message },
      { status: dbError.code === "PGRST116" ? 404 : 500 },
    );
  }

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { user, error } = await requireUser(req);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { id } = await params;
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

  const { data, error: dbError } = await supabaseAdmin
    .from("leads")
    .update({
      ...payload,
    })
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json(
      { error: dbError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { user, error } = await requireUser(req);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { id } = await params;
  const { error: dbError } = await supabaseAdmin
    .from("leads")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json(
      { error: dbError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

