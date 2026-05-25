const BACKEND = 'https://projet-universite-production.up.railway.app';

module.exports = async function handler(req, res) {
  const path = '/' + (req.query.path || []).join('/');
  const url = `${BACKEND}/api${path}`;

  const headers = {};
  if (req.headers['authorization']) headers['authorization'] = req.headers['authorization'];
  if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];

  const fetchOptions = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
    fetchOptions.headers['content-type'] = 'application/json';
  }

  try {
    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', details: err.message });
  }
};
