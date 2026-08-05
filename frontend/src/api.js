const API_BASE_URL = 'http://localhost:8080';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = data?.mensagem || 'Nao foi possivel concluir a solicitacao.';
    throw new Error(message);
  }

  return data;
}

export function cadastrarUsuario(payload) {
  return request('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fazerLogin(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
