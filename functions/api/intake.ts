import { validateIntakePayload } from '../../src/engine/intakeValidation';

interface Env {
  ZOHO_WEBHOOK_URL?: string;
  NOTIFY_EMAIL?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    let body: unknown;
    try {
      body = await context.request.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          errors: ['Malformed JSON body.'],
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }

    const validation = validateIntakePayload(body);

    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: validation.errors,
        }),
        {
          status: 422,
          headers: {
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }

    // Zero-budget forwarding: If Zoho Webhook URL is configured in Cloudflare environment
    if (context.env?.ZOHO_WEBHOOK_URL) {
      try {
        await fetch(context.env.ZOHO_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId: validation.referenceId,
            timestamp: new Date().toISOString(),
            ...validation.sanitizedPayload,
          }),
        });
      } catch {
        // Fail-safe: internal webhook dispatch error does not lose the client's confirmation
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        referenceId: validation.referenceId,
        message: 'Inquiry registered. Scoping discovery will be initiated within 1 business day.',
        payload: validation.sanitizedPayload,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({
        success: false,
        errors: [message],
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }
};
