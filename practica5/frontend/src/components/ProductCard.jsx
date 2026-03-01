import React from 'react';

const ProductCard = ({ product, onEdit, onDelete }) => {
    // Проверка на случай пустых данных
    if (!product) return null;

    return (
        <div className="product-card">
            <div className="product-image">
                <img 
                    src={product.image || '/images/placeholder.png'} 
                    alt={product.title} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }}
                />
            </div>
            <div className="product-info">
                <span className="category-tag">{product.category}</span>
                <h3>{product.title}</h3>
                <p className="description-short">{product.description}</p>
                <p className="price">{Number(product.price).toLocaleString()} ₽</p>
                <div className="card-buttons">
                    <button className="edit-btn" onClick={() => onEdit(product)}>✏️ Изменить</button>
                    <button className="delete-btn" onClick={() => onDelete(product.id)}>🗑️</button>
                </div>
            </div>
        </div>
    );
};

// ОБЯЗАТЕЛЬНАЯ СТРОКА:
export default ProductCard;