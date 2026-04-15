import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    first_name,
    email,
    phone,
    contact_method,
    wa_number,
    business_description,
    operational_challenge,
    success_vision,
    service,
    timeline,
    referral_source,
  } = req.body;

  if (!first_name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const row = (label, value) => value ? `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#64748B;font-size:13px;width:160px;vertical-align:top">${label}</td>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#F8FAFC;font-weight:500">${value}</td>
    </tr>` : '';

  const block = (label, value) => value ? `
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:20px;margin-bottom:16px">
      <div style="color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">${label}</div>
      <div style="color:#E2E8F0;line-height:1.7;white-space:pre-wrap">${value}</div>
    </div>` : '';

  const { data, error } = await resend.emails.send({
    from: 'ThryveX Contact Form <noreply@thryvexgroup.com>',
    to: 'services@thryvexgroup.com',
    replyTo: email,
    subject: `New Strategy Call Application from ${first_name}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:620px;margin:0 auto;background:#050508;color:#E2E8F0;padding:40px;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
        <div style="margin-bottom:32px">
          <div style="font-size:22px;font-weight:700;background:linear-gradient(135deg,#0EA5E9,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px">ThryveX Group</div>
          <div style="color:#64748B;font-size:13px">New strategy call application</div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
          ${row('First Name', first_name)}
          ${row('Email', `<a href="mailto:${email}" style="color:#0EA5E9;text-decoration:none">${email}</a>`)}
          ${row('Phone', phone)}
          ${row('Preferred Contact', contact_method)}
          ${row('WhatsApp', wa_number)}
          ${row('Service Interested In', service)}
          ${row('Timeline', timeline)}
          ${row('How They Found Us', referral_source)}
        </table>

        ${block('What does their business do?', business_description)}
        ${block('Biggest operational challenge', operational_challenge)}
        ${block('What success looks like', success_vision)}

        <a href="mailto:${email}?subject=Re: Your ThryveX Strategy Call Application" style="display:inline-block;background:linear-gradient(135deg,#0EA5E9,#7C3AED);color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">Reply to ${first_name}</a>

        <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);color:#64748B;font-size:12px">
          Sent from thryvexgroup.com · ${new Date().toUTCString()}
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('Resend error:', JSON.stringify(error, null, 2));
    return res.status(500).json({ error: 'Failed to send email', detail: error.message });
  }

  return res.status(200).json({ success: true, id: data?.id });
}
