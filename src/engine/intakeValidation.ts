/**
 * EULOK Intake & Inquiry Validation Core
 * Serverless edge, deterministic validation, specification capture, and bot protection.
 */

export interface IntakePayload {
  need: string;
  systemType: string;
  targetTimeline: string;
  problemDescription: string;
  attemptedSolutions?: string;
  specHash?: string;
  specSummary?: string;
  clientEmail?: string;
  clientPhone?: string;
  honeypot?: string; // Bot trap: must be empty for human submissions
  turnstileToken?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedPayload?: IntakePayload;
  referenceId?: string;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const CURRENCY_OR_MONEY_PATTERN = /(\b(?:UGX|USD|KES|TZS|RWF)\b|\$[0-9])/i;

export function sanitizeString(val: string): string {
  return val
    .replace(/[<>]/g, '') // Strip angle brackets to prevent injection
    .trim();
}

export function generateReferenceId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EULOK-${id}`;
}

export function validateIntakePayload(payload: unknown): ValidationResult {
  const errors: string[] = [];

  if (!payload || typeof payload !== 'object') {
    return { isValid: false, errors: ['Invalid request payload: expected JSON object.'] };
  }

  const raw = payload as Record<string, unknown>;

  // 1. Bot Trap / Honeypot Check
  if (raw.honeypot && typeof raw.honeypot === 'string' && raw.honeypot.trim().length > 0) {
    return { isValid: false, errors: ['Automated submission rejected.'] };
  }

  // 2. Validate Project Need
  const need = typeof raw.need === 'string' ? sanitizeString(raw.need) : '';
  if (!need || need.length < 3) {
    errors.push('Project need is required.');
  }

  // 3. Validate System Type
  const systemType = typeof raw.systemType === 'string' ? sanitizeString(raw.systemType) : '';
  if (!systemType || systemType.length < 3) {
    errors.push('System type is required.');
  }

  // 4. Validate Target Timeline (accepts targetTimeline; ignores legacy money strings gracefully)
  const rawTimeline =
    typeof raw.targetTimeline === 'string'
      ? sanitizeString(raw.targetTimeline)
      : typeof raw.timeline === 'string'
      ? sanitizeString(raw.timeline)
      : '';
  const targetTimeline =
    rawTimeline && !CURRENCY_OR_MONEY_PATTERN.test(rawTimeline)
      ? rawTimeline.slice(0, 120)
      : 'To be agreed during consultation';

  // 5. Validate Problem Description
  const problemDesc = typeof raw.problemDescription === 'string' ? sanitizeString(raw.problemDescription) : '';
  if (problemDesc.length > 5000) {
    errors.push('Problem description exceeds maximum allowed length of 5000 characters.');
  }

  // 6. Validate optional attached Scoping Workbench context
  let specHash: string | undefined = undefined;
  if (typeof raw.specHash === 'string' && raw.specHash.trim().length > 0) {
    const cleanHash = sanitizeString(raw.specHash).slice(0, 64);
    if (/^[A-Za-z0-9_-]{4,64}$/.test(cleanHash)) {
      specHash = cleanHash;
    }
  }

  let specSummary: string | undefined = undefined;
  if (typeof raw.specSummary === 'string' && raw.specSummary.trim().length > 0) {
    specSummary = sanitizeString(raw.specSummary).slice(0, 300);
  }

  // 7. Validate Client Email if provided
  let clientEmail: string | undefined = undefined;
  if (raw.clientEmail && typeof raw.clientEmail === 'string' && raw.clientEmail.trim().length > 0) {
    const cleanEmail = raw.clientEmail.trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      errors.push('Provided email address is invalid.');
    } else {
      clientEmail = cleanEmail;
    }
  }

  // 8. Validate Client Phone if provided
  let clientPhone: string | undefined = undefined;
  if (raw.clientPhone && typeof raw.clientPhone === 'string' && raw.clientPhone.trim().length > 0) {
    const cleanPhone = sanitizeString(raw.clientPhone);
    if (!/^[+0-9\s\-()]{7,25}$/.test(cleanPhone)) {
      errors.push('Provided telephone number is invalid.');
    } else {
      clientPhone = cleanPhone;
    }
  }

  // 9. Optional Turnstile client token sanitization
  let turnstileToken: string | undefined = undefined;
  if (typeof raw.turnstileToken === 'string' && raw.turnstileToken.trim().length > 0) {
    turnstileToken = raw.turnstileToken.trim().slice(0, 2048);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const sanitizedPayload: IntakePayload = {
    need,
    systemType,
    targetTimeline,
    problemDescription: problemDesc || 'To be clarified during initial discovery session.',
    attemptedSolutions:
      typeof raw.attemptedSolutions === 'string' ? sanitizeString(raw.attemptedSolutions) : undefined,
    specHash,
    specSummary,
    clientEmail,
    clientPhone,
    turnstileToken,
  };

  return {
    isValid: true,
    errors: [],
    sanitizedPayload,
    referenceId: generateReferenceId(),
  };
}
