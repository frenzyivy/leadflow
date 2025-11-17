"use client";

import type { Lead } from "@/types/lead";

interface LeadTableProps {
  leads: Lead[];
  loading?: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const statusColor: Record<Lead["status"], string> = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-amber-100 text-amber-700",
  Converted: "bg-emerald-100 text-emerald-700",
  Lost: "bg-rose-100 text-rose-700",
};

export default function LeadTable({
  leads,
  loading,
  onEdit,
  onDelete,
}: LeadTableProps) {
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
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 font-medium">{lead.name}</td>
              <td className="px-4 py-3">{lead.email}</td>
              <td className="px-4 py-3">{lead.phone}</td>
              <td className="px-4 py-3 capitalize">{lead.source}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[lead.status]}`}
                >
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {new Intl.DateTimeFormat("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(lead.created_at))}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(lead)}
                  className="mr-3 text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(lead)}
                  className="text-sm font-semibold text-rose-600 hover:text-rose-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

