export const API_BASE_URL = 'http://localhost:8080';

function normalizeToken(token) {
  return String(token ?? '')
    .trim()
    .replace(/^"+|"+$/g, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
}

function authHeaders(token) {
  const normalizedToken = normalizeToken(token);

  if (!normalizedToken) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${normalizedToken}`,
  };
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const { headers, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  });

  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = data?.mensagem || 'Nao foi possivel concluir a solicitacao.';
    const error = new Error(message);
    error.status = response.status;
    error.errors = data?.erros ?? [];
    throw error;
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

export function criarPedido(token, payload) {
  return request('/api/pedidos', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function listarMeusPedidos(token) {
  return request('/api/pedidos/meus', {
    headers: authHeaders(token),
  });
}

export function listarProdutosAtivos() {
  return request('/api/produtos/ativos');
}

export function listarProdutos(token) {
  return request('/api/produtos', {
    headers: authHeaders(token),
  });
}

export function criarProduto(token, payload) {
  return request('/api/produtos', {
    method: 'POST',
    headers: authHeaders(token),
    body: payload,
  });
}

export function atualizarProduto(token, id, payload) {
  return request(`/api/produtos/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: payload,
  });
}
