import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  Grid2X2,
  Heart,
  Image as ImageIcon,
  List,
  LogOut,
  MessageCircle,
  PackageCheck,
  Pencil,
  PlusCircle,
  Search,
  ShoppingBag,
  ShoppingCart,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  API_BASE_URL,
  atualizarProduto,
  cadastrarUsuario,
  criarPedido,
  criarProduto,
  fazerLogin,
  listarMeusPedidos,
  listarProdutos,
  listarProdutosAtivos,
} from './api';

const produtosPreview = [
  {
    id: 1,
    nome: 'Rosas Classicas',
    preco: 'R$ 24,90',
    precoValor: 24.9,
    tema: 'Rosas Classicas',
    descricao: 'Apostila digital com passo a passo para flores delicadas.',
    cor: 'rose',
  },
  {
    id: 2,
    nome: 'Girassois Encantadores',
    preco: 'R$ 24,90',
    precoValor: 24.9,
    tema: 'Girassois Encantadores',
    descricao: 'Composicoes alegres para panos de prato e jogos de cozinha.',
    cor: 'yellow',
  },
  {
    id: 3,
    nome: 'Copos de Leite',
    preco: 'R$ 24,90',
    precoValor: 24.9,
    tema: 'Copos de Leite',
    descricao: 'Uma apostila classica para pintura elegante em tecido.',
    cor: 'green',
  },
  {
    id: 4,
    nome: 'Hortensias Delicadas',
    preco: 'R$ 24,90',
    precoValor: 24.9,
    tema: 'Hortensias Delicadas',
    descricao: 'Tecnicas suaves para folhas, luz e volume nas petalas.',
    cor: 'blue',
  },
  {
    id: 5,
    nome: 'Amores-Perfeitos',
    preco: 'R$ 24,90',
    precoValor: 24.9,
    tema: 'Amores-Perfeitos',
    descricao: 'Exercicios de contraste, acabamento e pintura delicada.',
    cor: 'violet',
  },
  {
    id: 6,
    nome: 'Frutas Tropicais',
    preco: 'R$ 24,90',
    precoValor: 24.9,
    tema: 'Frutas Tropicais',
    descricao: 'Ideias coloridas para barrados e pecas decorativas.',
    cor: 'orange',
  },
  {
    id: 7,
    nome: 'Bules e Xicaras',
    preco: 'R$ 24,90',
    precoValor: 24.9,
    tema: 'Bules e Xicaras',
    descricao: 'Pecas charmosas para cozinha com composicao delicada.',
    cor: 'tea',
  },
  {
    id: 8,
    nome: 'Menina no Campo',
    preco: 'R$ 24,90',
    precoValor: 24.9,
    tema: 'Menina no Campo',
    descricao: 'Projeto especial com detalhes delicados e acabamento suave.',
    cor: 'field',
  },
];

const initialLogin = {
  email: '',
  senha: '',
};

const initialRegister = {
  nome: '',
  email: '',
  senha: '',
};

const initialProductForm = {
  nome: '',
  descricao: '',
  preco: '24.90',
  tipo: 'APOSTILA',
  ativo: true,
};

const initialProductFiles = {
  arquivoPdf: null,
  imagemCapa: null,
};

const coverColors = ['rose', 'yellow', 'green', 'blue', 'violet', 'orange', 'tea', 'field'];

