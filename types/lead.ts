export const leadStatuses = ["New", "Contacted", "Converted", "Lost"] as const;
type DefaultLeadStatus = (typeof leadStatuses)[number];
export type LeadStatus = DefaultLeadStatus | string;

export type ContactEntry = {
  value: string;
  label?: string | null;
  primary?: boolean | null;
};

export type CustomFields = Record<string, string | null>;

export type Lead = {
  id: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  emails?: ContactEntry[] | null;
  phones?: ContactEntry[] | null;
  source?: string | null;
  status?: LeadStatus | null;
  job_title?: string | null;
  department?: string | null;
  industry?: string | null;
  experience?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  website?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  company_name?: string | null;
  company_domain?: string | null;
  company_website?: string | null;
  company_industry?: string | null;
  company_size?: string | null;
  company_revenue?: string | null;
  company_founded_year?: string | null;
  company_linkedin?: string | null;
  company_phone?: string | null;
  custom_fields?: CustomFields | null;
  tags?: string[] | null;
  created_at?: string;
};

export type LeadPayload = Omit<Lead, "id" | "created_at">;

