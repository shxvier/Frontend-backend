import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import ProductCard from './components/ProductCard';
import ProductForm from './components/ProductForm';
import UsersPanel from './components/UsersPanel';
import {
  adminApi,
  authApi,
  clearTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  productsApi,
  resolveAssetUrl,
  saveTokens
} from './api';
import { categoryOptions, getCategoryLabel, getRoleLabel } from './labels';

const emptyAuthForm = {
  username: '',
  password: ''
};

const initialFilters = {
  search: '',
  category: 'all',
  sort: ''
};

export default function App() {
  const [mode, setMode] = useState('login');
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adminToolsOpen, setAdminToolsOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [blacklistStats, setBlacklistStats] = useState(null);
  const [users, setUsers] = useState([]);
  const deferredSearch = useDeferredValue(filters.search);

  const queryFilters = useMemo(
    () => ({
      search: deferredSearch.trim(),
      category: filters.category,
      sort: filters.sort
    }),
    [deferredSearch, filters.category, filters.sort]
  );

  const permissions = useMemo(() => {
    const role = user?.role;
    return {
      canCreate: role === 'admin' || role === 'moderator',
      canEdit: role === 'admin' || role === 'moderator',
      canDelete: role === 'admin',
      canViewBlacklist: role === 'admin',
      canViewUsers: role === 'admin'
    };
  }, [user]);
  const hasModalOpen = editorOpen || detailsOpen;

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (!hasModalOpen) {
      document.body.classList.remove('has-modal');
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        if (editorOpen) {
          closeEditor();
        }

        if (detailsOpen) {
          closeDetails();
        }
      }
    }

    document.body.classList.add('has-modal');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('has-modal');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [detailsOpen, editorOpen, hasModalOpen]);

  useEffect(() => {
    if (user) {
      loadProducts(queryFilters);
    }
  }, [queryFilters, user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
      return;
    }

    setAdminToolsOpen(false);
    setUsers([]);
  }, [user?.role]);

  async function bootstrap() {
    if (!getStoredAccessToken() && !getStoredRefreshToken()) {
      return;
    }

    try {
      const response = await authApi.me();
      setUser(response.data.user);
      setError('');
    } catch (bootstrapError) {
      clearTokens();
    }
  }

  async function loadProducts(nextFilters = queryFilters) {
    setProductsLoading(true);
    setError('');

    try {
      const response = await productsApi.list(nextFilters);
      setProducts(response.data);
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Не удалось загрузить товары.');
    } finally {
      setProductsLoading(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'register') {
        await authApi.register({
          username: authForm.username,
          password: authForm.password
        });
        setMessage('Регистрация завершена. Новые аккаунты создаются с ролью пользователя.');
        setMode('login');
        setAuthForm((current) => ({ ...emptyAuthForm, username: current.username }));
      } else {
        const response = await authApi.login({
          username: authForm.username,
          password: authForm.password
        });
        saveTokens(response.data);
        setUser(response.data.user);
        setMessage(`Вы вошли как ${response.data.user.username}.`);
        setAuthForm(emptyAuthForm);
        setDetailsOpen(false);
        setSelectedProduct(null);
      }
    } catch (authError) {
      setError(authError.response?.data?.error || 'Ошибка авторизации.');
    } finally {
      setAuthLoading(false);
    }
  }

  function handleAuthFieldChange(event) {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  }

  async function handleLogout() {
    const refreshToken = getStoredRefreshToken();

    try {
      await authApi.logout(refreshToken);
    } catch (logoutError) {
      // Ignore server logout errors, local cleanup is enough.
    }

    clearTokens();
    setUser(null);
    setProducts([]);
    setDetailsOpen(false);
    setSelectedProduct(null);
    setEditorOpen(false);
    setEditingProduct(null);
    setAdminToolsOpen(false);
    setBlacklistStats(null);
    setUsers([]);
    setMessage('Сеанс завершен.');
  }

  async function handleOpenProduct(id) {
    if (!id) {
      return;
    }

    setError('');
    setDetailsOpen(true);
    setDetailLoading(true);
    setSelectedProduct(null);

    try {
      const response = await productsApi.getById(id);
      setSelectedProduct(response.data);
    } catch (detailError) {
      setDetailsOpen(false);
      setError(detailError.response?.data?.error || 'Не удалось загрузить товар.');
    } finally {
      setDetailLoading(false);
    }
  }

  function handleStartCreate() {
    setEditingProduct(null);
    setEditorOpen(true);
  }

  function handleStartEdit(product) {
    setEditingProduct(product);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingProduct(null);
  }

  function closeDetails() {
    setDetailsOpen(false);
    setDetailLoading(false);
    setSelectedProduct(null);
  }

  async function handleSaveProduct(payload) {
    setSaveLoading(true);
    setError('');

    try {
      let response;
      if (editingProduct) {
        response = await productsApi.update(editingProduct.id, payload);
        setMessage('Товар обновлен.');
      } else {
        response = await productsApi.create(payload);
        setMessage('Товар создан.');
      }

      const savedProduct = response.data;
      closeEditor();
      setDetailsOpen(true);
      setSelectedProduct(savedProduct);
      await loadProducts(queryFilters);
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Не удалось сохранить товар.');
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('Удалить этот товар?')) {
      return;
    }

    setError('');

    try {
      await productsApi.remove(id);
      setMessage('Товар удален.');
      if (selectedProduct?.id === id) {
        closeDetails();
      }
      await loadProducts(queryFilters);
    } catch (deleteError) {
      setError(deleteError.response?.data?.error || 'Не удалось удалить товар.');
    }
  }

  async function handleLoadBlacklist() {
    setError('');
    setBlacklistLoading(true);

    try {
      const response = await authApi.blacklistStats();
      setBlacklistStats(response.data);
    } catch (statsError) {
      setError(statsError.response?.data?.error || 'Не удалось загрузить статистику токенов.');
    } finally {
      setBlacklistLoading(false);
    }
  }

  async function loadUsers() {
    setUsersLoading(true);
    setError('');

    try {
      const response = await adminApi.listUsers();
      setUsers(response.data);
    } catch (usersError) {
      setError(usersError.response?.data?.error || 'Не удалось загрузить пользователей.');
    } finally {
      setUsersLoading(false);
    }
  }

  function handleResetFilters() {
    setFilters(initialFilters);
  }

  if (!user) {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <div className="auth-card__lead">
            <span className="eyebrow">Практики 7-12</span>
            <h1>Авторизация и каталог</h1>
            <p>
              Тестовые аккаунты:
              <br />
              <strong>admin / admin123</strong>
              <br />
              <strong>moderator / mod12345</strong>
              <br />
              <strong>user / user12345</strong>
            </p>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <div className="tabs">
              <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')}>
                Вход
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'is-active' : ''}
                onClick={() => setMode('register')}
              >
                Регистрация
              </button>
            </div>

            <label>
              <span>Логин</span>
              <input name="username" value={authForm.username} onChange={handleAuthFieldChange} required />
            </label>

            <label>
              <span>Пароль</span>
              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={handleAuthFieldChange}
                required
              />
            </label>

            {mode === 'register' ? (
              <p className="panel__hint">
                Самостоятельная регистрация создает только роль <strong>пользователь</strong>.
              </p>
            ) : null}

            {message ? <div className="notice notice--success">{message}</div> : null}
            {error ? <div className="notice notice--error">{error}</div> : null}

            <button type="submit" disabled={authLoading}>
              {authLoading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Каталог</span>
          <h1>Товары и доступ</h1>
          <p className="topbar__subtitle">Авторизация, роли и каталог.</p>
        </div>

        <div className="topbar__actions">
          <div className="user-chip">
            <strong>{user.username}</strong>
            <span>{getRoleLabel(user.role)}</span>
          </div>
          <button type="button" className="button-ghost" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <section className="panel panel--soft">
            <div className="panel__header">
              <div>
                <h3>Фильтры</h3>
                <p>Поиск и порядок.</p>
              </div>
              <span className="panel-tag">ФИЛЬТР</span>
            </div>

            <label>
              <span>Поиск</span>
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="RTX, Ryzen, Samsung..."
              />
            </label>

            <label>
              <span>Категория</span>
              <select
                value={filters.category}
                onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
              >
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Сортировка</span>
              <select
                value={filters.sort}
                onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
              >
                <option value="">Без сортировки</option>
                <option value="price_asc">Цена: по возрастанию</option>
                <option value="price_desc">Цена: по убыванию</option>
                <option value="stock_asc">Остаток: по возрастанию</option>
                <option value="stock_desc">Остаток: по убыванию</option>
                <option value="rating_desc">Рейтинг: по убыванию</option>
              </select>
            </label>

            <div className="filter-actions">
              <button type="button" className="button-secondary" onClick={() => loadProducts(queryFilters)}>
                Применить
              </button>
              <button type="button" className="button-ghost" onClick={handleResetFilters}>
                Сбросить
              </button>
            </div>
          </section>

          {permissions.canCreate ? (
            <section className="panel">
              <div className="panel__header">
                <div>
                  <h3>Действия</h3>
                  <p>Создание и правка.</p>
                </div>
                <span className="panel-tag">CRUD</span>
              </div>
              <button type="button" onClick={handleStartCreate}>
                Новый товар
              </button>
              <p className="panel__hint">Доступно модератору и администратору.</p>
            </section>
          ) : null}
        </aside>

        <section className="content">
          <section className="hero-panel">
            <div>
              <span className="eyebrow">Сводка</span>
              <h2>Каталог с авторизацией</h2>
              <p>JWT, роли и CRUD в одном интерфейсе.</p>
            </div>
            <div className="hero-panel__stats">
              <div>
                <strong>{products.length}</strong>
                <span>товаров</span>
              </div>
              <div>
                <strong>{getRoleLabel(user.role)}</strong>
                <span>роль</span>
              </div>
              <div>
                <strong>{permissions.canDelete ? 'Полный' : permissions.canEdit ? 'Редактор' : 'Чтение'}</strong>
                <span>доступ</span>
              </div>
            </div>
          </section>

          {message ? <div className="notice notice--success">{message}</div> : null}
          {error ? <div className="notice notice--error">{error}</div> : null}

          {permissions.canViewUsers ? (
            <section className="panel admin-toolbar">
              <div>
                <span className="eyebrow">Админ</span>
                <h3>Служебные панели</h3>
                <p className="panel__hint">Пользователи и blacklist скрыты до запроса.</p>
              </div>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setAdminToolsOpen((current) => !current)}
              >
                {adminToolsOpen ? 'Скрыть панели' : 'Показать панели'}
              </button>
            </section>
          ) : null}

          {permissions.canViewUsers && adminToolsOpen ? (
            <section className="admin-tools">
              {permissions.canViewBlacklist ? (
                <section className="panel panel--soft">
                  <div className="panel__header">
                    <div>
                      <h3>Токены</h3>
                      <p>Blacklist и активные сессии.</p>
                    </div>
                    <span className="panel-tag">АДМИН</span>
                  </div>

                  <button
                    type="button"
                    className="button-secondary"
                    onClick={handleLoadBlacklist}
                    disabled={blacklistLoading}
                  >
                    {blacklistLoading ? 'Загрузка...' : 'Обновить'}
                  </button>

                  {blacklistStats ? (
                    <dl className="stats-list">
                      <div>
                        <dt>Access-токены</dt>
                        <dd>{blacklistStats.accessRevoked}</dd>
                      </div>
                      <div>
                        <dt>Refresh-токены</dt>
                        <dd>{blacklistStats.refreshRevoked}</dd>
                      </div>
                      <div>
                        <dt>Сессии</dt>
                        <dd>{blacklistStats.activeRefreshSessions}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="panel__hint">Нажми «Обновить», чтобы получить актуальные значения.</p>
                  )}
                </section>
              ) : null}

              <UsersPanel users={users} loading={usersLoading} onReload={loadUsers} />
            </section>
          ) : null}

          <section className="content__header">
            <div>
              <span className="eyebrow">Список</span>
              <h2>{products.length} товаров</h2>
            </div>
            <button type="button" className="button-secondary" onClick={() => loadProducts(queryFilters)} disabled={productsLoading}>
              {productsLoading ? 'Обновление...' : 'Обновить'}
            </button>
          </section>

          {productsLoading ? <div className="empty-state">Загрузка товаров...</div> : null}
          {!productsLoading && products.length === 0 ? <div className="empty-state">Товары не найдены.</div> : null}

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                canEdit={permissions.canEdit}
                canDelete={permissions.canDelete}
                onOpen={handleOpenProduct}
                onEdit={handleStartEdit}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        </section>
      </main>

      {editorOpen ? (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!saveLoading) {
              closeEditor();
            }
          }}
        >
          <div
            className="modal-shell"
            role="dialog"
            aria-modal="true"
            aria-label={editingProduct ? 'Редактирование товара' : 'Создание товара'}
            onClick={(event) => event.stopPropagation()}
          >
            <ProductForm
              initialProduct={editingProduct}
              loading={saveLoading}
              onCancel={closeEditor}
              onSubmit={handleSaveProduct}
            />
          </div>
        </div>
      ) : null}

      {detailsOpen ? (
        <div className="modal-backdrop" onClick={closeDetails}>
          <div
            className="modal-shell modal-shell--narrow"
            role="dialog"
            aria-modal="true"
            aria-label={selectedProduct?.title || 'Карточка товара'}
            onClick={(event) => event.stopPropagation()}
          >
            {detailLoading || !selectedProduct ? (
              <div className="empty-state">Загрузка товара...</div>
            ) : (
              <section className="detail-card detail-modal">
                <div className="detail-modal__top">
                  <div>
                    <span className="eyebrow">Товар</span>
                    <h4>{selectedProduct.title}</h4>
                    <p>{getCategoryLabel(selectedProduct.category)}</p>
                  </div>

                  <div className="form-panel__actions">
                    {permissions.canEdit ? (
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => {
                          closeDetails();
                          handleStartEdit(selectedProduct);
                        }}
                      >
                        Изменить
                      </button>
                    ) : null}
                    <button type="button" className="button-ghost" onClick={closeDetails}>
                      Закрыть
                    </button>
                  </div>
                </div>

                <div className="detail-card__image-wrap">
                  <img className="detail-card__image" src={resolveAssetUrl(selectedProduct.image)} alt={selectedProduct.title} />
                </div>

                <p>{selectedProduct.description}</p>

                <dl className="detail-modal__summary">
                  <div>
                    <dt>ID</dt>
                    <dd>{selectedProduct.id}</dd>
                  </div>
                  <div>
                    <dt>Цена</dt>
                    <dd>{selectedProduct.price.toLocaleString()} RUB</dd>
                  </div>
                  <div>
                    <dt>Остаток</dt>
                    <dd>{selectedProduct.stock}</dd>
                  </div>
                  <div>
                    <dt>Рейтинг</dt>
                    <dd>{selectedProduct.rating}/5</dd>
                  </div>
                </dl>
              </section>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