function resolveAssetUrl(url) {
  if (!url) {
    return '';
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `${API_BASE_URL}${url}`;
}

function normalizeToken(tokenValue) {
  return String(tokenValue ?? '')
    .trim()
    .replace(/^"+|"+$/g, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value);
}

function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [activePage, setActivePage] = useState('produtos');
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [perfilForm, setPerfilForm] = useState(null);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState(null);
  const [pageMessage, setPageMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [pedidoItens, setPedidoItens] = useState([]);
  const [pedidoCriadoEm, setPedidoCriadoEm] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isQuickSummaryOpen, setIsQuickSummaryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsMessage, setProductsMessage] = useState(null);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [productFiles, setProductFiles] = useState(initialProductFiles);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [adminProducts, setAdminProducts] = useState([]);
  const [isAdminProductsLoading, setIsAdminProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const isLogin = activeTab === 'login';

  const greeting = useMemo(() => {
    if (usuarioLogado) {
      return `Bem-vindo(a), ${usuarioLogado.nome}!`;
    }

    return isLogin
      ? 'Entre para acessar suas compras digitais.'
      : 'Crie sua conta para comprar apostilas em PDF.';
  }, [isLogin, usuarioLogado]);

  const totalItens = useMemo(
    () => pedidoItens.reduce((total, item) => total + item.quantidade, 0),
    [pedidoItens],
  );

  const subtotalPedido = useMemo(
    () =>
      pedidoItens.reduce(
        (total, item) => total + item.precoValor * item.quantidade,
        0,
      ),
    [pedidoItens],
  );

  const produtosCatalogo = useMemo(
    () =>
      produtos.map((produto, index) => {
        const precoValor = Number(produto.preco);

        return {
          id: produto.id,
          nome: produto.nome,
          descricao: produto.descricao,
          preco: formatCurrency(precoValor),
          precoValor,
          tema: produto.nome,
          cor: coverColors[index % coverColors.length],
          tipo: produto.tipo,
          urlPdf: produto.urlPdf,
          urlImagemCapa: resolveAssetUrl(produto.urlImagemCapa),
          quantidadePaginas: produto.quantidadePaginas,
        };
      }),
    [produtos],
  );

  const coverPreviewUrl = useMemo(
    () => (productFiles.imagemCapa ? URL.createObjectURL(productFiles.imagemCapa) : ''),
    [productFiles.imagemCapa],
  );

  const editingCoverUrl = editingProduct?.urlImagemCapa
    ? resolveAssetUrl(editingProduct.urlImagemCapa)
    : '';
  const productCoverPreviewUrl = coverPreviewUrl || editingCoverUrl;

  const carregarProdutos = useCallback(async () => {
    setIsProductsLoading(true);
    setProductsMessage(null);

    try {
      const data = await listarProdutosAtivos();
      setProdutos(data ?? []);
    } catch (error) {
      setProductsMessage({
        type: 'error',
        text: error.message,
      });
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  const carregarAdminProdutos = useCallback(async (authToken) => {
    if (!authToken) {
      return;
    }

    setIsAdminProductsLoading(true);

    try {
      const data = await listarProdutos(authToken);
      setAdminProducts(data ?? []);
    } catch (error) {
      setPageMessage({ type: 'error', text: error.message });
    } finally {
      setIsAdminProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    listarProdutosAtivos()
      .then((data) => {
        if (isMounted) {
          setProdutos(data ?? []);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setProductsMessage({
            type: 'error',
            text: error.message,
          });
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsProductsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!coverPreviewUrl) {
      return undefined;
    }

    return () => URL.revokeObjectURL(coverPreviewUrl);
  }, [coverPreviewUrl]);

  useEffect(() => {
    if (pageMessage?.type !== 'success') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPageMessage(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [pageMessage]);

  function updateLoginField(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  function updateRegisterField(event) {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  }

  function updatePerfilField(event) {
    const { name, value } = event.target;
    setPerfilForm((current) => ({ ...current, [name]: value }));
  }

  function updateProductField(event) {
    const { checked, name, type, value } = event.target;
    setProductForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function updateProductFile(name, files) {
    const [file] = files;

    if (!file) {
      return;
    }

    setProductFiles((current) => ({
      ...current,
      [name]: file,
    }));
  }

  function handleFileDrop(event, name) {
    event.preventDefault();
    updateProductFile(name, event.dataTransfer.files);
  }

  function resetProductEditor() {
    setEditingProduct(null);
    setProductForm(initialProductForm);
    setProductFiles(initialProductFiles);
    setPageMessage(null);
  }

  function startEditingProduct(produto) {
    setEditingProduct(produto);
    setProductForm({
      nome: produto.nome ?? '',
      descricao: produto.descricao ?? '',
      preco: String(produto.preco ?? ''),
      tipo: produto.tipo ?? 'APOSTILA',
      ativo: Boolean(produto.ativo),
    });
    setProductFiles(initialProductFiles);
    setPageMessage(null);
  }

  function renderProductThumbnail(produto) {
    if (produto.urlImagemCapa) {
      return (
        <div className="summary-thumb summary-thumb--image">
          <img src={produto.urlImagemCapa} alt={`Capa da apostila ${produto.nome}`} />
        </div>
      );
    }

    return (
      <div className={`summary-thumb book-cover--${produto.cor}`}>
        <span>{produto.tema.slice(0, 1)}</span>
      </div>
    );
  }

  function renderOrderItemThumbnail(item) {
    const imageUrl = resolveAssetUrl(item.produtoUrlImagemCapa);

    if (imageUrl) {
      return (
        <div className="summary-thumb summary-thumb--image">
          <img src={imageUrl} alt={`Capa da apostila ${item.produtoNome}`} />
        </div>
      );
    }

    return (
      <div className="summary-thumb book-cover--rose">
        <span>{item.produtoNome.slice(0, 1)}</span>
      </div>
    );
  }

  async function carregarMeusPedidos(authToken) {
    if (!authToken) {
      return;
    }

    setIsOrdersLoading(true);

    try {
      const data = await listarMeusPedidos(authToken);
      setPedidos(data ?? []);
    } catch (error) {
      setPageMessage({ type: 'error', text: error.message });
    } finally {
      setIsOrdersLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const data = await fazerLogin(loginForm);
      const authToken = normalizeToken(data.token);
      const user = {
        id: data.usuarioId,
        nome: data.nome,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem('ivoneideToken', authToken);
      setToken(authToken);
      setUsuarioLogado(user);
      setPerfilForm({ nome: user.nome, email: user.email });
      setActivePage('produtos');
      await carregarMeusPedidos(authToken);
      setMessage({
        type: 'success',
        text: 'Login realizado com sucesso.',
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await cadastrarUsuario({ ...registerForm, ativo: true });
      setRegisterForm(initialRegister);
      setLoginForm({
        email: registerForm.email,
        senha: '',
      });
      setActiveTab('login');
      setMessage({
        type: 'success',
        text: 'Cadastro criado com sucesso. Agora faca login com sua senha.',
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('ivoneideToken');
    setUsuarioLogado(null);
    setPerfilForm(null);
    setToken('');
    setMessage(null);
    setPageMessage(null);
    setLoginForm(initialLogin);
    setPedidoItens([]);
    setPedidoCriadoEm(null);
    setPedidos([]);
    setExpandedOrderId(null);
    setActivePage('produtos');
    setIsQuickSummaryOpen(false);
  }

  function handleExpiredSession() {
    localStorage.removeItem('ivoneideToken');
    setUsuarioLogado(null);
    setPerfilForm(null);
    setToken('');
    setPedidoItens([]);
    setPedidoCriadoEm(null);
    setPedidos([]);
    setExpandedOrderId(null);
    setEditingProduct(null);
    setProductForm(initialProductForm);
    setProductFiles(initialProductFiles);
    setActiveTab('login');
    setActivePage('produtos');
    setMessage({
      type: 'error',
      text: 'Sua sessao expirou ou o token nao foi aceito. Faca login novamente como administrador.',
    });
  }

  function addProdutoAoCarrinho(produto) {
    setPedidoCriadoEm((current) => current ?? new Date());
    setPedidoItens((current) => {
      const existingItem = current.find((item) => item.id === produto.id);

      if (existingItem) {
        return current.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        );
      }

      return [...current, { ...produto, quantidade: 1 }];
    });
  }

  function handleAdicionarAoCarrinho(produto) {
    addProdutoAoCarrinho(produto);
    setPageMessage({
      type: 'success',
      text: `${produto.nome} foi adicionada ao carrinho.`,
    });
  }

  function handleComprarAgora(produto) {
    addProdutoAoCarrinho(produto);
    setPageMessage(null);
    setIsQuickSummaryOpen(true);
  }

  function updateQuantidade(produtoId, quantityChange) {
    setPedidoItens((current) => {
      const nextItems = current
        .map((item) =>
          item.id === produtoId
            ? { ...item, quantidade: item.quantidade + quantityChange }
            : item,
        )
        .filter((item) => item.quantidade > 0);

      if (nextItems.length === 0) {
        setPedidoCriadoEm(null);
      }

      return nextItems;
    });
  }

  function limparCarrinho() {
    setPedidoItens([]);
    setPedidoCriadoEm(null);
    setPageMessage(null);
    setIsQuickSummaryOpen(false);
  }

  async function finalizarCompra() {
    if (pedidoItens.length === 0) {
      return;
    }

    setIsFinalizing(true);
    setPageMessage(null);

    const payload = {
      itens: pedidoItens.map((item) => ({
        produtoId: item.id,
        quantidade: item.quantidade,
      })),
    };

    try {
      const order = await criarPedido(token, payload);
      setPedidos((current) => [order, ...current]);
      setExpandedOrderId(order.id);
      limparCarrinho();
      setActivePage('pedidos');
      setPageMessage({
        type: 'success',
        text: 'Pedido criado com sucesso no backend.',
      });
    } catch (error) {
      setPageMessage({
        type: 'error',
        text: `${error.message} Verifique se os produtos ainda existem e estao ativos no backend.`,
      });
    } finally {
      setIsFinalizing(false);
    }
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    setPageMessage(null);
    const isEditing = Boolean(editingProduct);

    if (!isEditing && !productFiles.arquivoPdf) {
      setPageMessage({
        type: 'error',
        text: 'Selecione o arquivo PDF da apostila.',
      });
      return;
    }

    const authToken = normalizeToken(token || localStorage.getItem('ivoneideToken'));

    if (!authToken) {
      setPageMessage({
        type: 'error',
        text: 'Sua sessao expirou. Faca login novamente para cadastrar produtos.',
      });
      return;
    }

    setIsSavingProduct(true);

    const payload = new FormData();
    payload.append('nome', productForm.nome);
    payload.append('descricao', productForm.descricao);
    payload.append('preco', productForm.preco.replace(',', '.'));
    payload.append('tipo', productForm.tipo);
    payload.append('ativo', String(productForm.ativo));

    if (productFiles.arquivoPdf) {
      payload.append('arquivoPdf', productFiles.arquivoPdf);
    }

    if (productFiles.imagemCapa) {
      payload.append('imagemCapa', productFiles.imagemCapa);
    }

    try {
      if (isEditing) {
        await atualizarProduto(authToken, editingProduct.id, payload);
      } else {
        await criarProduto(authToken, payload);
      }

      resetProductEditor();
      await carregarProdutos();
      await carregarAdminProdutos(authToken);
      setActivePage('admin-produtos');
      setPageMessage({
        type: 'success',
        text: isEditing ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.',
      });
    } catch (error) {
      if (error.status === 401) {
        handleExpiredSession();
        return;
      }

      setPageMessage({ type: 'error', text: error.message });
    } finally {
      setIsSavingProduct(false);
    }
  }

  function salvarPerfil(event) {
    event.preventDefault();
    setUsuarioLogado((current) => ({
      ...current,
      nome: perfilForm.nome,
      email: perfilForm.email,
    }));
    setPageMessage({
      type: 'success',
      text: 'Dados atualizados na tela. Depois vamos criar o endpoint para salvar no backend.',
    });
  }

  function renderCatalogo() {
    return (
      <section className="store-content" aria-label="Catalogo de apostilas">
        <div className="store-title">
          <div>
            <h2>Apostilas Digitais</h2>
            <p>Explore nossas apostilas em PDF para pintar e se inspirar.</p>
          </div>
          <div className="catalog-controls">
            <select aria-label="Ordenar apostilas" defaultValue="relevantes">
              <option value="relevantes">Mais relevantes</option>
              <option value="menor-preco">Menor preco</option>
              <option value="maior-preco">Maior preco</option>
            </select>
            <button className="view-button view-button--active" type="button" aria-label="Grade">
              <Grid2X2 size={20} aria-hidden="true" />
            </button>
            <button className="view-button" type="button" aria-label="Lista">
              <List size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {pageMessage && (
          <div className={`feedback feedback--${pageMessage.type}`}>
            {pageMessage.text}
          </div>
        )}

        <div className="store-grid">
          {produtosCatalogo.map((produto) => (
            <article
              className="store-product-card"
              key={produto.id}
              onClick={() => setSelectedProduct(produto)}
            >
              <div
                className={
                  produto.urlImagemCapa
                    ? 'book-cover book-cover--image'
                    : `book-cover book-cover--${produto.cor}`
                }
              >
                {produto.urlImagemCapa && (
                  <img src={produto.urlImagemCapa} alt={`Capa da apostila ${produto.nome}`} />
                )}
                <span className="pdf-badge">PDF</span>
                {!produto.urlImagemCapa && (
                  <>
                    <span className="book-spiral" aria-hidden="true" />
                    <div className="book-title">
                      {produto.tema}
                      <small>Pintura em Tecido</small>
                    </div>
                    <div className="book-art" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  </>
                )}
              </div>
              <div className="store-product-card__body">
                <h3>{produto.nome}</h3>
                <div className="store-product-card__footer">
                  <strong>{produto.preco}</strong>
                  <button
                    className="secondary-cart-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAdicionarAoCarrinho(produto);
                    }}
                  >
                    <ShoppingCart size={16} aria-hidden="true" />
                    Adicionar ao carrinho
                  </button>
                  <button
                    className="primary-button primary-button--small"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleComprarAgora(produto);
                    }}
                  >
                    <CreditCard size={16} aria-hidden="true" />
                    Comprar agora
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {isProductsLoading && (
          <div className="empty-page compact-empty">
            <PackageCheck size={42} aria-hidden="true" />
            <strong>Buscando produtos...</strong>
            <p>Estamos carregando as apostilas cadastradas no backend.</p>
          </div>
        )}

        {!isProductsLoading && productsMessage && (
          <div className={`feedback feedback--${productsMessage.type}`}>
            {productsMessage.text}
          </div>
        )}

        {!isProductsLoading && !productsMessage && produtosCatalogo.length === 0 && (
          <div className="empty-page compact-empty">
            <PackageCheck size={42} aria-hidden="true" />
            <strong>Nenhuma apostila ativa cadastrada</strong>
            <p>Cadastre produtos reais pelo painel admin para eles aparecerem aqui.</p>
            {usuarioLogado.role === 'ADMIN' && (
              <button
                className="primary-button inline-button"
                type="button"
                onClick={() => setActivePage('admin-produtos')}
              >
                Cadastrar produto
              </button>
            )}
          </div>
        )}

        <div className="download-info">
          <Download size={26} aria-hidden="true" />
          Todas as apostilas sao digitais (PDF) e voce recebe o acesso
          imediatamente apos a confirmacao do pagamento.
        </div>
      </section>
    );
  }

  function renderCarrinho() {
    return (
      <section className="store-content page-card" aria-label="Carrinho de compras">
        <div className="store-title">
          <div>
            <h2>Carrinho de compras</h2>
            <p>Revise seus itens antes de finalizar o pedido.</p>
          </div>
          <span className="status-pill">{pedidoItens.length ? 'CRIADO' : 'VAZIO'}</span>
        </div>

        {pageMessage && (
          <div className={`feedback feedback--${pageMessage.type}`}>
            {pageMessage.text}
          </div>
        )}

        {pedidoItens.length === 0 ? (
          <div className="empty-page">
            <ShoppingCart size={42} aria-hidden="true" />
            <strong>Seu carrinho esta vazio</strong>
            <p>Escolha uma apostila no catalogo para montar seu pedido.</p>
            <button className="primary-button inline-button" type="button" onClick={() => setActivePage('produtos')}>
              Ver produtos
            </button>
          </div>
        ) : (
          <div className="cart-page-grid">
            <div className="cart-items-list">
              {pedidoItens.map((produto) => (
                <article className="cart-line-item" key={produto.id}>
                  {renderProductThumbnail(produto)}
                  <div>
                    <strong>{produto.nome}</strong>
                    <p>{produto.descricao}</p>
                    <div className="quantity-control">
                      <button type="button" onClick={() => updateQuantidade(produto.id, -1)}>
                        -
                      </button>
                      <span>{produto.quantidade}</span>
                      <button type="button" onClick={() => updateQuantidade(produto.id, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <strong>{formatCurrency(produto.precoValor * produto.quantidade)}</strong>
                </article>
              ))}
            </div>

            <aside className="checkout-panel">
              <div>
                <strong>Pedido em montagem</strong>
                <p>Iniciado em {formatDate(pedidoCriadoEm)}</p>
              </div>
              <div className="summary-divider" />
              <div className="summary-totals">
                <div>
                  <span>Itens</span>
                  <strong>{totalItens}</strong>
                </div>
                <div>
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotalPedido)}</strong>
                </div>
                <div>
                  <span>Desconto</span>
                  <strong>- {formatCurrency(0)}</strong>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <strong>{formatCurrency(subtotalPedido)}</strong>
                </div>
              </div>
              <div className="payment-approved payment-approved--pending">
                <CheckCircle2 size={32} aria-hidden="true" />
                <div>
                  <strong>Status atual: CRIADO</strong>
                  <p>O pedido sera enviado para o backend ao finalizar.</p>
                </div>
              </div>
              <button
                className="download-button"
                type="button"
                onClick={finalizarCompra}
                disabled={isFinalizing}
              >
                <CreditCard size={18} aria-hidden="true" />
                {isFinalizing ? 'Finalizando...' : 'Finalizar compra'}
              </button>
              <button className="clear-button" type="button" onClick={limparCarrinho}>
                Limpar carrinho
              </button>
            </aside>
          </div>
        )}
      </section>
    );
  }

  function renderPedidos() {
    return (
      <section className="store-content page-card" aria-label="Meus pedidos">
        <div className="store-title">
          <div>
            <h2>Meus pedidos</h2>
            <p>Acompanhe pedidos criados, pagos, cancelados ou expirados.</p>
          </div>
        </div>

        {pageMessage && (
          <div className={`feedback feedback--${pageMessage.type}`}>
            {pageMessage.text}
          </div>
        )}

        {isOrdersLoading ? (
          <div className="empty-page compact-empty">
            <ClipboardList size={42} aria-hidden="true" />
            <strong>Buscando seus pedidos...</strong>
            <p>Estamos carregando os pedidos salvos no backend.</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="empty-page">
            <ClipboardList size={42} aria-hidden="true" />
            <strong>Nenhum pedido encontrado</strong>
            <p>Finalize uma compra pelo carrinho para o pedido aparecer aqui.</p>
          </div>
        ) : (
          <div className="orders-list">
            {pedidos.map((pedido) => {
              const isExpanded = expandedOrderId === pedido.id;
              const totalPedidoItens = pedido.itens?.reduce(
                (total, item) => total + item.quantidade,
                0,
              ) ?? 0;

              return (
                <article className="order-card order-card--details" key={pedido.id}>
                  <button
                    className="order-card__header"
                    type="button"
                    onClick={() => setExpandedOrderId(isExpanded ? null : pedido.id)}
                    aria-expanded={isExpanded}
                  >
                    <div>
                      <strong>Pedido #{pedido.id}</strong>
                      <p>
                        Criado em {formatDate(new Date(pedido.criadoEm))} - {totalPedidoItens}{' '}
                        {totalPedidoItens === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                    <span className="status-pill">{pedido.status}</span>
                    <strong>{formatCurrency(Number(pedido.valorTotal))}</strong>
                    <span className="order-card__toggle">
                      {isExpanded ? 'Fechar detalhes' : 'Ver detalhes'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="order-details">
                      <strong className="summary-section-title">Itens do pedido</strong>
                      <div className="order-items-list">
                        {pedido.itens?.map((item) => (
                          <div className="order-item-row" key={item.id ?? item.produtoId}>
                            {renderOrderItemThumbnail(item)}
                            <div>
                              <strong>{item.produtoNome}</strong>
                              <p>{item.produtoDescricao || 'Apostila digital em PDF.'}</p>
                              {item.produtoQuantidadePaginas && (
                                <span>{item.produtoQuantidadePaginas} paginas</span>
                              )}
                            </div>
                            <div className="order-item-row__values">
                              <span>Qtd. {item.quantidade}</span>
                              <strong>{formatCurrency(Number(item.subtotal))}</strong>
                              <small>
                                {formatCurrency(Number(item.precoUnitario))} cada
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-details__footer">
                        <span>Total do pedido</span>
                        <strong>{formatCurrency(Number(pedido.valorTotal))}</strong>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  function renderDownloads() {
    const paidOrders = pedidos.filter((pedido) => pedido.status === 'PAGO');

    return (
      <section className="store-content page-card" aria-label="Downloads">
        <div className="store-title">
          <div>
            <h2>Downloads</h2>
            <p>Os arquivos aparecem aqui quando o pedido estiver pago.</p>
          </div>
        </div>

        {paidOrders.length === 0 ? (
          <div className="empty-page">
            <Download size={42} aria-hidden="true" />
            <strong>Nenhum download liberado</strong>
            <p>Quando um pedido estiver com status PAGO, os PDFs aparecem aqui.</p>
          </div>
        ) : (
          <div className="orders-list">
            {paidOrders.map((pedido) => (
              <article className="order-card" key={pedido.id}>
                <PackageCheck size={30} aria-hidden="true" />
                <div>
                  <strong>Pedido #{pedido.id}</strong>
                  <p>{pedido.itens?.length ?? 0} apostilas liberadas</p>
                </div>
                <button className="download-button compact-button" type="button">
                  Baixar PDFs
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderPerfil() {
    return (
      <section className="store-content page-card" aria-label="Meu perfil">
        <div className="store-title">
          <div>
            <h2>Meu perfil</h2>
            <p>Veja e edite seus dados de conta.</p>
          </div>
          <span className="status-pill">{usuarioLogado.role}</span>
        </div>

        {pageMessage && (
          <div className={`feedback feedback--${pageMessage.type}`}>
            {pageMessage.text}
          </div>
        )}

        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-avatar">{usuarioLogado.nome.slice(0, 1)}</div>
            <strong>{usuarioLogado.nome}</strong>
            <span>{usuarioLogado.email}</span>
            <span>Perfil: {usuarioLogado.role}</span>
          </div>

          <form className="profile-form" onSubmit={salvarPerfil}>
            <label>
              Nome
              <input
                name="nome"
                type="text"
                value={perfilForm.nome}
                onChange={updatePerfilField}
                required
              />
            </label>
            <label>
              E-mail
              <input
                name="email"
                type="email"
                value={perfilForm.email}
                onChange={updatePerfilField}
                required
              />
            </label>
            <button className="primary-button inline-button" type="submit">
              Salvar alteracoes
            </button>
          </form>
        </div>
      </section>
    );
  }

  function renderAdminProdutos() {
    if (usuarioLogado.role !== 'ADMIN') {
      return renderCatalogo();
    }

    const isEditing = Boolean(editingProduct);

    return (
      <section className="store-content page-card" aria-label="Administrar produtos">
        <div className="store-title">
          <div>
            <h2>Admin produtos</h2>
            <p>Cadastre, visualize e edite as apostilas digitais da loja.</p>
          </div>
          <span className="status-pill">ADMIN</span>
        </div>

        {pageMessage && (
          <div className={`feedback feedback--${pageMessage.type}`}>
            {pageMessage.text}
          </div>
        )}

        <div className="admin-products-layout">
          <section className="admin-products-panel" aria-label="Produtos cadastrados">
            <div className="admin-products-header">
              <div>
                <h3>Produtos cadastrados</h3>
                <p>{adminProducts.length} produto(s) encontrados</p>
              </div>
              <button className="compact-button outline-button" type="button" onClick={resetProductEditor}>
                <PlusCircle size={17} aria-hidden="true" />
                Novo
              </button>
            </div>

            {isAdminProductsLoading ? (
              <div className="empty-page empty-page--small">
                <strong>Carregando produtos...</strong>
              </div>
            ) : adminProducts.length === 0 ? (
              <div className="empty-page empty-page--small">
                <strong>Nenhum produto cadastrado ainda.</strong>
                <p>Quando voce cadastrar uma apostila, ela aparecera aqui para edicao.</p>
              </div>
            ) : (
              <div className="admin-products-list">
                {adminProducts.map((produto) => {
                  const coverUrl = resolveAssetUrl(produto.urlImagemCapa);

                  return (
                    <article
                      className={
                        editingProduct?.id === produto.id
                          ? 'admin-product-row admin-product-row--active'
                          : 'admin-product-row'
                      }
                      key={produto.id}
                    >
                      <div className="admin-product-row__cover">
                        {coverUrl ? (
                          <img src={coverUrl} alt={`Capa da apostila ${produto.nome}`} />
                        ) : (
                          <span>{produto.nome.slice(0, 1)}</span>
                        )}
                      </div>
                      <div className="admin-product-row__info">
                        <strong>{produto.nome}</strong>
                        <p>{produto.descricao}</p>
                        <div>
                          <span className="status-pill">
                            {produto.ativo ? 'ATIVO' : 'INATIVO'}
                          </span>
                          <span>{formatCurrency(Number(produto.preco))}</span>
                          {produto.quantidadePaginas && (
                            <span>{produto.quantidadePaginas} paginas</span>
                          )}
                        </div>
                      </div>
                      <button
                        className="compact-button outline-button"
                        type="button"
                        onClick={() => startEditingProduct(produto)}
                      >
                        <Pencil size={16} aria-hidden="true" />
                        Editar
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <form className="admin-product-form" onSubmit={handleCreateProduct}>
            <div className="admin-form-title">
              <div>
                <h3>{isEditing ? 'Editar produto' : 'Cadastrar produto'}</h3>
                <p>
                  {isEditing
                    ? 'Altere os dados desejados. PDF e capa so mudam se voce selecionar novos arquivos.'
                    : 'Preencha os dados e envie o PDF da apostila.'}
                </p>
              </div>
              {isEditing && (
                <button className="compact-button outline-button" type="button" onClick={resetProductEditor}>
                  Cancelar
                </button>
              )}
            </div>

            <label>
              Nome do produto
              <input
                name="nome"
                type="text"
                value={productForm.nome}
                onChange={updateProductField}
                placeholder="Rosas Classicas"
                maxLength="120"
                required
              />
            </label>

            <label>
              Descricao
              <textarea
                name="descricao"
                value={productForm.descricao}
                onChange={updateProductField}
                placeholder="Apostila digital com passo a passo para pintura em tecido."
                maxLength="1000"
                rows="5"
                required
              />
            </label>

            <div className="admin-form-grid">
              <label>
                Preco
                <input
                  name="preco"
                  type="number"
                  value={productForm.preco}
                  onChange={updateProductField}
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Tipo
                <select name="tipo" value={productForm.tipo} onChange={updateProductField} required>
                  <option value="APOSTILA">Apostila</option>
                  <option value="CURSO">Curso</option>
                </select>
              </label>
            </div>

            <div className="admin-upload-grid">
              <label
                className="file-dropzone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleFileDrop(event, 'arquivoPdf')}
              >
                <input
                  name="arquivoPdf"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => updateProductFile('arquivoPdf', event.target.files)}
                />
                <UploadCloud size={34} aria-hidden="true" />
                <strong>{isEditing ? 'Trocar PDF da apostila' : 'Arquivo PDF da apostila'}</strong>
                <span>
                  {isEditing
                    ? 'Opcional: selecione outro PDF para substituir o atual'
                    : 'Arraste o PDF aqui ou clique para selecionar'}
                </span>
                {productFiles.arquivoPdf ? (
                  <small>{productFiles.arquivoPdf.name}</small>
                ) : isEditing && (
                  <small>PDF atual sera mantido</small>
                )}
              </label>

              <label
                className="file-dropzone file-dropzone--cover"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleFileDrop(event, 'imagemCapa')}
              >
                <input
                  name="imagemCapa"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => updateProductFile('imagemCapa', event.target.files)}
                />
                {productCoverPreviewUrl ? (
                  <img src={productCoverPreviewUrl} alt="Previa da capa selecionada" />
                ) : (
                  <>
                    <ImageIcon size={34} aria-hidden="true" />
                    <strong>Imagem de capa</strong>
                    <span>Arraste a capa aqui ou clique para selecionar</span>
                  </>
                )}
                {productFiles.imagemCapa ? (
                  <small>{productFiles.imagemCapa.name}</small>
                ) : isEditing && (
                  <small>Capa atual sera mantida</small>
                )}
              </label>
            </div>

            <label className="checkbox-field">
              <input
                name="ativo"
                type="checkbox"
                checked={productForm.ativo}
                onChange={updateProductField}
              />
              Produto ativo no catalogo
            </label>

            <button className="primary-button inline-button" type="submit" disabled={isSavingProduct}>
              {isSavingProduct
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar alteracoes'
                  : 'Cadastrar produto'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  function renderProductPreviewModal() {
    if (!selectedProduct) {
      return null;
    }

    const quantidadePaginas = selectedProduct.quantidadePaginas ?? 1;
    const previewPages = Array.from(
      { length: Math.min(Math.max(quantidadePaginas - 1, 0), 6) },
      (_, index) => index + 2,
    );
    const hiddenPagesCount = Math.max(quantidadePaginas - 1 - previewPages.length, 0);

    return (
      <div
        className="product-preview-backdrop"
        role="presentation"
        onClick={() => setSelectedProduct(null)}
      >
        <section
          className="product-preview-modal"
          aria-label={`Previa da apostila ${selectedProduct.nome}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="summary-heading">
            <div className="summary-heading__title">
              <FileText size={25} aria-hidden="true" />
              <h2>{selectedProduct.nome}</h2>
            </div>
            <button
              className="summary-hide-button"
              type="button"
              aria-label="Fechar previa"
              onClick={() => setSelectedProduct(null)}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="product-preview-layout">
            <div
              className={
                selectedProduct.urlImagemCapa
                  ? 'book-cover book-cover--image product-preview-cover'
                  : `book-cover book-cover--${selectedProduct.cor} product-preview-cover`
              }
            >
              {selectedProduct.urlImagemCapa ? (
                <img
                  src={selectedProduct.urlImagemCapa}
                  alt={`Capa da apostila ${selectedProduct.nome}`}
                />
              ) : (
                <>
                  <span className="book-spiral" aria-hidden="true" />
                  <div className="book-title">
                    {selectedProduct.tema}
                    <small>Pintura em Tecido</small>
                  </div>
                  <div className="book-art" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                </>
              )}
              <span className="pdf-badge">PDF</span>
            </div>

            <div className="product-preview-info">
              <span className="status-pill">{quantidadePaginas} paginas</span>
              <strong>{selectedProduct.preco}</strong>
              <p>{selectedProduct.descricao}</p>
              <div className="product-preview-actions">
                <button
                  className="secondary-cart-button"
                  type="button"
                  onClick={() => {
                    handleAdicionarAoCarrinho(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  <ShoppingCart size={16} aria-hidden="true" />
                  Adicionar ao carrinho
                </button>
                <button
                  className="primary-button primary-button--small"
                  type="button"
                  onClick={() => {
                    handleComprarAgora(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  <CreditCard size={16} aria-hidden="true" />
                  Comprar agora
                </button>
              </div>
            </div>
          </div>

          <div className="preview-pages-section">
            <div>
              <h3>Previa das paginas</h3>
              <p>As paginas internas ficam borradas para proteger o conteudo da apostila.</p>
            </div>

            <div className="preview-pages-grid">
              <article className="preview-page preview-page--cover">
                <strong>Capa</strong>
                <span>Pagina 1</span>
              </article>
              {previewPages.map((pageNumber) => (
                <article className="preview-page preview-page--blurred" key={pageNumber}>
                  <strong>Pagina {pageNumber}</strong>
                  <span>{selectedProduct.nome}</span>
                </article>
              ))}
              {hiddenPagesCount > 0 && (
                <article className="preview-page preview-page--more">
                  <strong>+{hiddenPagesCount}</strong>
                  <span>paginas no PDF</span>
                </article>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderActivePage() {
    if (activePage === 'carrinho') {
      return renderCarrinho();
    }

    if (activePage === 'pedidos') {
      return renderPedidos();
    }

    if (activePage === 'downloads') {
      return renderDownloads();
    }

    if (activePage === 'perfil') {
      return renderPerfil();
    }

    if (activePage === 'admin-produtos') {
      return renderAdminProdutos();
    }

    return renderCatalogo();
  }

  if (usuarioLogado) {
    return (
      <main className="store-shell">
        <header className="store-header">
          <div className="store-brand">
            <div className="store-logo" aria-hidden="true">
              <div className="store-logo__flower">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div>
                <strong>Ivoneide</strong>
                <span>Pintura em Tecido</span>
                <small>Arte que transforma!</small>
              </div>
            </div>
          </div>

          <label className="store-search" aria-label="Buscar apostilas">
            <Search size={20} aria-hidden="true" />
            <input type="search" placeholder="Buscar apostilas e colecoes..." />
          </label>

          <div className="store-actions">
            <button
              className="cart-button"
              type="button"
              aria-label="Abrir carrinho"
              onClick={() => setActivePage('carrinho')}
            >
              <ShoppingCart size={28} aria-hidden="true" />
              {totalItens > 0 && <span className="cart-button__badge">{totalItens}</span>}
            </button>

            <button
              className="store-user store-user--button"
              type="button"
              onClick={() => setActivePage('perfil')}
            >
              <div className="avatar" aria-hidden="true">
                {usuarioLogado.nome.slice(0, 1)}
              </div>
              <div>
                <strong>{usuarioLogado.nome}</strong>
                <span>Minha conta</span>
              </div>
            </button>

            <button className="account-button" type="button" onClick={handleLogout}>
              <LogOut size={15} aria-hidden="true" />
              Sair
            </button>
          </div>
        </header>

        <section className="store-layout">
          <aside className="store-sidebar" aria-label="Menu da loja">
            <button
              className={activePage === 'produtos' ? 'sidebar-link sidebar-link--active' : 'sidebar-link'}
              type="button"
              onClick={() => setActivePage('produtos')}
            >
              <ShoppingBag size={23} aria-hidden="true" />
              Produtos
            </button>
            <button
              className={activePage === 'carrinho' ? 'sidebar-link sidebar-link--active' : 'sidebar-link'}
              type="button"
              onClick={() => setActivePage('carrinho')}
            >
              <ShoppingCart size={23} aria-hidden="true" />
              Carrinho
            </button>
            <button
              className={activePage === 'pedidos' ? 'sidebar-link sidebar-link--active' : 'sidebar-link'}
              type="button"
              onClick={() => setActivePage('pedidos')}
            >
              <ClipboardList size={23} aria-hidden="true" />
              Meus pedidos
            </button>
            <button
              className={activePage === 'downloads' ? 'sidebar-link sidebar-link--active' : 'sidebar-link'}
              type="button"
              onClick={() => setActivePage('downloads')}
            >
              <Download size={23} aria-hidden="true" />
              Downloads
            </button>
            {usuarioLogado.role === 'ADMIN' && (
              <button
                className={
                  activePage === 'admin-produtos'
                    ? 'sidebar-link sidebar-link--active'
                    : 'sidebar-link'
                }
                type="button"
                onClick={() => {
                  setActivePage('admin-produtos');
                  carregarAdminProdutos(normalizeToken(token || localStorage.getItem('ivoneideToken')));
                }}
              >
                <PackageCheck size={23} aria-hidden="true" />
                Admin produtos
              </button>
            )}

            <div className="love-note">
              <Heart size={28} aria-hidden="true" />
              <strong>Feito com amor para voce!</strong>
              <div className="note-flower" aria-hidden="true" />
            </div>

            <div className="help-card">
              <strong>Precisa de ajuda?</strong>
              <p>Fale conosco pelo WhatsApp</p>
              <span>
                <MessageCircle size={18} aria-hidden="true" />
                (81) 9 9999-1234
              </span>
            </div>
          </aside>

          {renderActivePage()}
        </section>

        {isQuickSummaryOpen && (
          <div className="quick-summary-backdrop" role="presentation">
            <aside className="quick-summary-panel" aria-label="Resumo rapido do carrinho">
              <div className="summary-heading">
                <div className="summary-heading__title">
                  <FileText size={25} aria-hidden="true" />
                  <h2>Resumo do carrinho</h2>
                </div>
                <button
                  className="summary-hide-button"
                  type="button"
                  aria-label="Fechar resumo"
                  onClick={() => setIsQuickSummaryOpen(false)}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="summary-order-title">
                <div>
                  <strong>Pedido em montagem</strong>
                  <p>Iniciado em {formatDate(pedidoCriadoEm)}</p>
                </div>
                <span className="status-pill">CRIADO</span>
              </div>

              <div className="summary-divider" />

              <strong className="summary-section-title">
                Itens do carrinho ({totalItens})
              </strong>
              <div className="summary-items">
                {pedidoItens.map((produto) => (
                  <div className="summary-item" key={produto.id}>
                    {renderProductThumbnail(produto)}
                    <div>
                      <strong>{produto.nome}</strong>
                      <p>Apostila Digital (PDF)</p>
                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() => updateQuantidade(produto.id, -1)}
                          aria-label={`Diminuir quantidade de ${produto.nome}`}
                        >
                          -
                        </button>
                        <span>{produto.quantidade}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantidade(produto.id, 1)}
                          aria-label={`Aumentar quantidade de ${produto.nome}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span>{formatCurrency(produto.precoValor * produto.quantidade)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-totals">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotalPedido)}</strong>
                </div>
                <div>
                  <span>Desconto</span>
                  <strong>- {formatCurrency(0)}</strong>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <strong>{formatCurrency(subtotalPedido)}</strong>
                </div>
              </div>

              <button
                className="download-button"
                type="button"
                onClick={() => {
                  setActivePage('carrinho');
                  setIsQuickSummaryOpen(false);
                }}
              >
                <ShoppingCart size={18} aria-hidden="true" />
                Ir para o carrinho
              </button>
              <button
                className="receipt-button"
                type="button"
                onClick={finalizarCompra}
                disabled={isFinalizing || pedidoItens.length === 0}
              >
                <CreditCard size={18} aria-hidden="true" />
                {isFinalizing ? 'Finalizando...' : 'Finalizar compra'}
              </button>
            </aside>
          </div>
        )}

        {renderProductPreviewModal()}
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="brand-panel" aria-label="Apresentacao da loja">
        <div className="brand-panel__header">
          <div className="brand-mark" aria-hidden="true">
            IP
          </div>
          <div>
            <p className="eyebrow">Apostilas digitais</p>
            <h1>Ivoneide Pintura em Tecido</h1>
          </div>
        </div>

        <p className="brand-panel__text">
          Uma loja delicada para aprender pintura em tecido com apostilas em PDF,
          recibos organizados e downloads liberados apos a confirmacao da compra.
        </p>

        <div className="catalog-preview" aria-label="Previa de produtos">
          {produtosPreview.slice(0, 3).map((produto) => (
            <article className="product-card" key={produto.id}>
              <div className={`product-cover product-cover--${produto.cor}`}>
                <span>{produto.tema}</span>
              </div>
              <div>
                <h2>{produto.nome}</h2>
                <p>{produto.preco}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="order-preview">
          <div>
            <span className="status-pill">PAGO</span>
            <h2>Pedido #1048</h2>
            <p>Downloads em PDF liberados para a cliente.</p>
          </div>
          <button className="ghost-button" type="button">
            Ver recibo
          </button>
        </div>
      </section>

      <section className="auth-panel" aria-label="Login e cadastro">
        <div className="auth-card">
          <p className="eyebrow">Minha conta</p>
          <h2>{greeting}</h2>

          <div className="tabs" role="tablist" aria-label="Escolha login ou cadastro">
            <button
              className={isLogin ? 'tab tab--active' : 'tab'}
              type="button"
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={!isLogin ? 'tab tab--active' : 'tab'}
              type="button"
              onClick={() => setActiveTab('cadastro')}
            >
              Cadastro
            </button>
          </div>

          {message && (
            <div className={`feedback feedback--${message.type}`}>
              {message.text}
            </div>
          )}

          {isLogin ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                E-mail
                <input
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={updateLoginField}
                  placeholder="cliente@email.com"
                  required
                />
              </label>

              <label>
                Senha
                <input
                  name="senha"
                  type="password"
                  value={loginForm.senha}
                  onChange={updateLoginField}
                  placeholder="Sua senha"
                  minLength="8"
                  required
                />
              </label>

              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <label>
                Nome
                <input
                  name="nome"
                  type="text"
                  value={registerForm.nome}
                  onChange={updateRegisterField}
                  placeholder="Seu nome completo"
                  required
                />
              </label>

              <label>
                E-mail
                <input
                  name="email"
                  type="email"
                  value={registerForm.email}
                  onChange={updateRegisterField}
                  placeholder="cliente@email.com"
                  required
                />
              </label>

              <label>
                Senha
                <input
                  name="senha"
                  type="password"
                  value={registerForm.senha}
                  onChange={updateRegisterField}
                  placeholder="Minimo 8 caracteres"
                  minLength="8"
                  required
                />
              </label>

              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Cadastrando...' : 'Criar conta'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
