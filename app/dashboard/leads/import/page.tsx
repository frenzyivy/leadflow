"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import type { ContactEntry, Lead } from "@/types/lead";

type CsvRow = Record<string, string>;

const EMAIL_DELIMITER = /[|,]/;
const TAG_DELIMITER = /[|,]/;

const parseContactEntries = (value: string): ContactEntry[] | undefined => {
  if (!value) return undefined;
  const parts = value.split(EMAIL_DELIMITER).map((entry) => entry.trim());
  const entries = parts
    .map((entry) => entry.replace(/\s+/g, ""))
    .filter(Boolean)
    .map((entry, index) => ({
      value: entry,
      label: "Work",
      primary: index === 0,
    }));
  return entries.length ? entries : undefined;
};

const parseTags = (value: string): string[] | undefined => {
  if (!value) return undefined;
  const tags = value
    .split(TAG_DELIMITER)
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.length ? tags : undefined;
};

const parseCustomFields = (value: string) => {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // ignore
  }
  return undefined;
};

const mapCsvRowToLead = (row: CsvRow): Partial<Lead> => {
  const safe = (key: string) => row[key]?.trim() ?? "";
  const first_name = safe("first_name");
  const last_name = safe("last_name");
  const status = safe("status");
  const emails = parseContactEntries(safe("emails"));
  const phones = parseContactEntries(safe("phones"));
  const tags = parseTags(safe("tags"));
  const custom_fields = parseCustomFields(safe("custom_fields"));

  return {
    first_name: first_name || undefined,
    last_name: last_name || undefined,
    status: status || undefined,
    emails,
    phones,
    job_title: safe("job_title") || undefined,
    department: safe("department") || undefined,
    industry: safe("industry") || undefined,
    experience: safe("experience") || undefined,
    linkedin: safe("linkedin") || undefined,
    twitter: safe("twitter") || undefined,
    facebook: safe("facebook") || undefined,
    website: safe("website") || undefined,
    city: safe("city") || undefined,
    state: safe("state") || undefined,
    country: safe("country") || undefined,
    company_name: safe("company_name") || undefined,
    company_domain: safe("company_domain") || undefined,
    company_website: safe("company_website") || undefined,
    company_industry: safe("company_industry") || undefined,
    company_size: safe("company_size") || undefined,
    company_revenue: safe("company_revenue") || undefined,
    company_founded_year: safe("company_founded_year") || undefined,
    company_linkedin: safe("company_linkedin") || undefined,
    company_phone: safe("company_phone") || undefined,
    tags,
    custom_fields,
  };
};

export default function ImportLeadsPage() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/");
    }
  }, [loading, session, router]);

  const leads = useMemo(() => rows.map(mapCsvRowToLead), [rows]);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const parsedRows = results.data.filter((row) =>
          Object.values(row).some((value) => Boolean(value?.trim())),
        );
        setRows(parsedRows);
      },
      error(error) {
        setMessage({ type: "error", text: error.message });
      },
    });
  };

  const handleUpload = async () => {
    if (!session) {
      setMessage({ type: "error", text: "Please sign in again." });
      return;
    }
    if (!leads.length) {
      setMessage({ type: "error", text: "No rows detected yet." });
      return;
    }
    setUploading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/leads/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ leads }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to import leads.");
      }
      const payload = await response.json();
      setMessage({
        type: "success",
        text: `Imported ${payload.inserted ?? leads.length} leads successfully.`,
      });
      setRows([]);
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to import leads.",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!session && !loading) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Bulk import
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Import leads from CSV</h1>
        <p className="text-sm text-slate-500">
          Use UTF-8 CSV with headers such as first_name, last_name, emails, phones, status,
          tags, custom_fields (JSON). Emails/phones can contain multiple entries separated by
          commas or pipes.
        </p>
      </div>

      <div className="space-y-6">
        {message ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            Drag & drop your CSV file or click to browse
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            onChange={handleFile}
          />
          {fileName ? (
            <p className="mt-2 text-xs text-slate-500">Loaded file: {fileName}</p>
          ) : null}
        </section>

        {rows.length ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Preview ({rows.length} rows)
                </p>
                <p className="text-xs text-slate-500">
                  Only the first 5 rows are shown below. All rows will be uploaded.
                </p>
              </div>
              <button
                onClick={() => setRows([])}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Clear
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    {Object.keys(rows[0] ?? {}).slice(0, 6).map((header) => (
                      <th key={header} className="px-3 py-2 capitalize">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rows.slice(0, 5).map((row, index) => (
                    <tr key={`row-${index}`}>
                      {Object.keys(rows[0] ?? {})
                        .slice(0, 6)
                        .map((header) => (
                          <td key={`${index}-${header}`} className="px-3 py-2">
                            {row[header] ?? ""}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!rows.length || uploading}
            onClick={handleUpload}
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Importing..." : `Import ${rows.length || ""} leads`}
          </button>
        </div>
      </div>
    </div>
  );
}

