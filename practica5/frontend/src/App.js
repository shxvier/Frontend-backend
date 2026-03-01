import React, { useState, useEffect } from 'react';
import { api } from './api';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import './styles.css';

function App() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [filters, setFilters] = useState({ search: '', category: 'all', sort: '' });

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.category !== 'all') params.category = filters.category;
            if (filters.sort) params.sort = filters.sort;
            
            const data = await api.getProducts(params);
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => { loadProducts(); }, 300); // Дебаунс для поиска
        return () => clearTimeout(timeout);
    }, [filters]);

    const handleDelete = async (id) => {
        if (window.confirm('Точно удалить?')) {
            await api.deleteProduct(id);
            loadProducts();
        }
    };

    const handleSave = async (formData) => {
        editingProduct ? await api.updateProduct(editingProduct.id, formData) : await api.createProduct(formData);
        setModalOpen(false);
        loadProducts();
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="logo">⚡ PC PARTS</div>
                
                <button className="btn-primary full-width" onClick={() => { setEditingProduct(null); setModalOpen(true); }}>
                    + Новый товар
                </button>

                <div className="filter-group">
                    <label>Поиск</label>
                    <input type="text" placeholder="RTX 4090..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
                </div>

                <div className="filter-group">
                    <label>Категория</label>
                    <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                        <option value="all">Все категории</option>
                        <option value="GPU">Видеокарты (GPU)</option>
                        <option value="CPU">Процессоры (CPU)</option>
                        <option value="SSD">Накопители (SSD)</option>
                        <option value="RAM">Память (RAM)</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Сортировка</label>
                    <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})}>
                        <option value="">Без сортировки</option>
                        <option value="price_asc">Сначала дешевые</option>
                        <option value="price_desc">Сначала дорогие</option>
                        <option value="stock_asc">Мало на складе</option>
                    </select>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <h2>Каталог товаров</h2>
                    <div className="stats">
                        <span>Всего: <strong>{products.length}</strong></span>
                        <span>На сумму: <strong>{products.reduce((acc, p) => acc + (p.price || 0), 0).toLocaleString()} ₽</strong></span>
                    </div>
                </header>

                <div className="grid">
                    {loading ? <div className="loader">Загрузка...</div> : 
                     products.length === 0 ? <div className="loader">Ничего не найдено 😢</div> : 
                     products.map(p => <ProductCard key={p.id} product={p} onEdit={(p) => { setEditingProduct(p); setModalOpen(true); }} onDelete={handleDelete} />)}
                </div>
            </main>

            <ProductModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSave} initialData={editingProduct} />
        </div>
    );
}

export default App;