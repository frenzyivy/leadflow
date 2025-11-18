"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  leadStatuses,
  type ContactEntry,
  type Lead,
  type LeadPayload,
} from "@/types/lead";

type FormState = {
  first_name: string;
  last_name: string;
  job_title: string;
  department: string;
  industry: string;
  experience: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  website: string;
  city: string;
  state: string;
  country: string;
  company_name: string;
  company_domain: string;
  company_website: string;
  company_industry: string;
  company_size: string;
  company_revenue: string;
  company_founded_year: string;
  company_linkedin: string;
  company_phone: string;
  status: string;
  emails: ContactEntry[];
  phones: ContactEntry[];
  customFields: { key: string; value: string }[];
  tags: string[];
};

const DEFAULT_STATUS = "New";
const LABEL_OPTIONS = ["Work", "Home", "Other"];

const buildInitialState = (lead?: Lead | null): FormState => {
  const emails =
    lead?.emails?.map((entry) => ({
      value: entry?.value ?? "",
      label: entry?.label ?? "Work",
      primary: Boolean(entry?.primary),
    })) ?? [];

  const phones =
    lead?.phones?.map((entry) => ({
      value: entry?.value ?? "",
      label: entry?.label ?? "Work",
      primary: Boolean(entry?.primary),
    })) ?? [];

  const customFields =
    lead?.custom_fields
      ? Object.entries(lead.custom_fields).map(([key, value]) => ({
          key,
          value: value ?? "",
        }))
      : [];

  return {
    first_name: lead?.first_name ?? "",
    last_name: lead?.last_name ?? "",
    job_title: lead?.job_title ?? "",
    department: lead?.department ?? "",
    industry: lead?.industry ?? "",
    experience: lead?.experience ?? "",
    linkedin: lead?.linkedin ?? "",
    twitter: lead?.twitter ?? "",
    facebook: lead?.facebook ?? "",
    website: lead?.website ?? "",
    city: lead?.city ?? "",
    state: lead?.state ?? "",
    country: lead?.country ?? "",
    company_name: lead?.company_name ?? "",
    company_domain: lead?.company_domain ?? "",
    company_website: lead?.company_website ?? "",
    company_industry: lead?.company_industry ?? "",
    company_size: lead?.company_size ?? "",
    company_revenue: lead?.company_revenue ?? "",
    company_founded_year: lead?.company_founded_year ?? "",
    company_linkedin: lead?.company_linkedin ?? "",
    company_phone: lead?.company_phone ?? "",
    status: lead?.status ?? DEFAULT_STATUS,
    emails: emails.length ? emails : [{ value: "", label: "Work", primary: true }],
    phones: phones.length ? phones : [{ value: "", label: "Work", primary: false }],
    customFields,
    tags: lead?.tags ?? [],
  };
};

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
    {children}
  </section>
);

interface LeadProfileFormProps {
  accessToken: string;
  mode: "create" | "edit";
  leadId?: string;
  initialLead?: Lead | null;
  onCancel?: () => void;
}

