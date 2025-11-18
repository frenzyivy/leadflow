"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import LeadProfileForm from "@/components/LeadProfileForm";

export default function NewLeadPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/");
    }
  }, [loading, session, router]);

  if (!session && !loading) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Lead profile
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Create lead</h1>
        <p className="text-sm text-slate-500">
          Capture everything about this contact in one pass.
        </p>
      </div>
      <LeadProfileForm
        accessToken={session?.access_token ?? ""}
        mode="create"
        onCancel={() => router.push("/dashboard")}
      />
    </div>
  );
}

