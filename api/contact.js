import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, company, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await resend.emails.send({
      from: 'ThryveX Contact Form <noreply@thryvexgroup.com>',
      to: 'glucas@thryvexgroup.com',
      replyTo: email,
      subject: `New Inquiry from ${name}${company ? ` — ${company}` : ''}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#050508;color:#E2E8F0;padding:40px;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
          <div style="margin-bottom:32px">
            <div style="font-size:22px;font-weight:700;background:linear-gradient(135deg,#0EA5E9,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px">ThryveX Group</div>
            <div style="color:#64748B;font-size:13px">New contact form submission</div>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#64748B;font-size:13px;width:120px">Name</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#F8FAFC;font-weight:500">${name}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#64748B;font-size:13px">Email</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#0EA5E9"><a href="mailto:${email}" style="color:#0EA5E9;text-decoration:none">${email}</a></td>
            </tr>
            ${company ? `
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#64748B;font-size:13px">Company</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#F8FAFC;font-weight:500">${company}</td>
            </tr>` : ''}
            ${service ? `
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#64748B;font-size:13px">Service</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#F8FAFC">${service}</td>
            </tr>` : ''}
          </table>

          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:20px;margin-bottom:28px">
            <div style="color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Message</div>
            <div style="color:#E2E8F0;line-height:1.7;white-space:pre-wrap">${message}</div>
          </div>

          <a href="mailto:${email}?subject=Re: Your ThryveX Inquiry" style="display:inline-block;background:linear-gradient(135deg,#0EA5E9,#7C3AED);color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">Reply to ${name}</a>

          <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);color:#64748B;font-size:12px">
            Sent from thryvexgroup.com · ${new Date().toUTCString()}
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
