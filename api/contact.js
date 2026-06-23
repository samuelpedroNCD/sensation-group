export const config = { runtime: 'nodejs20.x' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: 'CRM not configured' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { name = '', email = '', phone = '', event_type = '', event_date = '', message = '' } = body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || '';

  const comments = [
    event_type ? `Tipo de evento: ${event_type}` : null,
    event_date ? `Data do evento: ${event_date}` : null,
    '',
    message,
  ].filter(l => l !== null).join('\n');

  const payload = {
    fields: {
      TITLE: `Contacto Web — ${name.trim()}`,
      NAME: firstName,
      LAST_NAME: lastName,
      EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
      PHONE: phone ? [{ VALUE: phone, VALUE_TYPE: 'WORK' }] : [],
      STATUS_ID: 'NEW',
      ASSIGNED_BY_ID: 0,
      SOURCE_ID: 'WEB',
      COMMENTS: comments,
    },
  };

  try {
    const bitrixRes = await fetch(`${webhookUrl}crm.lead.add.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await bitrixRes.json();
    if (data.error) {
      console.error('Bitrix24 error:', data.error, data.error_description);
      return res.status(502).json({ error: 'CRM rejected the request' });
    }

    return res.status(200).json({ ok: true, id: data.result });
  } catch (err) {
    console.error('CRM request failed:', err);
    return res.status(502).json({ error: 'CRM unreachable' });
  }
}
