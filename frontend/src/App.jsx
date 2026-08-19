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
  atualizarMeuPerfil,
  atualizarProduto,
  atualizarStatusPedido,
  cadastrarUsuario,
  criarPedido,
  criarProduto,
  fazerLogin,
  listarDownloadsPedido,
  listarMeusPedidos,
  listarPedidosAdmin,
  listarProdutos,
  listarProdutosAtivos,
  redefinirSenha,
  simularPagamentoPedido,
  solicitarRecuperacaoSenha,
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

const initialRecoveryForm = {
  email: '',
  codigo: '',
  novaSenha: '',
};

const initialProfilePasswordForm = {
  senhaAtual: '',
  novaSenha: '',
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

function getOrderStatusInfo(status) {
  const statusMap = {
    CRIADO: {
      label: 'Criado',
      className: 'status-pill status-pill--created',
      description: 'Aguardando confirmacao de pagamento.',
    },
    AGUARDANDO_PAGAMENTO: {
      label: 'Aguardando pagamento',
      className: 'status-pill status-pill--created',
      description: 'Aguardando confirmacao de pagamento.',
    },
    PAGO: {
      label: 'Pago',
      className: 'status-pill status-pill--paid',
      description: 'Pagamento confirmado. Downloads liberados.',
    },
    CANCELADO: {
      label: 'Cancelado',
      className: 'status-pill status-pill--canceled',
      description: 'Pedido cancelado.',
    },
    EXPIRADO: {
      label: 'Expirado',
      className: 'status-pill status-pill--expired',
      description: 'Prazo de pagamento expirado.',
    },
  };

  return statusMap[status] ?? {
    label: status,
    className: 'status-pill',
    description: 'Status do pedido.',
  };
}

function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [authMode, setAuthMode] = useState('access');
  const [activePage, setActivePage] = useState('produtos');
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [recoveryForm, setRecoveryForm] = useState(initialRecoveryForm);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [perfilForm, setPerfilForm] = useState(null);
  const [perfilSenhaForm, setPerfilSenhaForm] = useState(initialProfilePasswordForm);
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
  const [isPayingOrderId, setIsPayingOrderId] = useState(null);
  const [isLoadingDownloadsOrderId, setIsLoadingDownloadsOrderId] = useState(null);
  const [downloadsByOrderId, setDownloadsByOrderId] = useState({});
  const [adminOrders, setAdminOrders] = useState([]);
  const [isAdminOrdersLoading, setIsAdminOrdersLoading] = useState(false);
  const [updatingOrderStatusId, setUpdatingOrderStatusId] = useState(null);
  const [isQuickSummaryOpen, setIsQuickSummaryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('relevantes');
  const [priceFilter, setPriceFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [orderStatusFilter, setOrderStatusFilter] = useState('todos');
  const [adminOrderStatusFilter, setAdminOrderStatusFilter] = useState('todos');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
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

  const authTitle = useMemo(() => {
    if (authMode === 'recover') {
      return 'Recupere o acesso da sua conta.';
    }

    if (authMode === 'reset') {
      return 'Crie uma nova senha segura.';
    }

    return greeting;
  }, [authMode, greeting]);

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

  const produtosVisiveis = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredProducts = normalizedSearch
      ? produtosCatalogo.filter((produto) =>
          `${produto.nome} ${produto.descricao}`.toLowerCase().includes(normalizedSearch),
        )
      : produtosCatalogo;

    const filteredByType = typeFilter === 'todos'
      ? filteredProducts
      : filteredProducts.filter((produto) => produto.tipo === typeFilter);

    const filteredByPrice = filteredByType.filter((produto) => {
      if (priceFilter === 'ate-25') {
        return produto.precoValor <= 25;
      }

      if (priceFilter === '25-50') {
        return produto.precoValor > 25 && produto.precoValor <= 50;
      }

      if (priceFilter === 'acima-50') {
        return produto.precoValor > 50;
      }

      return true;
    });

    return [...filteredByPrice].sort((firstProduct, secondProduct) => {
      if (sortOption === 'menor-preco') {
        return firstProduct.precoValor - secondProduct.precoValor;
      }

      if (sortOption === 'maior-preco') {
        return secondProduct.precoValor - firstProduct.precoValor;
      }

      if (sortOption === 'nome') {
        return firstProduct.nome.localeCompare(secondProduct.nome, 'pt-BR');
      }

      return 0;
    });
  }, [priceFilter, produtosCatalogo, searchTerm, sortOption, typeFilter]);

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

  const carregarPedidosAdmin = useCallback(async (authToken) => {
    if (!authToken) {
      return;
    }

    setIsAdminOrdersLoading(true);

    try {
      const data = await listarPedidosAdmin(authToken);
      setAdminOrders(data ?? []);
    } catch (error) {
      setPageMessage({ type: 'error', text: error.message });
    } finally {
      setIsAdminOrdersLoading(false);
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

  function updateRecoveryField(event) {
    const { name, value } = event.target;
    setRecoveryForm((current) => ({ ...current, [name]: value }));
  }

  function updatePerfilField(event) {
    const { name, value } = event.target;
    setPerfilForm((current) => ({ ...current, [name]: value }));
  }

  function updatePerfilSenhaField(event) {
    const { name, value } = event.target;
    setPerfilSenhaForm((current) => ({ ...current, [name]: value }));
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

  function updateOrderInList(updatedOrder) {
    setPedidos((current) =>
      current.map((pedido) => (pedido.id === updatedOrder.id ? updatedOrder : pedido)),
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

  async function carregarDownloadsPedido(orderId) {
    const authToken = normalizeToken(token || localStorage.getItem('ivoneideToken'));

    if (!authToken) {
      handleExpiredSession();
      return;
    }

    setIsLoadingDownloadsOrderId(orderId);

    try {
      const downloads = await listarDownloadsPedido(authToken, orderId);
      setDownloadsByOrderId((current) => ({
        ...current,
        [orderId]: downloads ?? [],
      }));
    } catch (error) {
      if (error.status === 401) {
        handleExpiredSession();
        return;
      }

      setPageMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoadingDownloadsOrderId(null);
    }
  }

  async function handleSimularPagamento(orderId) {
    const authToken = normalizeToken(token || localStorage.getItem('ivoneideToken'));

    if (!authToken) {
      handleExpiredSession();
      return;
    }

    setIsPayingOrderId(orderId);
    setPageMessage(null);

    try {
      const updatedOrder = await simularPagamentoPedido(authToken, orderId);
      updateOrderInList(updatedOrder);
      setExpandedOrderId(updatedOrder.id);
      await carregarDownloadsPedido(updatedOrder.id);
      setPageMessage({
        type: 'success',
        text: 'Pagamento simulado aprovado. Downloads liberados.',
      });
    } catch (error) {
      if (error.status === 401) {
        handleExpiredSession();
        return;
      }

      setPageMessage({ type: 'error', text: error.message });
    } finally {
      setIsPayingOrderId(null);
    }
  }

  async function handleAtualizarStatusPedido(orderId, status) {
    const authToken = normalizeToken(token || localStorage.getItem('ivoneideToken'));

    if (!authToken) {
      handleExpiredSession();
      return;
    }

    setUpdatingOrderStatusId(orderId);
    setPageMessage(null);

    try {
      const updatedOrder = await atualizarStatusPedido(authToken, orderId, status);
      setAdminOrders((current) =>
        current.map((pedido) => (pedido.id === updatedOrder.id ? updatedOrder : pedido)),
      );
      updateOrderInList(updatedOrder);
      setPageMessage({
        type: 'success',
        text: 'Status do pedido atualizado com sucesso.',
      });
    } catch (error) {
      if (error.status === 401) {
        handleExpiredSession();
        return;
      }

      setPageMessage({ type: 'error', text: error.message });
    } finally {
      setUpdatingOrderStatusId(null);
    }
  }

  function openDownload(url) {
    const downloadUrl = resolveAssetUrl(url);

    if (!downloadUrl) {
      return;
    }

    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
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

  async function handlePasswordRecovery(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setRecoveryCode('');

    try {
      const data = await solicitarRecuperacaoSenha({ email: recoveryForm.email });
      setRecoveryCode(data.codigoTeste ?? '');
      setRecoveryForm((current) => ({
        ...current,
        codigo: data.codigoTeste ?? current.codigo,
      }));
      setAuthMode('reset');
      setMessage({
        type: 'success',
        text: data.codigoTeste
          ? 'Codigo gerado com sucesso. Use o codigo exibido abaixo para testar.'
          : 'Se este e-mail existir, enviaremos um codigo de recuperacao.',
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordReset(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await redefinirSenha(recoveryForm);
      setLoginForm({
        email: recoveryForm.email,
        senha: '',
      });
      setRecoveryForm(initialRecoveryForm);
      setRecoveryCode('');
      setAuthMode('access');
      setActiveTab('login');
      setMessage({
        type: 'success',
        text: 'Senha redefinida com sucesso. Entre com sua nova senha.',
      });
    } catch {
      setMessage({
        type: 'error',
        text: 'Codigo invalido, expirado ou e-mail incorreto.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('ivoneideToken');
    setUsuarioLogado(null);
    setPerfilForm(null);
    setPerfilSenhaForm(initialProfilePasswordForm);
    setToken('');
    setMessage(null);
    setPageMessage(null);
    setLoginForm(initialLogin);
    setPedidoItens([]);
    setPedidoCriadoEm(null);
    setPedidos([]);
    setExpandedOrderId(null);
    setDownloadsByOrderId({});
    setActivePage('produtos');
    setIsQuickSummaryOpen(false);
    setOrderStatusFilter('todos');
    setAdminOrderStatusFilter('todos');
  }

  function handleExpiredSession() {
    localStorage.removeItem('ivoneideToken');
    setUsuarioLogado(null);
    setPerfilForm(null);
    setPerfilSenhaForm(initialProfilePasswordForm);
    setToken('');
    setPedidoItens([]);
    setPedidoCriadoEm(null);
    setPedidos([]);
    setExpandedOrderId(null);
    setDownloadsByOrderId({});
    setEditingProduct(null);
    setProductForm(initialProductForm);
    setProductFiles(initialProductFiles);
    setActiveTab('login');
    setActivePage('produtos');
    setOrderStatusFilter('todos');
    setAdminOrderStatusFilter('todos');
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

    const authToken = normalizeToken(token || localStorage.getItem('ivoneideToken'));

    if (!authToken) {
      handleExpiredSession();
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
      const order = await criarPedido(authToken, payload);
      setPedidos((current) => [order, ...current]);
      setExpandedOrderId(order.id);
      limparCarrinho();
      setActivePage('pedidos');
      setPageMessage({
        type: 'success',
        text: `Pedido criado com ${paymentMethod}. Agora ele aguarda confirmacao de pagamento.`,
      });
    } catch (error) {
      if (error.status === 401) {
        handleExpiredSession();
        return;
      }

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

  async function salvarPerfil(event) {
    event.preventDefault();
    setPageMessage(null);

    const authToken = normalizeToken(token || localStorage.getItem('ivoneideToken'));

    if (!authToken) {
      handleExpiredSession();
      return;
    }

    const wantsPasswordChange = perfilSenhaForm.senhaAtual || perfilSenhaForm.novaSenha;

    if (wantsPasswordChange && (!perfilSenhaForm.senhaAtual || !perfilSenhaForm.novaSenha)) {
      setPageMessage({
        type: 'error',
        text: 'Para trocar a senha, informe a senha atual e a nova senha.',
      });
      return;
    }

    try {
      const data = await atualizarMeuPerfil(authToken, {
        ...perfilForm,
        ...(wantsPasswordChange ? perfilSenhaForm : {}),
      });
      const nextToken = normalizeToken(data.token);
      const updatedUser = {
        id: data.usuarioId,
        nome: data.nome,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem('ivoneideToken', nextToken);
      setToken(nextToken);
      setUsuarioLogado(updatedUser);
      setPerfilForm({ nome: updatedUser.nome, email: updatedUser.email });
      setPerfilSenhaForm(initialProfilePasswordForm);
      setPageMessage({
        type: 'success',
        text: wantsPasswordChange
          ? 'Perfil e senha atualizados com sucesso.'
          : 'Perfil atualizado com sucesso.',
      });
    } catch (error) {
      if (error.status === 401) {
        setPageMessage({
          type: 'error',
          text: 'Senha atual incorreta. Confira a senha e tente novamente.',
        });
      } else {
        setPageMessage({ type: 'error', text: error.message });
      }
    }
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
            <select
              aria-label="Ordenar apostilas"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="relevantes">Mais relevantes</option>
              <option value="menor-preco">Menor preco</option>
              <option value="maior-preco">Maior preco</option>
              <option value="nome">Nome</option>
            </select>
            <button className="view-button view-button--active" type="button" aria-label="Grade">
              <Grid2X2 size={20} aria-hidden="true" />
            </button>
            <button className="view-button" type="button" aria-label="Lista">
              <List size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="filter-bar" aria-label="Filtros do catalogo">
          <label>
            Tipo
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="APOSTILA">Apostilas</option>
              <option value="CURSO">Cursos</option>
            </select>
          </label>
          <label>
            Preco
            <select
              value={priceFilter}
              onChange={(event) => setPriceFilter(event.target.value)}
            >
              <option value="todos">Todos os precos</option>
              <option value="ate-25">Ate R$ 25,00</option>
              <option value="25-50">R$ 25,01 ate R$ 50,00</option>
              <option value="acima-50">Acima de R$ 50,00</option>
            </select>
          </label>
          <button
            className="outline-button"
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSortOption('relevantes');
              setTypeFilter('todos');
              setPriceFilter('todos');
            }}
          >
            Limpar filtros
          </button>
        </div>

        {pageMessage && (
          <div className={`feedback feedback--${pageMessage.type}`}>
            {pageMessage.text}
          </div>
        )}

        <div className="store-grid">
          {produtosVisiveis.map((produto) => (
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

        {!isProductsLoading && !productsMessage && produtosCatalogo.length > 0 && produtosVisiveis.length === 0 && (
          <div className="empty-page compact-empty">
            <Search size={42} aria-hidden="true" />
            <strong>Nenhuma apostila encontrada</strong>
            <p>Tente buscar por outro nome ou descricao.</p>
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
          <span className="status-pill">
            {pedidoItens.length ? 'AGUARDANDO PAGAMENTO' : 'VAZIO'}
          </span>
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
                <strong>Finalizacao da compra</strong>
                <p>Pedido iniciado em {formatDate(pedidoCriadoEm)}</p>
              </div>
              <div className="summary-divider" />
              <div className="checkout-customer">
                <span>Comprador</span>
                <strong>{usuarioLogado.nome}</strong>
                <p>{usuarioLogado.email}</p>
              </div>
              <div className="checkout-methods">
                <span>Forma de pagamento</span>
                <div>
                  {['PIX', 'CARTAO', 'BOLETO'].map((method) => (
                    <button
                      className={paymentMethod === method ? 'method-button method-button--active' : 'method-button'}
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method === 'CARTAO' ? 'Cartao' : method.charAt(0) + method.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
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
                  <strong>Status atual: Aguardando pagamento</strong>
                  <p>O pedido sera salvo no backend e ficara aguardando confirmacao.</p>
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

  function renderDownloadFiles(pedido) {
    const downloads = downloadsByOrderId[pedido.id] ?? [];
    const isLoadingDownloads = isLoadingDownloadsOrderId === pedido.id;

    if (pedido.status !== 'PAGO') {
      return (
        <div className="download-lock">
          <FileText size={22} aria-hidden="true" />
          <div>
            <strong>Downloads bloqueados</strong>
            <p>Os PDFs serao liberados quando o pagamento for confirmado.</p>
          </div>
        </div>
      );
    }

    if (downloads.length === 0) {
      return (
        <button
          className="download-button compact-button"
          type="button"
          onClick={() => carregarDownloadsPedido(pedido.id)}
          disabled={isLoadingDownloads}
        >
          <Download size={17} aria-hidden="true" />
          {isLoadingDownloads ? 'Buscando arquivos...' : 'Carregar downloads'}
        </button>
      );
    }

    return (
      <div className="download-files-list">
        {downloads.map((download) => (
          <button
            className="download-file-button"
            type="button"
            key={`${pedido.id}-${download.produtoId}`}
            onClick={() => openDownload(download.urlPdf)}
          >
            <Download size={17} aria-hidden="true" />
            <span>{download.produtoNome}</span>
          </button>
        ))}
      </div>
    );
  }

  function renderPedidos() {
    const pedidosFiltrados = orderStatusFilter === 'todos'
      ? pedidos
      : pedidos.filter((pedido) => pedido.status === orderStatusFilter);

    return (
      <section className="store-content page-card" aria-label="Meus pedidos">
        <div className="store-title">
          <div>
            <h2>Meus pedidos</h2>
            <p>Acompanhe pedidos criados, pagos, cancelados ou expirados.</p>
          </div>
          <select
            className="status-filter"
            aria-label="Filtrar pedidos por status"
            value={orderStatusFilter}
            onChange={(event) => setOrderStatusFilter(event.target.value)}
          >
            <option value="todos">Todos os status</option>
            <option value="CRIADO">Criados</option>
            <option value="AGUARDANDO_PAGAMENTO">Aguardando pagamento</option>
            <option value="PAGO">Pagos</option>
            <option value="CANCELADO">Cancelados</option>
            <option value="EXPIRADO">Expirados</option>
          </select>
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
        ) : pedidosFiltrados.length === 0 ? (
          <div className="empty-page compact-empty">
            <ClipboardList size={42} aria-hidden="true" />
            <strong>Nenhum pedido nesse status</strong>
            <p>Troque o filtro para ver outros pedidos.</p>
          </div>
        ) : (
          <div className="orders-list">
            {pedidosFiltrados.map((pedido) => {
              const isExpanded = expandedOrderId === pedido.id;
              const totalPedidoItens = pedido.itens?.reduce(
                (total, item) => total + item.quantidade,
                0,
              ) ?? 0;
              const statusInfo = getOrderStatusInfo(pedido.status);

              return (
                <article className="order-card order-card--details" key={pedido.id}>
                  <button
                    className="order-card__header"
                    type="button"
                    onClick={() => setExpandedOrderId(isExpanded ? null : pedido.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="order-card__main">
                      <span className="order-number">Pedido #{pedido.id}</span>
                      <strong>{formatCurrency(Number(pedido.valorTotal))}</strong>
                      <p>{statusInfo.description}</p>
                    </div>
                    <div className="order-card__meta">
                      <span>Criado em</span>
                      <strong>{formatDate(new Date(pedido.criadoEm))}</strong>
                    </div>
                    <div className="order-card__meta">
                      <span>Itens</span>
                      <strong>
                        {totalPedidoItens} {totalPedidoItens === 1 ? 'item' : 'itens'}
                      </strong>
                    </div>
                    <span className={statusInfo.className}>{statusInfo.label}</span>
                    <span className="order-card__toggle">
                      {isExpanded ? 'Fechar detalhes' : 'Ver detalhes'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="order-details">
                      <div className="order-details__top">
                        <div>
                          <strong>Itens do pedido</strong>
                          <p>Confira as apostilas, quantidades e valores deste pedido.</p>
                        </div>
                        <span className={statusInfo.className}>{statusInfo.label}</span>
                      </div>
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
                        <div>
                          <span>Subtotal</span>
                          <strong>{formatCurrency(Number(pedido.valorTotal))}</strong>
                        </div>
                        <div>
                          <span>Desconto</span>
                          <strong>- {formatCurrency(0)}</strong>
                        </div>
                        <div className="order-details__total">
                          <span>Total do pedido</span>
                          <strong>{formatCurrency(Number(pedido.valorTotal))}</strong>
                        </div>
                      </div>

                      <div className="order-actions-panel">
                        {pedido.status === 'PAGO' ? (
                          renderDownloadFiles(pedido)
                        ) : (
                          <button
                            className="download-button compact-button"
                            type="button"
                            onClick={() => handleSimularPagamento(pedido.id)}
                            disabled={isPayingOrderId === pedido.id}
                          >
                            <CreditCard size={17} aria-hidden="true" />
                            {isPayingOrderId === pedido.id
                              ? 'Confirmando pagamento...'
                              : 'Pagar agora (simulado)'}
                          </button>
                        )}
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
          <div className="downloads-page-list">
            {paidOrders.map((pedido) => {
              const statusInfo = getOrderStatusInfo(pedido.status);
              const totalPedidoItens = pedido.itens?.reduce(
                (total, item) => total + item.quantidade,
                0,
              ) ?? 0;

              return (
                <article className="download-order-card" key={pedido.id}>
                  <div className="download-order-card__header">
                    <div>
                      <span className="order-number">Pedido #{pedido.id}</span>
                      <strong>{totalPedidoItens} apostila(s) liberada(s)</strong>
                      <p>Compra realizada em {formatDate(new Date(pedido.criadoEm))}</p>
                    </div>
                    <span className={statusInfo.className}>{statusInfo.label}</span>
                  </div>

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
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="download-order-card__footer">
                    <div>
                      <span>Total pago</span>
                      <strong>{formatCurrency(Number(pedido.valorTotal))}</strong>
                    </div>
                    {renderDownloadFiles(pedido)}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  function renderAdminPedidos() {
    if (usuarioLogado.role !== 'ADMIN') {
      return renderPedidos();
    }

    const totalPedidos = adminOrders.length;
    const totalVendido = adminOrders.reduce(
      (total, pedido) => total + Number(pedido.valorTotal ?? 0),
      0,
    );
    const pedidosPagos = adminOrders.filter((pedido) => pedido.status === 'PAGO').length;
    const pedidosAdminFiltrados = adminOrderStatusFilter === 'todos'
      ? adminOrders
      : adminOrders.filter((pedido) => pedido.status === adminOrderStatusFilter);

    return (
      <section className="store-content page-card" aria-label="Administrar pedidos">
        <div className="store-title">
          <div>
            <h2>Admin pedidos</h2>
            <p>Acompanhe clientes, itens, valores e status dos pedidos.</p>
          </div>
          <div className="admin-title-actions">
            <select
              className="status-filter"
              aria-label="Filtrar pedidos admin por status"
              value={adminOrderStatusFilter}
              onChange={(event) => setAdminOrderStatusFilter(event.target.value)}
            >
              <option value="todos">Todos os status</option>
              <option value="CRIADO">Criados</option>
              <option value="AGUARDANDO_PAGAMENTO">Aguardando pagamento</option>
              <option value="PAGO">Pagos</option>
              <option value="CANCELADO">Cancelados</option>
              <option value="EXPIRADO">Expirados</option>
            </select>
            <span className="status-pill">ADMIN</span>
          </div>
        </div>

        {pageMessage && (
          <div className={`feedback feedback--${pageMessage.type}`}>
            {pageMessage.text}
          </div>
        )}

        {!isAdminOrdersLoading && adminOrders.length > 0 && (
          <div className="orders-overview">
            <article>
              <span>Pedidos</span>
              <strong>{totalPedidos}</strong>
            </article>
            <article>
              <span>Pagos</span>
              <strong>{pedidosPagos}</strong>
            </article>
            <article>
              <span>Total vendido</span>
              <strong>{formatCurrency(totalVendido)}</strong>
            </article>
          </div>
        )}

        {isAdminOrdersLoading ? (
          <div className="empty-page compact-empty">
            <ClipboardList size={42} aria-hidden="true" />
            <strong>Buscando pedidos...</strong>
            <p>Estamos carregando todos os pedidos da loja.</p>
          </div>
        ) : adminOrders.length === 0 ? (
          <div className="empty-page compact-empty">
            <ClipboardList size={42} aria-hidden="true" />
            <strong>Nenhum pedido encontrado</strong>
            <p>Os pedidos dos clientes aparecerao aqui.</p>
          </div>
        ) : pedidosAdminFiltrados.length === 0 ? (
          <div className="empty-page compact-empty">
            <ClipboardList size={42} aria-hidden="true" />
            <strong>Nenhum pedido nesse status</strong>
            <p>Troque o filtro para acompanhar outros pedidos.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {pedidosAdminFiltrados.map((pedido) => {
              const statusInfo = getOrderStatusInfo(pedido.status);
              const totalPedidoItens = pedido.itens?.reduce(
                (total, item) => total + item.quantidade,
                0,
              ) ?? 0;

              return (
                <article className="admin-order-card" key={pedido.id}>
                  <div className="admin-order-card__header">
                    <div>
                      <span className="order-number">Pedido #{pedido.id}</span>
                      <strong>{pedido.usuarioNome}</strong>
                      <p>
                        {formatDate(new Date(pedido.criadoEm))} - {totalPedidoItens}{' '}
                        {totalPedidoItens === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                    <div className="admin-order-card__status">
                      <span className={statusInfo.className}>{statusInfo.label}</span>
                      <strong>{formatCurrency(Number(pedido.valorTotal))}</strong>
                    </div>
                    <label>
                      Status
                      <select
                        value={pedido.status}
                        onChange={(event) => handleAtualizarStatusPedido(pedido.id, event.target.value)}
                        disabled={updatingOrderStatusId === pedido.id}
                      >
                        <option value="CRIADO">Criado</option>
                        <option value="AGUARDANDO_PAGAMENTO">Aguardando pagamento</option>
                        <option value="PAGO">Pago</option>
                        <option value="CANCELADO">Cancelado</option>
                        <option value="EXPIRADO">Expirado</option>
                      </select>
                    </label>
                  </div>

                  <div className="order-items-list">
                    {pedido.itens?.map((item) => (
                      <div className="order-item-row" key={item.id ?? item.produtoId}>
                        {renderOrderItemThumbnail(item)}
                        <div>
                          <strong>{item.produtoNome}</strong>
                          <p>{item.produtoDescricao || 'Apostila digital em PDF.'}</p>
                        </div>
                        <div className="order-item-row__values">
                          <span>Qtd. {item.quantidade}</span>
                          <strong>{formatCurrency(Number(item.subtotal))}</strong>
                          <small>{formatCurrency(Number(item.precoUnitario))} cada</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
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
            <div className="profile-form-section">
              <strong>Dados pessoais</strong>
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
            </div>

            <div className="profile-form-section">
              <strong>Trocar senha</strong>
              <label>
                Senha atual
                <input
                  name="senhaAtual"
                  type="password"
                  value={perfilSenhaForm.senhaAtual}
                  onChange={updatePerfilSenhaField}
                  placeholder="Digite sua senha atual"
                  minLength="8"
                />
              </label>
              <label>
                Nova senha
                <input
                  name="novaSenha"
                  type="password"
                  value={perfilSenhaForm.novaSenha}
                  onChange={updatePerfilSenhaField}
                  placeholder="Minimo 8 caracteres"
                  minLength="8"
                />
              </label>
            </div>

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

    if (activePage === 'admin-pedidos') {
      return renderAdminPedidos();
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
            <input
              type="search"
              placeholder="Buscar apostilas e colecoes..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
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
              <>
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
                <button
                  className={
                    activePage === 'admin-pedidos'
                      ? 'sidebar-link sidebar-link--active'
                      : 'sidebar-link'
                  }
                  type="button"
                  onClick={() => {
                    setActivePage('admin-pedidos');
                    carregarPedidosAdmin(normalizeToken(token || localStorage.getItem('ivoneideToken')));
                  }}
                >
                  <ClipboardList size={23} aria-hidden="true" />
                  Admin pedidos
                </button>
              </>
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
                <span className="status-pill">AGUARDANDO</span>
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
          <h2>{authTitle}</h2>

          {authMode === 'access' && (
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
          )}

          {message && (
            <div className={`feedback feedback--${message.type}`}>
              {message.text}
            </div>
          )}

          {authMode === 'recover' && (
            <form className="auth-form" onSubmit={handlePasswordRecovery}>
              <label>
                E-mail cadastrado
                <input
                  name="email"
                  type="email"
                  value={recoveryForm.email}
                  onChange={updateRecoveryField}
                  placeholder="cliente@email.com"
                  required
                />
              </label>

              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Gerando codigo...' : 'Gerar codigo de recuperacao'}
              </button>
              <button
                className="auth-link-button"
                type="button"
                onClick={() => {
                  setAuthMode('access');
                  setMessage(null);
                }}
              >
                Voltar para login
              </button>
            </form>
          )}

          {authMode === 'reset' && (
            <form className="auth-form" onSubmit={handlePasswordReset}>
              {recoveryCode && (
                <div className="test-code-box">
                  <span>Codigo para teste</span>
                  <strong>{recoveryCode}</strong>
                </div>
              )}

              <label>
                E-mail cadastrado
                <input
                  name="email"
                  type="email"
                  value={recoveryForm.email}
                  onChange={updateRecoveryField}
                  placeholder="cliente@email.com"
                  required
                />
              </label>

              <label>
                Codigo
                <input
                  name="codigo"
                  type="text"
                  value={recoveryForm.codigo}
                  onChange={updateRecoveryField}
                  placeholder="000000"
                  inputMode="numeric"
                  required
                />
              </label>

              <label>
                Nova senha
                <input
                  name="novaSenha"
                  type="password"
                  value={recoveryForm.novaSenha}
                  onChange={updateRecoveryField}
                  placeholder="Minimo 8 caracteres"
                  minLength="8"
                  required
                />
              </label>

              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
              </button>
              <button
                className="auth-link-button"
                type="button"
                onClick={() => {
                  setAuthMode('recover');
                  setMessage(null);
                }}
              >
                Gerar outro codigo
              </button>
            </form>
          )}

          {authMode === 'access' && isLogin && (
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
              <button
                className="auth-link-button"
                type="button"
                onClick={() => {
                  setRecoveryForm((current) => ({
                    ...current,
                    email: loginForm.email,
                  }));
                  setAuthMode('recover');
                  setMessage(null);
                }}
              >
                Esqueci minha senha
              </button>
            </form>
          )}

          {authMode === 'access' && !isLogin && (
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
