import type {
  ContactEntry,
  CustomFields,
  Lead,
  LeadPayload,
} from "@/types/lead";

const stringOrNull = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const sanitizeContactEntries = (entries: unknown): ContactEntry[] | null => {
  if (!Array.isArray(entries)) return null;

  const normalized = entries
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) return null;
      const record = entry as Record<string, unknown>;
      const value =
        stringOrNull(record.value) ??
        stringOrNull((record.email as string) ?? "") ??
        stringOrNull((record.phone as string) ?? "");
      if (!value) return null;

      const label = stringOrNull(record.label);
      const primary =
        typeof record.primary === "boolean"
          ? record.primary
          : record.primary === "true";

      return {
        value,
        label: label ?? null,
        primary: primary ?? null,
      } satisfies ContactEntry;
    })
    .filter(Boolean) as ContactEntry[];

  return normalized.length ? normalized : null;
};

const sanitizeCustomFields = (fields: unknown): CustomFields | null => {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return null;
  }

  const result: CustomFields = {};
  Object.entries(fields as Record<string, unknown>).forEach(
    ([key, value]) => {
      const safeKey = key.trim();
      if (!safeKey.length) {
        return;
      }
      if (value === null || value === undefined) {
        result[safeKey] = null;
      } else {
        result[safeKey] = String(value);
      }
    },
  );

  return Object.keys(result).length ? result : null;
};

const sanitizeTags = (tags: unknown): string[] | null => {
  if (!Array.isArray(tags)) return null;
  const normalized = tags
    .map((tag) => stringOrNull(typeof tag === "string" ? tag : String(tag)))
    .filter(Boolean) as string[];

  return normalized.length ? normalized : null;
};

export function buildLeadPayload(body: Partial<Lead>): LeadPayload {
  const first_name = stringOrNull(body.first_name ?? body.name?.split(" ")?.at(0));
  const last_name = stringOrNull(body.last_name);
  const name =
    stringOrNull(body.name) ??
    stringOrNull(
      [first_name, last_name].filter((value) => !!value).join(" "),
    );

  const payload: LeadPayload = {
    name,
    first_name,
    last_name,
    emails: sanitizeContactEntries(body.emails),
    phones: sanitizeContactEntries(body.phones),
    source: stringOrNull(body.source),
    status: stringOrNull(body.status ?? undefined),
    job_title: stringOrNull(body.job_title),
    department: stringOrNull(body.department),
    industry: stringOrNull(body.industry),
    experience: stringOrNull(body.experience),
    linkedin: stringOrNull(body.linkedin),
    twitter: stringOrNull(body.twitter),
    facebook: stringOrNull(body.facebook),
    website: stringOrNull(body.website),
    city: stringOrNull(body.city),
    state: stringOrNull(body.state),
    country: stringOrNull(body.country),
    company_name: stringOrNull(body.company_name),
    company_domain: stringOrNull(body.company_domain),
    company_website: stringOrNull(body.company_website),
    company_industry: stringOrNull(body.company_industry),
    company_size: stringOrNull(body.company_size),
    company_revenue: stringOrNull(body.company_revenue),
    company_founded_year: stringOrNull(body.company_founded_year),
    company_linkedin: stringOrNull(body.company_linkedin),
    company_phone: stringOrNull(body.company_phone),
    custom_fields: sanitizeCustomFields(body.custom_fields),
    tags: sanitizeTags(body.tags),
  };

  return payload;
}

