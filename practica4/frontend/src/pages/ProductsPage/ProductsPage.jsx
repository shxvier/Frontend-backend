import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../api';
import ProductCard from '../../components/ProductCard';
import ProductModal from '../../components/ProductModal';
import './ProductsPage.scss';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    // Фильтры
    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        minPrice: '',
        maxPrice: '',
        sort: ''
    });

    useEffect(() => {
        loadProducts();
    }, [filters]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.category !== 'all') params.category = filters.category;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.sort) params.sort = filters.sort;

            console.log('Запрос с параметрами:', params);
            
            const response = await productsAPI.getAll(params);
            console.log('Получены данные:', response.data);
            
            // Проверяем, что данные - массив
            if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else {
                console.error('Получены неверные данные:', response.data);
                setProducts([]);
                setError('Неверный формат данных от сервера');
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            setError('Не удалось загрузить товары. Проверьте подключение к серверу.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
        
        try {
            await productsAPI.delete(id);
            await loadProducts(); // Перезагружаем список после удаления
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('Не удалось удалить товар');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingProduct) {
                await productsAPI.update(editingProduct.id, formData);
            } else {
                await productsAPI.create(formData);
            }
            await loadProducts();
            setModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert(error.response?.data?.error || 'Не удалось сохранить товар');
        }
    };

    // Вычисляем статистику с проверкой на наличие данных
    const stats = {
        total: products.length,
        totalValue: products.reduce((sum, p) => sum + (p.price || 0), 0),
        avgRating: products.length > 0 
            ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
            : 0
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header__container">
                    <div className="header__logo">
                        <h1>⚡ PC PARTS STORE</h1>
                        <span className="badge">v2.0</span>
                    </div>
                    <div className="header__stats">
                        <div className="stat">
                            <span className="stat-label">Товаров</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Сумма</span>
                            <span className="stat-value highlight">
                                {stats.totalValue.toLocaleString()} ₽
                            </span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Рейтинг</span>
                            <span className="stat-value">⭐ {stats.avgRating}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="main">
                <aside className="sidebar">
                    <div className="sidebar__section">
                        <h3>🔍 Поиск</h3>
                        <div className="sidebar__search">
                            <input
                                type="text"
                                placeholder="Название или описание..."
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="sidebar__section">
                        <h3>📂 Категория</h3>
                        <div className="sidebar__filters">
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                            >
                                <option value="all">Все категории</option>
                                <option value="GPU">🎮 Видеокарты (GPU)</option>
                                <option value="CPU">⚙️ Процессоры (CPU)</option>
                                <option value="SSD">💾 SSD накопители</option>
                                <option value="RAM">🧠 Оперативная память</option>
                            </select>
                        </div>
                    </div>

                    <div className="sidebar__section">
                        <h3>💰 Цена</h3>
                        <div className="sidebar__price">
                            <input
                                type="number"
                                placeholder="От"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                                min="0"
                            />
                            <input
                                type="number"
                                placeholder="До"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="sidebar__section">
                        <h3>📊 Сортировка</h3>
                        <div className="sidebar__filters">
                            <select
                                value={filters.sort}
                                onChange={(e) => setFilters({...filters, sort: e.target.value})}
                            >
                                <option value="">По умолчанию</option>
                                <option value="price_asc">Цена (по возрастанию) ↑</option>
                                <option value="price_desc">Цена (по убыванию) ↓</option>
                                <option value="rating_desc">Рейтинг (высокий) ↓</option>
                                <option value="stock_asc">Наличие (сначала мало) ↑</option>
                            </select>
                        </div>
                    </div>

                    <div className="sidebar__section">
                        <h3>➕ Добавить товар</h3>
                        <div className="sidebar__add-form">
                            <button onClick={() => {
                                setEditingProduct(null);
                                setModalOpen(true);
                            }}>
                                + Новый товар
                            </button>
                        </div>
                    </div>
                </aside>

                <section className="products-grid">
                    {loading ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">⏳</div>
                            <div className="empty-state__title">Загрузка...</div>
                            <div className="empty-state__text">Пожалуйста, подождите</div>
                        </div>
                    ) : error ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">❌</div>
                            <div className="empty-state__title">Ошибка</div>
                            <div className="empty-state__text">{error}</div>
                            <button 
                                onClick={loadProducts}
                                style={{
                                    marginTop: '20px',
                                    padding: '10px 20px',
                                    background: 'var(--gradient-primary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-lg)',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Попробовать снова
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">🔍</div>
                            <div className="empty-state__title">Ничего не найдено</div>
                            <div className="empty-state__text">Попробуйте изменить параметры поиска</div>
                        </div>
                    ) : (
                        products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </section>
            </main>

            <footer className="footer">
                <div className="footer__container">
                    ⚡ <span>PC PARTS STORE</span> — Интернет-магазин компьютерных комплектующих
                </div>
            </footer>

            <ProductModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingProduct(null);
                }}
                onSubmit={handleSubmit}
                initialData={editingProduct}
            />
        </div>
    );
};

export default ProductsPage;