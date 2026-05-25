// En dev : vide = proxy Vite. En production : VITE_API_URL pointe vers Railway
export const API_URL = import.meta.env.VITE_API_URL || '';

export const uploadUrl = (path: string) =>
  path ? `${API_URL}${path.startsWith('/') ? path : '/' + path}` : '';
