import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin, requireUser } from "@/lib/supabaseAdmin";
import { leadStatuses, type LeadStatus } from "@/types/lead";

function validateStatus(status?: string | null): LeadStatus {
  if (status && leadStatuses.includes(status as LeadStatus)) {
    return status as LeadStatus;
  }
  return "New";
}

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

  const body = await req.json();
  const { name, email, phone, source, status } = body ?? {};

  if (!name || !email || !phone || !source) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const leadStatus = validateStatus(status);

  const { data, error: dbError } = await supabaseAdmin
    .from("leads")
    .insert({
      name,
      email,
      phone,
      source,
      status: leadStatus,
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

