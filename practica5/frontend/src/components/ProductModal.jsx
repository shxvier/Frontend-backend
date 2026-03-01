import React, { useState, useEffect } from 'react';
import { api } from '../api';

const ProductModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '', category: 'GPU', price: '', description: '', image: ''
    });

    useEffect(() => {
        if (initialData) setFormData(initialData);
        else setFormData({ title: '', category: 'GPU', price: '', description: '', image: '' });
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        let currentImage = formData.image;

        if (file) {
            try {
                currentImage = await api.uploadImage(file);
            } catch (err) {
                alert("Ошибка загрузки фото!"); return;
            }
        }
        onSubmit({ ...formData, image: currentImage });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{initialData ? 'Редактировать' : 'Добавить товар'}</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Название" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" placeholder="Цена" required style={{ flex: 1 }} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        <select style={{ flex: 1 }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option value="GPU">GPU</option>
                            <option value="CPU">CPU</option>
                            <option value="SSD">SSD</option>
                        </select>
                    </div>

                    <textarea placeholder="Описание" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    
                    <div className="file-box">
                        <label>Фото товара:</label>
                        <input type="file" onChange={e => setFile(e.target.files[0])} />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn-primary">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;