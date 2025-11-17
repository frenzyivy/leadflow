import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin, requireUser } from "@/lib/supabaseAdmin";
import { leadStatuses, type LeadStatus } from "@/types/lead";

type RouteParams = {
  params: {
    id: string;
  };
};

function validateStatus(status?: string | null): LeadStatus | undefined {
  if (!status) return undefined;
  if (leadStatuses.includes(status as LeadStatus)) {
    return status as LeadStatus;
  }
  return undefined;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { user, error } = await requireUser(req);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { id } = params;
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
    .update({
      name,
      email,
      phone,
      source,
      ...(leadStatus ? { status: leadStatus } : {}),
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

  const { id } = params;
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

