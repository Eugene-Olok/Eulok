import { validateIntakePayload } from '../../src/engine/intakeValidation';

interface KVStoreLike {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  ZOHO_WEBHOOK_URL?: string;
  NOTIFY_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  INTAKE_ARCHIVE?: KVStoreLike;
}

const JSON_SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
};

async function verifyTurnstileToken(
  token: string | undefined,
  secretKey: string,
  remoteIp: string | null
): Promise<boolean> {
  if (!token) return false;
  try {
    const form = new URLSearchParams({
      secret: secretKey,
      response: token,
    });
    if (remoteIp) form.set('remoteip', remoteIp);

    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    if (!verification.ok) return false;
    const outcome = (await verification.json()) as { success?: boolean };
    return outcome.success === true;
  } catch {
    return false;
  }
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
          headers: JSON_SECURITY_HEADERS,
        }
      );
    }

    const validation = validateIntakePayload(body);

    if (!validation.isValid || !validation.sanitizedPayload || !validation.referenceId) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: validation.errors,
        }),
        {
          status: 422,
          headers: JSON_SECURITY_HEADERS,
        }
      );
    }

    // Fail-closed Cloudflare Turnstile check when configured in environment
    if (context.env?.TURNSTILE_SECRET_KEY) {
      const token =
        validation.sanitizedPayload.turnstileToken ||
        context.request.headers.get('cf-turnstile-response') ||
        undefined;
      const clientIp = context.request.headers.get('CF-Connecting-IP');
      const verified = await verifyTurnstileToken(token, context.env.TURNSTILE_SECRET_KEY, clientIp);
      if (!verified) {
        return new Response(
          JSON.stringify({
            success: false,
            errors: ['Human verification failed. Please retry or continue via direct WhatsApp/Email.'],
          }),
          {
            status: 403,
            headers: JSON_SECURITY_HEADERS,
          }
        );
      }
    }

    // Strip internal anti-bot token before archiving/forwarding downstream
    const { turnstileToken: _turnstileToken, ...forwardPayload } = validation.sanitizedPayload;
    const envelope = {
      referenceId: validation.referenceId,
      timestamp: new Date().toISOString(),
      notifyEmail: context.env?.NOTIFY_EMAIL || undefined,
      ...forwardPayload,
    };

    let deliveryStatus: 'forwarded' | 'queued_dead_letter' | 'recorded_only' = 'recorded_only';

    // Serverless edge forwarding when Zoho Webhook URL is configured
    if (context.env?.ZOHO_WEBHOOK_URL) {
      try {
        const webhookResponse = await fetch(context.env.ZOHO_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(envelope),
        });

        if (webhookResponse.ok) {
          deliveryStatus = 'forwarded';
        } else {
          deliveryStatus = 'queued_dead_letter';
          console.error(
            `[intake] Webhook forward returned HTTP ${webhookResponse.status} for ${validation.referenceId}`
          );
        }
      } catch {
        deliveryStatus = 'queued_dead_letter';
        console.error(`[intake] Webhook forward network exception for ${validation.referenceId}`);
      }

      if (deliveryStatus === 'queued_dead_letter' && context.env?.INTAKE_ARCHIVE) {
        try {
          await context.env.INTAKE_ARCHIVE.put(
            `dead-letter:${validation.referenceId}`,
            JSON.stringify(envelope),
            { expirationTtl: 60 * 60 * 24 * 30 }
          );
        } catch {
          console.error(`[intake] KV dead-letter write failed for ${validation.referenceId}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        referenceId: validation.referenceId,
        deliveryStatus,
        message: 'Inquiry registered. Scoping discovery will be initiated within 1 business day.',
        payload: forwardPayload,
      }),
      {
        status: 200,
        headers: JSON_SECURITY_HEADERS,
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
        headers: JSON_SECURITY_HEADERS,
      }
    );
  }
};
