// URL de base de l'API — vide = proxy Vite (recommandé en dev)
export const API_URL = '';

export const uploadUrl = (path: string) =>
  path ? `${API_URL}${path.startsWith('/') ? path : '/' + path}` : '';
