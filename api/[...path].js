const BACKEND = 'https://projet-universite-production.up.railway.app';

export default async function handler(req, res) {
  const path = '/' + (req.query.path || []).join('/');
  const url = `${BACKEND}/api${path}`;

  const headers = { ...req.headers };
  delete headers.host;
  delete headers['x-forwarded-for'];
  delete headers['x-vercel-id'];

  const fetchOptions = {
    method: req.method,
    headers: { ...headers, 'Content-Type': 'application/json' },
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.text();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding'].includes(key)) {
        res.setHeader(key, value);
      }
    });
    res.send(data);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', details: err.message });
  }
}
