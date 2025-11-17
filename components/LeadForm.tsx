"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadPayload } from "@/types/lead";
import { leadStatuses } from "@/types/lead";

interface LeadFormProps {
  accessToken: string;
  initialValues?: Lead;
  mode?: "create" | "edit";
  onSuccess?: (lead: Lead) => void;
  onCancel?: () => void;
  redirectOnSuccess?: string;
}

const defaultValues: LeadPayload = {
  name: "",
  email: "",
  phone: "",
  source: "",
  status: "New",
};

export default function LeadForm({
  accessToken,
  initialValues,
  mode = "create",
  onSuccess,
  onCancel,
  redirectOnSuccess,
}: LeadFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<LeadPayload>(
    initialValues
      ? {
          name: initialValues.name,
          email: initialValues.email,
          phone: initialValues.phone,
          source: initialValues.source,
          status: initialValues.status,
        }
      : defaultValues,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    field: keyof LeadPayload,
    value: string | undefined,
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) {
      setError("You must be logged in to perform this action.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const endpoint =
        mode === "create"
          ? "/api/leads"
          : `/api/leads/${initialValues?.id ?? ""}`;
      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to save lead");
      }

      const data = await response.json();
      setSubmitting(false);
      if (redirectOnSuccess) {
        router.push(redirectOnSuccess);
      } else {
        router.refresh();
      }
      onSuccess?.(data);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Name
          <input
            type="text"
            required
            value={formState.name}
            onChange={(event) => handleChange("name", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="Jane Doe"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            value={formState.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="jane@company.com"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Phone
          <input
            type="tel"
            required
            value={formState.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="+1 (555) 123-4567"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Source
          <input
            type="text"
            required
            value={formState.source}
            onChange={(event) => handleChange("source", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="Referral, Ad, Organic..."
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Status
        <select
          value={formState.status}
          onChange={(event) =>
            handleChange("status", event.target.value as LeadPayload["status"])
          }
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
        >
          {leadStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Saving..."
            : mode === "create"
              ? "Add Lead"
              : "Update Lead"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

