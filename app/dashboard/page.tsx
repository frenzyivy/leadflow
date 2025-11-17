"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import LeadTable from "@/components/LeadTable";
import LeadForm from "@/components/LeadForm";
import type { Lead } from "@/types/lead";

export default function DashboardPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/");
    }
  }, [loading, session, router]);

  const accessToken = session?.access_token ?? "";

  const fetchLeads = useCallback(async () => {
    if (!accessToken) return;
    try {
      setFetching(true);
      const response = await fetch("/api/leads", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to fetch leads");
      }
      const data = (await response.json()) as Lead[];
      setLeads(data);
      setFetching(false);
      setError(null);
    } catch (err) {
      setFetching(false);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchLeads();
    }
  }, [accessToken, fetchLeads]);

  const handleDelete = async (lead: Lead) => {
    if (!accessToken) return;
    const confirmDelete = window.confirm(
      `Delete ${lead.name}? This cannot be undone.`,
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to delete lead");
      }
      setLeads((prev) => prev.filter((item) => item.id !== lead.id));
      setSelectedLead(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete lead");
    }
  };

  const handleUpdate = (lead: Lead) => {
    setLeads((prev) =>
      prev.map((item) => (item.id === lead.id ? lead : item)),
    );
    setSelectedLead(null);
  };

  const summary = useMemo(() => {
    const total = leads.length;
    const converted = leads.filter((lead) => lead.status === "Converted").length;
    const contacted = leads.filter((lead) => lead.status === "Contacted").length;
    return {
      total,
      converted,
      contacted,
    };
  }, [leads]);

  if (!session && !loading) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <section className="flex flex-col gap-4 md:flex-row">
        <div className="card flex-1">
          <p className="text-sm text-slate-500">Total leads</p>
          <p className="mt-2 text-3xl font-semibold">{summary.total}</p>
        </div>
        <div className="card flex-1">
          <p className="text-sm text-slate-500">Converted</p>
          <p className="mt-2 text-3xl font-semibold">{summary.converted}</p>
        </div>
        <div className="card flex-1">
          <p className="text-sm text-slate-500">Contacted</p>
          <p className="mt-2 text-3xl font-semibold">{summary.contacted}</p>
        </div>
      </section>

      <section className="card">
        <div className="flex flex-col gap-2 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Leads overview
              </h1>
              <p className="text-sm text-slate-500">
                Track every lead from capture to conversion.
              </p>
            </div>
            <button
              onClick={() => router.push("/add-lead")}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              Add lead
            </button>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <LeadTable
          leads={leads}
          loading={fetching}
          onEdit={setSelectedLead}
          onDelete={handleDelete}
        />
      </section>

      {selectedLead ? (
        <section className="card">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Edit lead</h2>
              <p className="text-sm text-slate-500">{selectedLead.name}</p>
            </div>
            <button
              onClick={() => setSelectedLead(null)}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          <LeadForm
            accessToken={accessToken}
            initialValues={selectedLead}
            mode="edit"
            onSuccess={handleUpdate}
            onCancel={() => setSelectedLead(null)}
          />
        </section>
      ) : null}
    </div>
  );
}

