"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import LeadProfileForm from "@/components/LeadProfileForm";
import type { Lead } from "@/types/lead";

export default function EditLeadPage() {
  const params = useParams<{ id: string }>();
  const { session, loading } = useAuth();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/");
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (!session || !params?.id) return;
    const controller = new AbortController();
    const fetchLead = async () => {
      try {
        setFetching(true);
        const response = await fetch(`/api/leads/${params.id}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Unable to fetch lead.");
        }
        const data = (await response.json()) as Lead;
        setLead(data);
        setError(null);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to fetch lead.");
      } finally {
        setFetching(false);
      }
    };

    fetchLead();
    return () => controller.abort();
  }, [session, params?.id]);

  if (!session && !loading) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Lead profile
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Edit lead</h1>
        {error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <p className="text-sm text-slate-500">
            Update rich CRM details for this contact.
          </p>
        )}
      </div>
      {fetching ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading profile...
        </div>
      ) : (
        <LeadProfileForm
          accessToken={session?.access_token ?? ""}
          mode="edit"
          leadId={params?.id}
          initialLead={lead}
          onCancel={() => router.push("/dashboard")}
        />
      )}
    </div>
  );
}

