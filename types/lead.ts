export const leadStatuses = ["New", "Contacted", "Converted", "Lost"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  created_at: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  source: string;
  status?: LeadStatus;
}

