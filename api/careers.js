import formidable from 'formidable';
import fs from 'fs';

export const config = {
  runtime: 'nodejs',
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: 'CRM not configured' });
  }

  const form = formidable({ maxFileSize: 5 * 1024 * 1024, keepExtensions: true });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    return res.status(400).json({ error: 'Could not parse form data' });
  }

  const get = (key) => (Array.isArray(fields[key]) ? fields[key][0] : fields[key]) || '';
  const name = get('name');
  const email = get('email');
  const phone = get('phone');
  const area = get('area');
  const linkedin = get('linkedin');
  const message = get('message');

  if (!name || !email || !message || !area) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || '';

  const comments = [
    `Área de interesse: ${area}`,
    linkedin ? `LinkedIn: ${linkedin}` : null,
    '',
    message,
  ].filter(l => l !== null).join('\n');

  const payload = {
    fields: {
      TITLE: `Candidatura Web — ${name.trim()}`,
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

  /* Attach CV if provided */
  const cvFile = files.cv ? (Array.isArray(files.cv) ? files.cv[0] : files.cv) : null;
  if (cvFile && cvFile.filepath) {
    try {
      const fileBuffer = fs.readFileSync(cvFile.filepath);
      const base64 = fileBuffer.toString('base64');
      const originalName = cvFile.originalFilename || 'cv.pdf';
      payload.fields.FILES = [[originalName, base64]];
    } catch (err) {
      console.warn('CV read failed, attaching without file:', err.message);
    }
  }

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
