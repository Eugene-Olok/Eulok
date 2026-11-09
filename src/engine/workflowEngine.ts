import type { ClientLifecycle } from '../types/workflow.ts';

export interface TransitionDefinition {
  action: string;
  target: ClientLifecycle;
  description: string;
}

export const LIFECYCLE_TRANSITIONS: Record<ClientLifecycle, TransitionDefinition[]> = {
  PROSPECT: [
    {
      action: 'record_intake',
      target: 'INTAKE',
      description: 'Record incoming enquiry, client need, and operational constraints.',
    },
  ],
  INTAKE: [
    {
      action: 'submit_for_approval',
      target: 'APPROVAL',
      description: 'Submit completed intake with measurable criteria for founder review.',
    },
  ],
  APPROVAL: [
    {
      action: 'go_founder_approved',
      target: 'SCOPE',
      description: 'Founder grants GO authorization to draft binding project scope.',
    },
    {
      action: 'needs_information',
      target: 'NEEDS_INFORMATION',
      description: 'Unresolved unknowns or missing constraints require clarification.',
    },
    {
      action: 'no_go',
      target: 'NO_GO',
      description: 'Project is out of alignment, unfeasible, or declined.',
    },
  ],
  NEEDS_INFORMATION: [
    {
      action: 'submit_for_approval',
      target: 'APPROVAL',
      description: 'Resubmit clarified intake for founder evaluation.',
    },
  ],
  NO_GO: [],
  SCOPE: [
    {
      action: 'approve_scope',
      target: 'PROPOSAL',
      description: 'Both parties sign off on explicit inclusions and exclusions.',
    },
  ],
  PROPOSAL: [
    {
      action: 'founder_approve',
      target: 'PROPOSAL_FOUNDER_APPROVED',
      description: 'Founder formally signs off on commercial terms and deliverables.',
    },
  ],
  PROPOSAL_FOUNDER_APPROVED: [
    {
      action: 'client_approve',
      target: 'PROPOSAL_CLIENT_APPROVED',
      description: 'Client accepts proposal terms, deliverables, and acceptance criteria.',
    },
  ],
  PROPOSAL_CLIENT_APPROVED: [
    {
      action: 'engage',
      target: 'ENGAGEMENT',
      description: 'Formal engagement binding contract authorized. Work may begin.',
    },
  ],
  ENGAGEMENT: [
    {
      action: 'start_delivery',
      target: 'DELIVERY',
      description: 'Commence active software engineering implementation.',
    },
    {
      action: 'terminate',
      target: 'TERMINATED',
      description: 'Engagement terminated per contractual terms.',
    },
  ],
  DELIVERY: [
    {
      action: 'ready_for_acceptance',
      target: 'ACCEPTANCE',
      description: 'Deliverables completed with deterministic verification evidence.',
    },
    {
      action: 'terminate',
      target: 'TERMINATED',
      description: 'Engagement terminated.',
    },
  ],
  ACCEPTANCE: [
    {
      action: 'invoice',
      target: 'INVOICE',
      description: 'Client accepts deliverables against agreed criteria; draft invoice.',
    },
    {
      action: 'terminate',
      target: 'TERMINATED',
      description: 'Deliverable rejected or uncorrectable.',
    },
  ],
  INVOICE: [
    {
      action: 'founder_approve',
      target: 'INVOICE_FOUNDER_APPROVED',
      description: 'Founder verifies milestone acceptance and billing figures.',
    },
  ],
  INVOICE_FOUNDER_APPROVED: [
    {
      action: 'issue',
      target: 'ISSUED',
      description: 'Invoice issued to client with explicit payment terms.',
    },
  ],
  ISSUED: [
    {
      action: 'record_payment',
      target: 'PAYMENT',
      description: 'Payment received and verified with authoritative financial receipt.',
    },
  ],
  PAYMENT: [
    {
      action: 'close',
      target: 'CLOSED',
      description: 'Full reconciliation verified; engagement successfully closed.',
    },
  ],
  CLOSED: [],
  TERMINATED: [],
};

export function canTransition(current: ClientLifecycle, action: string): boolean {
  const transitions = LIFECYCLE_TRANSITIONS[current] || [];
  return transitions.some((t) => t.action === action);
}

export function executeTransition(
  current: ClientLifecycle,
  action: string
): { success: boolean; nextState: ClientLifecycle; message: string } {
  const transitions = LIFECYCLE_TRANSITIONS[current] || [];
  const found = transitions.find((t) => t.action === action);

  if (!found) {
    return {
      success: false,
      nextState: current,
      message: `Invalid transition: Action "${action}" is illegal from state "${current}". Fail-closed rule enforced.`,
    };
  }

  return {
    success: true,
    nextState: found.target,
    message: `Transition successful: Moved from ${current} to ${found.target}. ${found.description}`,
  };
}
