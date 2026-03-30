// ─── Database Row Types ──────────────────────────────────────────────────────

export type Organization = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Membership = {
  id: string;
  org_id: string;
  user_id: string;
  role: 'admin' | 'steward' | 'viewer';
  display_name: string;
  created_at: string;
};

export type Contact = {
  id: string;
  org_id: string;
  display_name: string;
  organization: string | null;
  category: 'Individual' | 'Organization' | null;
  contact_type: 'Donor' | 'Foundation' | 'Board Member' | 'Church' | null;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | null;
  capacity: number | null;
  priority: 'A - Must Cultivate' | 'B - Should Cultivate' | 'C - Maintain' | null;
  region: string | null;
  email: string | null;
  steward_id: string | null;
  stage: Stage | null;
  ask_amount: number | null;
  probability: number | null;
  next_action: string | null;
  next_action_date: string | null;
  given_current_year: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactWithSteward = Contact & {
  steward_name: string | null;
  forecast: number | null;
};

export type Interaction = {
  id: string;
  org_id: string;
  contact_id: string;
  date: string;
  type: InteractionType | null;
  summary: string | null;
  outcome: Outcome | null;
  next_step: string | null;
  follow_up_date: string | null;
  logged_by: string | null;
  created_at: string;
};

export type InteractionWithDetails = Interaction & {
  contact_name: string;
  logged_by_name: string;
};

// ─── Enum Types ──────────────────────────────────────────────────────────────

export type Stage = 'Qualification' | 'Cultivation' | 'Solicitation' | 'Negotiation' | 'Stewardship';
export type InteractionType = 'Phone Call' | 'Email' | 'Coffee Meeting' | 'Vision Briefing' | 'Personal Outreach' | 'Event' | 'Other';
export type Outcome = 'Positive' | 'Neutral' | 'Needs Follow-Up';
export type Priority = 'A - Must Cultivate' | 'B - Should Cultivate' | 'C - Maintain';
export type Tier = 'Tier 1' | 'Tier 2' | 'Tier 3';
export type ContactType = 'Donor' | 'Foundation' | 'Board Member' | 'Church';
export type Role = 'admin' | 'steward' | 'viewer';

// ─── Constants ───────────────────────────────────────────────────────────────

export const STAGES: Stage[] = ['Qualification', 'Cultivation', 'Solicitation', 'Negotiation', 'Stewardship'];
export const PRIORITIES: Priority[] = ['A - Must Cultivate', 'B - Should Cultivate', 'C - Maintain'];
export const TIERS: Tier[] = ['Tier 1', 'Tier 2', 'Tier 3'];
export const CONTACT_TYPES: ContactType[] = ['Donor', 'Foundation', 'Board Member', 'Church'];
export const INTERACTION_TYPES: InteractionType[] = ['Phone Call', 'Email', 'Coffee Meeting', 'Vision Briefing', 'Personal Outreach', 'Event', 'Other'];
export const OUTCOMES: Outcome[] = ['Positive', 'Neutral', 'Needs Follow-Up'];

// ─── Filter Types ────────────────────────────────────────────────────────────

export type ContactFilters = {
  search: string;
  steward: string;
  stage: Stage[];
  priority: Priority[];
  tier: Tier[];
  contactType: ContactType[];
};

export type InteractionFilters = {
  steward: string;
  outcome: string;
  type: string;
  dateFrom: string;
  dateTo: string;
};

// ─── Form Types ──────────────────────────────────────────────────────────────

export type ContactFormData = Omit<Contact, 'id' | 'org_id' | 'created_at' | 'updated_at'>;
export type InteractionFormData = Omit<Interaction, 'id' | 'org_id' | 'created_at'>;

// ─── CSV Import ──────────────────────────────────────────────────────────────

export type ColumnMapping = {
  [targetField: string]: string; // targetField -> sourceColumn
};

export const IMPORTABLE_FIELDS = [
  { key: 'display_name', label: 'Display Name', required: true },
  { key: 'organization', label: 'Organization' },
  { key: 'category', label: 'Category' },
  { key: 'contact_type', label: 'Contact Type' },
  { key: 'tier', label: 'Tier' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'priority', label: 'Priority' },
  { key: 'region', label: 'Region' },
  { key: 'email', label: 'Email' },
  { key: 'stage', label: 'Stage' },
  { key: 'ask_amount', label: 'Ask Amount' },
  { key: 'probability', label: 'Probability' },
  { key: 'next_action', label: 'Next Action' },
  { key: 'next_action_date', label: 'Next Action Date' },
  { key: 'given_current_year', label: 'Given This Year' },
  { key: 'notes', label: 'Notes' },
] as const;
