import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Grid2X2,
  Heart,
  List,
  LogOut,
  MessageCircle,
  ReceiptText,
  Search,
  ShoppingBag,
  ShoppingCart,
  X,
} from 'lucide-react';
import { cadastrarUsuario, fazerLogin } from './api';

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
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pedidoItens, setPedidoItens] = useState([]);
  const [pedidoCriadoEm, setPedidoCriadoEm] = useState(null);
  const [isSummaryVisible, setIsSummaryVisible] = useState(true);

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
    () => pedidoItens.reduce(
      (total, item) => total + item.precoValor * item.quantidade,
      0,
    ),
    [pedidoItens],
  );

  function updateLoginField(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  function updateRegisterField(event) {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const data = await fazerLogin(loginForm);
      localStorage.setItem('ivoneideToken', data.token);
      setUsuarioLogado({
        id: data.usuarioId,
        nome: data.nome,
        email: data.email,
        role: data.role,
      });
      setMessage({
        type: 'success',
        text: 'Login realizado com sucesso. Token salvo no navegador.',
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
    setMessage(null);
    setLoginForm(initialLogin);
    setPedidoItens([]);
    setPedidoCriadoEm(null);
    setIsSummaryVisible(true);
  }

  function handleComprar(produto) {
    setPedidoCriadoEm((current) => current ?? new Date());
    setIsSummaryVisible(true);
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

  function limparPedido() {
    setPedidoItens([]);
    setPedidoCriadoEm(null);
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
              aria-label="Abrir resumo do pedido"
              onClick={() => setIsSummaryVisible(true)}
            >
              <ShoppingCart size={28} aria-hidden="true" />
              {totalItens > 0 && (
                <span className="cart-button__badge">{totalItens}</span>
              )}
            </button>

            <div className="store-user">
              <div className="avatar" aria-hidden="true">
                {usuarioLogado.nome.slice(0, 1)}
              </div>
              <div>
                <strong>{usuarioLogado.nome}</strong>
                <span>Minha conta</span>
              </div>
              <button className="account-button" type="button" onClick={handleLogout}>
                <LogOut size={15} aria-hidden="true" />
                Sair
              </button>
            </div>
          </div>
        </header>

        {!isSummaryVisible && (
          <button
            className="summary-floating-toggle"
            type="button"
            onClick={() => setIsSummaryVisible(true)}
          >
            <ShoppingCart size={18} aria-hidden="true" />
            Resumo ({totalItens})
          </button>
        )}

        <section className={`store-layout ${!isSummaryVisible ? 'store-layout--summary-hidden' : ''}`}>
          <aside className="store-sidebar" aria-label="Menu da loja">
            <button className="sidebar-link sidebar-link--active" type="button">
              <ShoppingBag size={23} aria-hidden="true" />
              Produtos
            </button>
            <button className="sidebar-link" type="button">
              <ClipboardList size={23} aria-hidden="true" />
              Meus pedidos
            </button>
            <button className="sidebar-link" type="button">
              <ReceiptText size={23} aria-hidden="true" />
              Minhas compras
            </button>
            <button className="sidebar-link" type="button">
              <Download size={23} aria-hidden="true" />
              Downloads
            </button>

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

            <div className="store-grid">
              {produtosPreview.map((produto) => (
                <article className="store-product-card" key={produto.id}>
                  <div className={`book-cover book-cover--${produto.cor}`}>
                    <span className="pdf-badge">PDF</span>
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
                  </div>
                  <div className="store-product-card__body">
                    <h3>{produto.nome}</h3>
                    <div className="store-product-card__footer">
                      <strong>{produto.preco}</strong>
                      <button
                        className="primary-button primary-button--small"
                        type="button"
                        onClick={() => handleComprar(produto)}
                      >
                        <ShoppingCart size={16} aria-hidden="true" />
                        Comprar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="download-info">
              <Download size={26} aria-hidden="true" />
              Todas as apostilas sao digitais (PDF) e voce recebe o acesso
              imediatamente apos a confirmacao do pagamento.
            </div>
          </section>

          {isSummaryVisible && (
            <aside className="store-summary" aria-label="Resumo do pedido">
              <div className="summary-heading">
                <div className="summary-heading__title">
                  <FileText size={25} aria-hidden="true" />
                  <h2>Resumo do pedido</h2>
                </div>
                <button
                  className="summary-hide-button"
                  type="button"
                  aria-label="Ocultar resumo do pedido"
                  onClick={() => setIsSummaryVisible(false)}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {pedidoItens.length === 0 ? (
                <div className="empty-summary">
                  <ShoppingCart size={36} aria-hidden="true" />
                  <strong>Nenhuma apostila selecionada</strong>
                  <p>
                    Clique em Comprar em uma apostila para montar o resumo do
                    pedido aqui.
                  </p>
                </div>
              ) : (
                <>
                  <div className="summary-order-title">
                    <div>
                      <strong>Pedido em montagem</strong>
                      <p>Iniciado em {formatDate(pedidoCriadoEm)}</p>
                    </div>
                    <span className="status-pill">CRIADO</span>
                  </div>

                  <div className="summary-divider" />

                  <strong className="summary-section-title">
                    Itens do pedido ({totalItens})
                  </strong>
                  <div className="summary-items">
                    {pedidoItens.map((produto) => (
                      <div className="summary-item" key={produto.id}>
                        <div className={`summary-thumb book-cover--${produto.cor}`}>
                          <span>{produto.tema.slice(0, 1)}</span>
                        </div>
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
                      <span>Total do pedido</span>
                      <strong>{formatCurrency(subtotalPedido)}</strong>
                    </div>
                  </div>

                  <div className="payment-approved payment-approved--pending">
                    <CheckCircle2 size={32} aria-hidden="true" />
                    <div>
                      <strong>Status atual: CRIADO</strong>
                      <p>O pedido ainda nao foi enviado para pagamento.</p>
                      <small>Na proxima etapa vamos conectar com POST /api/pedidos.</small>
                    </div>
                  </div>

                  <button className="receipt-button" type="button">
                    <FileText size={18} aria-hidden="true" />
                    Finalizar pedido
                  </button>
                  <button className="download-button download-button--disabled" type="button" disabled>
                    <Download size={18} aria-hidden="true" />
                    Download liberado apos pagamento
                  </button>
                  <button className="clear-button" type="button" onClick={limparPedido}>
                    Limpar pedido
                  </button>
                </>
              )}

              <div className="thanks-card">
                <span>
                  <Heart size={16} aria-hidden="true" />
                  Obrigado por apoiar o trabalho artesanal!
                </span>
                <strong>Deus abencoe sempre voce!</strong>
                <div className="note-flower" aria-hidden="true" />
              </div>
            </aside>
          )}
        </section>
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
