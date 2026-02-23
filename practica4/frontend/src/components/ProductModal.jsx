import React, { useState, useEffect } from 'react';

const ProductModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'GPU',
        price: '',
        description: '',
        stock: '0',
        specs: {}
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                category: initialData.category || 'GPU',
                price: initialData.price || '',
                description: initialData.description || '',
                stock: initialData.stock || '0',
                specs: initialData.specs || {}
            });
        } else {
            setFormData({
                title: '',
                category: 'GPU',
                price: '',
                description: '',
                stock: '0',
                specs: {}
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Название обязательно';
        if (!formData.price) newErrors.price = 'Цена обязательна';
        if (formData.price <= 0) newErrors.price = 'Цена должна быть больше 0';
        if (!formData.description.trim()) newErrors.description = 'Описание обязательно';
        if (formData.description.length < 20) newErrors.description = 'Описание должно быть не короче 20 символов';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal__content" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2>{initialData ? '✏️ Редактировать товар' : '➕ Добавить товар'}</h2>
                    <button onClick={onClose}>✕</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal__body">
                        <div className="form-group">
                            <label>Название товара *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="Например: NVIDIA GeForce RTX 4090"
                                className={errors.title ? 'error' : ''}
                            />
                            {errors.title && <small className="error-text">{errors.title}</small>}
                        </div>

                        <div className="form-group">
                            <label>Категория *</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="GPU">🎮 Видеокарта (GPU)</option>
                                <option value="CPU">⚙️ Процессор (CPU)</option>
                                <option value="SSD">💾 SSD накопитель</option>
                                <option value="RAM">🧠 Оперативная память</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Цена (₽) *</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                placeholder="185000"
                                min="0"
                                step="1"
                                className={errors.price ? 'error' : ''}
                            />
                            {errors.price && <small className="error-text">{errors.price}</small>}
                        </div>

                        <div className="form-group">
                            <label>Количество на складе</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={e => setFormData({...formData, stock: e.target.value})}
                                placeholder="10"
                                min="0"
                                step="1"
                            />
                        </div>

                        <div className="form-group">
                            <label>Описание *</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="Подробное описание товара..."
                                rows="4"
                                className={errors.description ? 'error' : ''}
                            />
                            {errors.description && <small className="error-text">{errors.description}</small>}
                        </div>
                    </div>

                    <div className="modal__footer">
                        <button type="button" className="cancel" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="save">
                            {initialData ? 'Сохранить изменения' : 'Создать товар'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;