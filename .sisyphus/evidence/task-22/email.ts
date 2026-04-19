import { createResendClient, isResendConfigured } from './resend';

export interface DesignQuoteEmailInput {
  to: string;
  projectName: string;
  projectId: string;
  artifactUrls: Array<{ url: string; filename: string }>;
}

export interface DesignQuoteEmailResult {
  success: boolean;
  emailId: string | null;
  error: string | null;
  degraded: boolean;
}

function buildEmailHtml(projectName: string, projectId: string, fileCount: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Quote Request</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0f;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#111118;border:1px solid #27273a;">
          <tr>
            <td style="padding:32px;border-bottom:1px solid #27273a;">
              <h1 style="margin:0;color:#00f0ff;font-size:20px;text-transform:uppercase;letter-spacing:2px;">
                Raino — Design Quote Request
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#e4e4e7;font-size:14px;line-height:1.6;">
                A user has requested a professional manufacturing quote for their PCB design.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1a1a24;border:1px solid #27273a;margin:16px 0;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 8px;color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Project Name</p>
                    <p style="margin:0;color:#e4e4e7;font-size:14px;">${escapeHtml(projectName)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px;border-top:1px solid #27273a;">
                    <p style="margin:0 0 8px;color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Project ID</p>
                    <p style="margin:0;color:#e4e4e7;font-size:14px;font-family:monospace;">${escapeHtml(projectId)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px;border-top:1px solid #27273a;">
                    <p style="margin:0 0 8px;color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Attachments</p>
                    <p style="margin:0;color:#e4e4e7;font-size:14px;">${fileCount} file(s) attached</p>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.6;">
                This email was sent automatically from the Raino platform.
                The attached design files are ready for manufacturing review.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #27273a;">
              <p style="margin:0;color:#64748b;font-size:11px;">
                Raino — Constrained autonomy for hardware design
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Send a design quote email with artifact attachments.
 * Uses the Resend `path` attachment approach (public URLs fetched server-side).
 * Returns degraded mode info when Resend is not configured.
 */
export async function sendDesignQuoteEmail(
  input: DesignQuoteEmailInput,
): Promise<DesignQuoteEmailResult> {
  if (!isResendConfigured()) {
    return {
      success: false,
      emailId: null,
      error: 'Email service not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.',
      degraded: true,
    };
  }

  const resend = createResendClient();
  if (!resend) {
    return {
      success: false,
      emailId: null,
      error: 'Email service not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.',
      degraded: true,
    };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL!;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: input.to,
      subject: `Raino Design Quote Request — ${input.projectName}`,
      html: buildEmailHtml(input.projectName, input.projectId, input.artifactUrls.length),
      attachments: input.artifactUrls.map((artifact) => ({
        path: artifact.url,
        filename: artifact.filename,
      })),
    });

    if (error) {
      return {
        success: false,
        emailId: null,
        error: error.message,
        degraded: false,
      };
    }

    return {
      success: true,
      emailId: data?.id ?? null,
      error: null,
      degraded: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error sending email';
    return {
      success: false,
      emailId: null,
      error: message,
      degraded: false,
    };
  }
}
