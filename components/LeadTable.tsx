"use client";

import Link from "next/link";
import type { Lead } from "@/types/lead";

interface LeadTableProps {
  leads: Lead[];
  loading?: boolean;
  onDelete?: (lead: Lead) => void;
}

const statusColor: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-amber-100 text-amber-700",
  Converted: "bg-emerald-100 text-emerald-700",
  Lost: "bg-rose-100 text-rose-700",
};

function getPrimaryContact(entries?: Lead["emails"] | Lead["phones"]) {
  if (!entries || !entries.length) return "";
  const primary = entries.find((entry) => entry.primary);
  return (primary ?? entries[0])?.value ?? "";
}

function formatName(lead: Lead) {
  const parts = [lead.first_name, lead.last_name].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return lead.name ?? "Unknown";
}

export default function LeadTable({ leads, loading, onDelete }: LeadTableProps) {
  if (loading) {
    return (
      <div className="text-center text-sm text-slate-500">
        Fetching the latest leads...
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
        No leads yet. Click &ldquo;Add Lead&rdquo; to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {leads.map((lead) => {
            const statusStyle =
              statusColor[lead.status ?? ""] ?? "bg-slate-100 text-slate-600";
            return (
              <tr key={lead.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium">{formatName(lead)}</td>
                <td className="px-4 py-3">{getPrimaryContact(lead.emails)}</td>
                <td className="px-4 py-3">{getPrimaryContact(lead.phones)}</td>
                <td className="px-4 py-3 capitalize">{lead.source ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}
                  >
                    {lead.status ?? "Unknown"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {lead.created_at
                    ? new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(lead.created_at))
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/leads/${lead.id}/edit`}
                    className="mr-3 text-sm font-semibold text-blue-600 hover:text-blue-500"
                  >
                    Edit
                  </Link>
                  {onDelete ? (
                    <button
                      onClick={() => onDelete(lead)}
                      className="text-sm font-semibold text-rose-600 hover:text-rose-500"
                    >
                      Delete
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