export default function LeadProfileForm({
  accessToken,
  leadId,
  initialLead,
  onCancel,
  mode,
}: LeadProfileFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(() =>
    buildInitialState(initialLead),
  );
  const [tagInput, setTagInput] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormState(buildInitialState(initialLead));
  }, [initialLead]);

  const hasRequiredFields = useMemo(() => {
    const hasFirstName = formState.first_name.trim().length > 0;
    const hasEmail = formState.emails.some(
      (email) => email.value.trim().length > 0,
    );
    return hasFirstName || hasEmail;
  }, [formState.first_name, formState.emails]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const updateContactEntry = (
    type: "emails" | "phones",
    index: number,
    key: keyof ContactEntry,
    value: string | boolean,
  ) => {
    setFormState((prev) => {
      const updated = [...prev[type]];
      updated[index] = {
        ...updated[index],
        [key]: key === "primary" ? Boolean(value) : value,
      };
      return { ...prev, [type]: updated };
    });
  };

  const addContactEntry = (type: "emails" | "phones") => {
    setFormState((prev) => ({
      ...prev,
      [type]: [
        ...prev[type],
        {
          value: "",
          label: "Work",
          primary: type === "emails" ? prev[type].length === 0 : false,
        },
      ],
    }));
  };

  const removeContactEntry = (type: "emails" | "phones", index: number) => {
    setFormState((prev) => {
      const updated = prev[type].filter((_, idx) => idx !== index);
      if (
        type === "emails" &&
        updated.length &&
        !updated.some((entry) => entry.primary)
      ) {
        updated[0].primary = true;
      }
      return { ...prev, [type]: updated.length ? updated : [{ value: "", label: "Work", primary: type === "emails" }] };
    });
  };

  const markPrimary = (type: "emails" | "phones", index: number) => {
    setFormState((prev) => {
      const updated = prev[type].map((entry, idx) => ({
        ...entry,
        primary: idx === index,
      }));
      return { ...prev, [type]: updated };
    });
  };

  const addTag = () => {
    const nextTag = tagInput.trim();
    if (!nextTag) return;
    if (formState.tags.includes(nextTag)) {
      setTagInput("");
      return;
    }
    updateField("tags", [...formState.tags, nextTag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    updateField(
      "tags",
      formState.tags.filter((item) => item !== tag),
    );
  };

  const addCustomField = () => {
    updateField("customFields", [...formState.customFields, { key: "", value: "" }]);
  };

  const updateCustomField = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const next = [...formState.customFields];
    next[index] = { ...next[index], [field]: value };
    updateField("customFields", next);
  };

  const removeCustomField = (index: number) => {
    const next = formState.customFields.filter((_, idx) => idx !== index);
    updateField("customFields", next);
  };

  const valueOrNull = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) {
      setMessage({ type: "error", text: "Authentication required." });
      return;
    }

    if (!hasRequiredFields) {
      setMessage({
        type: "error",
        text: "Provide at least a first name or one email.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    const emails = formState.emails
      .map((entry) => ({
        value: entry.value.trim(),
        label: entry.label ?? "Work",
        primary: Boolean(entry.primary),
      }))
      .filter((entry) => entry.value.length);

    const phones = formState.phones
      .map((entry) => ({
        value: entry.value.trim(),
        label: entry.label ?? "Work",
        primary: Boolean(entry.primary),
      }))
      .filter((entry) => entry.value.length);

    const customFields = formState.customFields.reduce<Record<string, string | null>>(
      (acc, field) => {
        const key = field.key.trim();
        if (!key.length) return acc;
        acc[key] = valueOrNull(field.value);
        return acc;
      },
      {},
    );

    const payload: LeadPayload = {
      name: null,
      first_name: valueOrNull(formState.first_name),
      last_name: valueOrNull(formState.last_name),
      job_title: valueOrNull(formState.job_title),
      department: valueOrNull(formState.department),
      industry: valueOrNull(formState.industry),
      experience: valueOrNull(formState.experience),
      linkedin: valueOrNull(formState.linkedin),
      twitter: valueOrNull(formState.twitter),
      facebook: valueOrNull(formState.facebook),
      website: valueOrNull(formState.website),
      city: valueOrNull(formState.city),
      state: valueOrNull(formState.state),
      country: valueOrNull(formState.country),
      company_name: valueOrNull(formState.company_name),
      company_domain: valueOrNull(formState.company_domain),
      company_website: valueOrNull(formState.company_website),
      company_industry: valueOrNull(formState.company_industry),
      company_size: valueOrNull(formState.company_size),
      company_revenue: valueOrNull(formState.company_revenue),
      company_founded_year: valueOrNull(formState.company_founded_year),
      company_linkedin: valueOrNull(formState.company_linkedin),
      company_phone: valueOrNull(formState.company_phone),
      status: valueOrNull(formState.status) ?? DEFAULT_STATUS,
      emails: emails.length ? emails : null,
      phones: phones.length ? phones : null,
      tags: formState.tags.length ? formState.tags : null,
      custom_fields: Object.keys(customFields).length ? customFields : null,
    };

    const nameParts = [payload.first_name, payload.last_name].filter(Boolean);
    payload.name = nameParts.length ? nameParts.join(" ") : null;

    try {
      const response = await fetch(
        mode === "create" ? "/api/leads" : `/api/leads/${leadId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to save lead");
      }

      const data = (await response.json()) as Lead;
      setMessage({ type: "success", text: "Lead saved successfully." });
      router.refresh();

      if (mode === "create" && data.id) {
        router.replace(`/dashboard/leads/${data.id}/edit`);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to save lead.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {message ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <Section
        title="Contact Information"
        description="Capture the basics so anyone can reach this contact quickly."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            First name
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={formState.first_name}
              onChange={(event) => updateField("first_name", event.target.value)}
              placeholder="Jane"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Last name
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={formState.last_name}
              onChange={(event) => updateField("last_name", event.target.value)}
              placeholder="Doe"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Status
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={formState.status}
              onChange={(event) => updateField("status", event.target.value)}
            >
              {leadStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Emails</p>
            <button
              type="button"
              onClick={() => addContactEntry("emails")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-500"
            >
              Add email
            </button>
          </div>
          {formState.emails.map((email, index) => (
            <div
              key={`email-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="jane@company.com"
                  value={email.value}
                  onChange={(event) =>
                    updateContactEntry("emails", index, "value", event.target.value)
                  }
                />
              </div>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={email.label ?? "Work"}
                onChange={(event) =>
                  updateContactEntry("emails", index, "label", event.target.value)
                }
              >
                {LABEL_OPTIONS.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="radio"
                  name="primary-email"
                  checked={Boolean(email.primary)}
                  onChange={() => markPrimary("emails", index)}
                />
                Primary
              </label>
              <button
                type="button"
                onClick={() => removeContactEntry("emails", index)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Phones</p>
            <button
              type="button"
              onClick={() => addContactEntry("phones")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-500"
            >
              Add phone
            </button>
          </div>
          {formState.phones.map((phone, index) => (
            <div
              key={`phone-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <input
                  type="tel"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="+1 (555) 123-4567"
                  value={phone.value}
                  onChange={(event) =>
                    updateContactEntry("phones", index, "value", event.target.value)
                  }
                />
              </div>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={phone.label ?? "Work"}
                onChange={(event) =>
                  updateContactEntry("phones", index, "label", event.target.value)
                }
              >
                {LABEL_OPTIONS.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={Boolean(phone.primary)}
                  onChange={() =>
                    updateContactEntry(
                      "phones",
                      index,
                      "primary",
                      !phone.primary,
                    )
                  }
                />
                Primary
              </label>
              <button
                type="button"
                onClick={() => removeContactEntry("phones", index)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Work Information"
        description="Understand their role and the team they belong to."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["job_title", "Job title"],
            ["department", "Department"],
            ["industry", "Industry"],
            ["experience", "Experience"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex flex-col gap-1 text-sm font-medium text-slate-700"
            >
              {label}
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={formState[key as keyof FormState] as string}
                onChange={(event) =>
                  updateField(key as keyof FormState, event.target.value)
                }
              />
            </label>
          ))}
        </div>
      </Section>

      <Section
        title="Social Profiles"
        description="Link out to the places this lead is most active."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["linkedin", "LinkedIn"],
            ["twitter", "Twitter / X"],
            ["facebook", "Facebook"],
            ["website", "Website"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex flex-col gap-1 text-sm font-medium text-slate-700"
            >
              {label}
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={formState[key as keyof FormState] as string}
                onChange={(event) =>
                  updateField(key as keyof FormState, event.target.value)
                }
              />
            </label>
          ))}
        </div>
      </Section>

      <Section
        title="Location"
        description="Where are they based? Helps territory-based teams."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["city", "City"],
            ["state", "State"],
            ["country", "Country"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex flex-col gap-1 text-sm font-medium text-slate-700"
            >
              {label}
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={formState[key as keyof FormState] as string}
                onChange={(event) =>
                  updateField(key as keyof FormState, event.target.value)
                }
              />
            </label>
          ))}
        </div>
      </Section>

      <Section
        title="Company Information"
        description="Enrich the account-level context."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["company_name", "Company name"],
            ["company_domain", "Company domain"],
            ["company_website", "Company website"],
            ["company_industry", "Company industry"],
            ["company_size", "Company size"],
            ["company_revenue", "Company revenue"],
            ["company_founded_year", "Founded year"],
            ["company_linkedin", "Company LinkedIn"],
            ["company_phone", "Company phone"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex flex-col gap-1 text-sm font-medium text-slate-700"
            >
              {label}
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={formState[key as keyof FormState] as string}
                onChange={(event) =>
                  updateField(key as keyof FormState, event.target.value)
                }
              />
            </label>
          ))}
        </div>
      </Section>

      <Section
        title="Tags & Custom Fields"
        description="Capture extra context unique to your pipeline."
      >
        <div>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Tags
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-slate-300 p-3">
              {formState.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={tagInput}
                placeholder="Press enter to add"
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
              />
            </div>
          </label>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Custom fields</p>
            <button
              type="button"
              onClick={addCustomField}
              className="text-sm font-semibold text-blue-600 hover:text-blue-500"
            >
              Add field
            </button>
          </div>
          {formState.customFields.length ? (
            formState.customFields.map((field, index) => (
              <div
                key={`field-${index}`}
                className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-2"
              >
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Label"
                  value={field.key}
                  onChange={(event) =>
                    updateCustomField(index, "key", event.target.value)
                  }
                />
                <div className="flex gap-3">
                  <input
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Value"
                    value={field.value}
                    onChange={(event) =>
                      updateCustomField(index, "value", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">
              No custom fields yet. Add one to capture CRM-specific data.
            </p>
          )}
        </div>
      </Section>

      <div className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-lg md:flex-row md:items-center md:justify-end">
        <button
          type="button"
          onClick={() => {
            if (onCancel) onCancel();
            else router.back();
          }}
          className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}

