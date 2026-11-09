export type IntakeDisposition = 'GO' | 'NO-GO' | 'NEEDS INFORMATION';

export type ScopeDecision = 'IN SCOPE' | 'CHANGE ORDER' | 'OUT OF SCOPE';

export type ApprovalState = 'REQUIRED' | 'APPROVED' | 'DECLINED';

export type ProposalStatus =
  | 'DRAFT'
  | 'FOUNDER_APPROVED'
  | 'CLIENT_APPROVED'
  | 'DECLINED'
  | 'EXPIRED';

export type EngagementStatus = 'DRAFT' | 'AUTHORIZED' | 'SUSPENDED' | 'TERMINATED';

export type DeliveryStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'READY_FOR_ACCEPTANCE'
  | 'COMPLETED';

export type AcceptanceStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CORRECTED';

export type InvoiceStatus = 'DRAFT' | 'APPROVED' | 'ISSUED' | 'VOID' | 'CORRECTED';

export type PaymentStatus =
  | 'UNKNOWN'
  | 'PENDING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REVERSED';

export type ClientLifecycle =
  | 'PROSPECT'
  | 'INTAKE'
  | 'APPROVAL'
  | 'NEEDS_INFORMATION'
  | 'NO_GO'
  | 'SCOPE'
  | 'PROPOSAL'
  | 'PROPOSAL_FOUNDER_APPROVED'
  | 'PROPOSAL_CLIENT_APPROVED'
  | 'ENGAGEMENT'
  | 'DELIVERY'
  | 'ACCEPTANCE'
  | 'INVOICE'
  | 'INVOICE_FOUNDER_APPROVED'
  | 'ISSUED'
  | 'PAYMENT'
  | 'CLOSED'
  | 'TERMINATED';

export interface Intake {
  client: string;
  request: string;
  problem: string;
  attempted_solutions: string;
  stakeholders: string;
  success_criteria: string;
  deadline: string;
  deadline_rationale: string;
  budget: string;
  assumptions: string[];
  dependencies: string[];
  risks: string[];
  unknowns: string[];
  evidence: string[];
  proposed_decision: IntakeDisposition;
  founder_approval: ApprovalState;
  date: string;
}

export interface Scope {
  client: string;
  decision: ScopeDecision;
  approved: ApprovalState;
  inclusions: string[];
  exclusions: string[];
  date: string;
}

export interface Proposal {
  client: string;
  intake_ref: string;
  scope_ref: string;
  status: ProposalStatus;
  problem: string;
  objective: string;
  success_criteria: string[];
  scope: ScopeDecision;
  delivery_phases: string[];
  deliverables: string[];
  acceptance_criteria: string[];
  client_responsibilities: string[];
  company_responsibilities: string[];
  assumptions: string[];
  dependencies: string[];
  explicit_exclusions: string[];
  timeline: string;
  commercial_terms: string;
  risks: string[];
  change_control: string;
  founder_approval: ApprovalState;
  client_approval: ApprovalState;
  date: string;
}

export interface Engagement {
  client: string;
  proposal_ref: string;
  scope_ref: string;
  status: EngagementStatus;
  commercial_basis_ref: string;
  founder_approval: ApprovalState;
  client_approval: ApprovalState;
  authorized_work: string[];
  start_date: string;
  date: string;
}

export interface Delivery {
  client: string;
  engagement_ref: string;
  deliverable: string;
  status: DeliveryStatus;
  evidence: string[];
  blocked_reason: string;
  started_at: string;
  completed_at: string;
  date: string;
}

export interface Acceptance {
  client: string;
  record_id: string;
  delivery_ref: string;
  acceptance_criteria_ref: string;
  status: AcceptanceStatus;
  evidence: string[];
  decision: string;
  decided_by: string;
  corrects_reference: string;
  date: string;
}

export interface Invoice {
  client: string;
  engagement_ref: string;
  commercial_basis_ref: string;
  milestone_ref: string;
  status: InvoiceStatus;
  amount: string;
  currency: string;
  payment_terms: string;
  line_items: string[];
  invoice_number: string;
  issued_at: string;
  approved_at: string;
  corrects_reference: string;
  date: string;
}

export interface Payment {
  client: string;
  invoice_ref: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  evidence_ref: string;
  received_at: string;
  payment_method: string;
  date: string;
}
