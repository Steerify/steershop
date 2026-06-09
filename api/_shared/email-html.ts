/**
 * Shared HTML email builder utilities for SteerSolo transactional emails.
 * Uses the brand palette: Midnight Obsidian bg, Lemon Green (#66e613) accent, Poppins font.
 */

const LOGO_URL =
  'https://steersolo.com/email-logo.jpg'

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Poppins', Arial, sans-serif;
    background-color: #0b101c;
    color: #f5f4f2;
    padding: 32px 0;
  }
  .wrapper {
    max-width: 600px;
    margin: 0 auto;
    background: #101623;
    border-radius: 16px;
    border: 1px solid #1f2937;
    overflow: hidden;
    box-shadow: 0 8px 32px -8px rgba(102,230,19,0.12), 0 2px 8px rgba(0,0,0,0.4);
  }
  .header {
    padding: 32px;
    text-align: center;
    border-bottom: 1px solid #1f2937;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(102,230,19,0.07) 2px, transparent 2px),
      radial-gradient(circle at 80% 80%, rgba(102,230,19,0.05) 2px, transparent 2px),
      radial-gradient(circle at 50% 50%, rgba(102,230,19,0.03) 1.5px, transparent 1.5px);
    background-size: 28px 28px, 28px 28px, 18px 18px;
  }
  .header-accent {
    background: linear-gradient(135deg, #0b101c 0%, #0d1a12 60%, #0e1f0a 100%);
  }
  .header-danger { background: linear-gradient(135deg, #1a0a0a 0%, #1f0d0d 100%); }
  .header-paid   { background: linear-gradient(135deg, #0a1a0d 0%, #0e2210 100%); }
  .logo { width: 64px; height: auto; margin: 0 auto 14px; display: block; }
  .header h1 { font-size: 22px; font-weight: 700; color: #f5f4f2; margin: 0; }
  .header h1 .accent { color: #66e613; }
  .badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    border-radius: 20px;
    padding: 4px 12px;
    margin-bottom: 12px;
  }
  .badge-green { background: rgba(102,230,19,0.15); color: #66e613; border: 1px solid rgba(102,230,19,0.25); }
  .badge-blue  { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }
  .badge-amber { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
  .badge-red   { background: rgba(239,68,68,0.15);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
  .body  { padding: 28px 32px; }
  p { font-size: 15px; color: #d1d5db; line-height: 1.7; margin-bottom: 16px; }
  p:last-child { margin-bottom: 0; }
  strong { color: #f5f4f2; }
  a { color: #66e613; text-decoration: none; }
  /* ── Order ID banner ── */
  .order-id {
    background: #0b101c;
    border: 1px solid #1f2937;
    border-left: 3px solid #66e613;
    border-radius: 10px;
    padding: 12px 18px;
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
  }
  .order-id strong { color: #66e613; font-size: 15px; letter-spacing: 2px; }
  /* ── Items table ── */
  .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  .items-table th {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #9ca3af;
    padding: 10px 12px;
    border-bottom: 1px solid #1f2937;
    text-align: left;
  }
  .items-table th:last-child, .items-table td:last-child { text-align: right; }
  .items-table td {
    font-size: 14px;
    color: #d1d5db;
    padding: 12px 12px;
    border-bottom: 1px solid #1a2030;
  }
  .items-table .total-row td {
    font-size: 15px;
    font-weight: 700;
    color: #f5f4f2;
    border-bottom: none;
    border-top: 1px solid #1f2937;
    padding-top: 14px;
  }
  .total-row td:last-child { color: #66e613; }
  /* ── Status box ── */
  .status-box {
    background: #0b101c;
    border: 1px solid #1f2937;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
  }
  .status-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .status-value { font-size: 18px; font-weight: 700; color: #66e613; }
  /* ── Digital download box ── */
  .download-box {
    background: rgba(102,230,19,0.06);
    border: 1px solid rgba(102,230,19,0.2);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
  }
  .download-box h3 { font-size: 14px; color: #66e613; margin-bottom: 12px; }
  .download-box li { font-size: 14px; color: #d1d5db; margin-bottom: 8px; list-style: none; }
  .download-box a { color: #66e613; font-weight: 600; }
  /* ── Pending download box ── */
  .pending-box {
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
  }
  .pending-box h3 { font-size: 14px; color: #fbbf24; margin-bottom: 8px; }
  .pending-box p { font-size: 13px; color: #9ca3af; margin: 0; }
  /* ── Review CTA ── */
  .review-box {
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
  }
  .review-box h3 { font-size: 15px; color: #fbbf24; margin-bottom: 12px; }
  .review-btn {
    display: inline-block;
    background: #fbbf24;
    color: #000;
    font-size: 14px;
    font-weight: 700;
    border-radius: 10px;
    padding: 12px 24px;
    text-decoration: none;
  }
  /* ── CTA ── */
  .cta-wrap { text-align: center; margin: 24px 0; }
  .cta {
    display: inline-block;
    background: #66e613;
    color: #000;
    font-size: 15px;
    font-weight: 700;
    border-radius: 12px;
    padding: 14px 32px;
    text-decoration: none;
  }
  /* ── Footer ── */
  .footer { border-top: 1px solid #1f2937; padding: 18px 32px; text-align: center; }
  .footer p { font-size: 12px; color: #6b7280; margin: 0 0 4px; }
  .footer .brand { color: #66e613; font-style: italic; margin: 0; }
`

export function buildEmailHtml(opts: {
  headerClass?: string
  badge?: { text: string; class: string }
  title: string
  body: string
}): string {
  const { headerClass = 'header-accent', badge, title, body } = opts
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="header ${headerClass}">
      <img src="${LOGO_URL}" alt="SteerSolo" class="logo" />
      ${badge ? `<div class="badge ${badge.class}">${badge.text}</div><br/>` : ''}
      <h1>${title}</h1>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>SteerSolo · Automated notification — do not reply.</p>
      <p class="brand">SteerSolo — Launch your WhatsApp-powered online store in minutes 🚀</p>
    </div>
  </div>
</body>
</html>`
}
