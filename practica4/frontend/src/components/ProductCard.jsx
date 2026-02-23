import React from 'react';

const getCategoryIcon = (category) => {
    const icons = {
        GPU: '🎮',
        CPU: '⚙️',
        SSD: '💾',
        RAM: '🧠'
    };
    return icons[category] || '📦';
};

const getStockStatus = (stock) => {
    if (!stock || stock === 0) return { class: 'out', text: 'Нет в наличии' };
    if (stock < 5) return { class: 'low', text: `Мало (${stock} шт.)` };
    return { class: 'in', text: `В наличии (${stock} шт.)` };
};

const ProductCard = ({ product, onEdit, onDelete }) => {
    if (!product) return null;

    const stockStatus = getStockStatus(product.stock);
    const categoryIcon = getCategoryIcon(product.category);

    return (
        <div className="product-card">
            <div className="product-card__header">
                <span className="product-card__category">
                    {categoryIcon} {product.category}
                </span>
                <span className="product-card__id">#{product.id.slice(0, 6)}</span>
            </div>
            
            <div className="product-card__image">
                {categoryIcon}
            </div>
            
            <div className="product-card__content">
                <h3 className="product-card__title">{product.title}</h3>
                <p className="product-card__description">{product.description}</p>
                
                {product.specs && Object.keys(product.specs).length > 0 && (
                    <div className="product-card__specs">
                        {Object.entries(product.specs).map(([key, value]) => (
                            <div key={key}>
                                <span>{key}:</span>
                                <span>{value}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                {product.rating > 0 && (
                    <div className="product-card__rating">
                        {'⭐'.repeat(Math.floor(product.rating))} ({product.rating})
                    </div>
                )}
                
                <div className="product-card__footer">
                    <span className="product-card__price">
                        {product.price.toLocaleString()} ₽
                    </span>
                    <span className={`product-card__stock product-card__stock--${stockStatus.class}`}>
                        {stockStatus.text}
                    </span>
                </div>
                
                <div className="product-card__actions">
                    <button className="edit" onClick={() => onEdit(product)}>
                        ✏️ Ред.
                    </button>
                    <button className="delete" onClick={() => onDelete(product.id)}>
                        🗑️ Удал.
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;