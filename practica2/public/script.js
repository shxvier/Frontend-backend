const grid = document.getElementById('products-grid');

async function loadProducts() {
    const search = document.getElementById('search-input').value;
    const category = document.getElementById('category-filter').value;
    const sort = document.getElementById('sort-select').value;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);

    const res = await fetch(`/api/products?${params.toString()}`);
    const products = await res.json();
    render(products);
}

function getImage(category) {
    if(category === 'GPU') return 'https://placehold.co/300x200/111/00f3ff?text=GPU';
    if(category === 'CPU') return 'https://placehold.co/300x200/111/ff0055?text=CPU';
    if(category === 'SSD') return 'https://placehold.co/300x200/111/ffcc00?text=SSD';
    if(category === 'RAM') return 'https://placehold.co/300x200/111/00ff9d?text=RAM';
    return 'https://placehold.co/300x200/111/ffffff?text=Device';
}

function render(products) {
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<div style="color: #666; grid-column: 1/-1; text-align: center;">Nothing found...</div>';
        return;
    }

    products.forEach(p => {
        const imgUrl = getImage(p.category);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-image">
                <img src="${imgUrl}" alt="${p.title}">
                <span class="badge">${p.category}</span>
            </div>
            <div class="card-content">
                <div class="card-header"><span class="id-tag">#${p.id}</span></div>
                <h3>${p.title}</h3>
                <div class="card-footer">
                    <span class="price">${p.price.toLocaleString()} ₽</span>
                    <button onclick="deleteProduct(${p.id})" class="btn-icon">✖</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    document.getElementById('total-count').textContent = products.length;
    const total = products.reduce((sum, p) => sum + p.price, 0);
    document.getElementById('total-price').textContent = total.toLocaleString();
}

async function addProduct() {
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value;

    const res = await fetch('/api/products', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ title, price, category })
    });

    if (res.ok) {
        document.getElementById('title').value = '';
        document.getElementById('price').value = '';
        loadProducts();
    } else {
        const err = await res.json();
        alert(err.error);
    }
}

async function deleteProduct(id) {
    if(confirm('Delete item?')) {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadProducts();
    }
}

loadProducts();
