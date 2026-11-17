import type { APIRoute } from 'astro';
import { validateIntakePayload } from '../../engine/intakeValidation';

export const prerender = false;

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

export const POST: APIRoute = async ({ request }) => {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          errors: ['Malformed JSON body.'],
        }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const validation = validateIntakePayload(body);

    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: validation.errors,
        }),
        { status: 422, headers: JSON_HEADERS }
      );
    }

    const webhookUrl = process.env.ZOHO_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId: validation.referenceId,
            timestamp: new Date().toISOString(),
            ...validation.sanitizedPayload,
          }),
        });
      } catch {
        // Fail-safe: webhook forwarding failure does not block reference issuance
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        referenceId: validation.referenceId,
        message: 'Inquiry registered. Scoping discovery will be initiated within 1 business day.',
        payload: validation.sanitizedPayload,
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({
        success: false,
        errors: [message],
      }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
};
