const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
// Раздаем файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// База данных
let products = [
    { id: 1, title: 'NVIDIA GeForce RTX 4090', price: 185000, category: 'GPU' },
    { id: 2, title: 'Intel Core i9-14900K', price: 68000, category: 'CPU' },
    { id: 3, title: 'Samsung 990 PRO 2TB', price: 22000, category: 'SSD' },
    { id: 4, title: 'Kingston Fury Beast 32GB', price: 12500, category: 'RAM' }
];

// --- API ---

// Получить товары (с фильтрами)
app.get('/api/products', (req, res) => {
    let result = products;

    if (req.query.search) {
        const search = req.query.search.toLowerCase();
        result = result.filter(p => p.title.toLowerCase().includes(search));
    }

    if (req.query.category) {
        result = result.filter(p => p.category === req.query.category);
    }

    if (req.query.sort === 'price_asc') {
        result.sort((a, b) => a.price - b.price);
    } else if (req.query.sort === 'price_desc') {
        result.sort((a, b) => b.price - a.price);
    }

    res.json(result);
});

// Добавить товар
app.post('/api/products', (req, res) => {
    const { title, price, category } = req.body;

    if (!title || title.length < 2) return res.status(400).json({ error: 'Название слишком короткое' });
    if (!price || Number(price) <= 0) return res.status(400).json({ error: 'Неверная цена' });

    const newProduct = { 
        id: Date.now(), 
        title, 
        price: Number(price),
        category: category || 'Misc' 
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Удалить товар
app.delete('/api/products/:id', (req, res) => {
    const id = Number(req.params.id);
    products = products.filter(p => p.id !== id);
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
