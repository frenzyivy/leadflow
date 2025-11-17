"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import LeadForm from "@/components/LeadForm";

export default function AddLeadPage() {
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card space-y-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">New lead</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Add a qualified prospect
          </h1>
          <p className="text-sm text-slate-500">
            Capture key contact details so your team can follow up quickly.
          </p>
        </div>
        <LeadForm
          accessToken={session?.access_token ?? ""}
          redirectOnSuccess="/dashboard"
        />
      </div>
    </div>
  );
}

