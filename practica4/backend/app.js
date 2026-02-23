const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// База данных - 10 товаров с полной информацией
let products = [
    { 
        id: nanoid(8),
        title: 'NVIDIA GeForce RTX 4090', 
        category: 'GPU', 
        description: '24GB GDDR6X, 384-bit, PCIe 4.0, 3-слотовый дизайн, поддержка DLSS 3. Мощнейшая видеокарта для 4K гейминга.',
        price: 185000, 
        stock: 5,
        rating: 4.9,
        specs: {
            'Память': '24GB GDDR6X',
            'Частота': '2520 MHz',
            'TDP': '450W'
        }
    },
    { 
        id: nanoid(8),
        title: 'Intel Core i9-14900K', 
        category: 'CPU', 
        description: '24 ядра (8P+16E), 32 потока, до 6.0 ГГц, LGA 1700, 125W TDP. Флагманский процессор для самых требовательных задач.',
        price: 68000, 
        stock: 8,
        rating: 4.8,
        specs: {
            'Ядра': '24 (8P+16E)',
            'Потоки': '32',
            'Макс. частота': '6.0 GHz'
        }
    },
    { 
        id: nanoid(8),
        title: 'Samsung 990 PRO 2TB', 
        category: 'SSD', 
        description: 'NVMe M.2 PCIe 4.0 x4, чтение 7450 МБ/с, запись 6900 МБ/с. Идеальный выбор для профессионалов и геймеров.',
        price: 22000, 
        stock: 15,
        rating: 4.9,
        specs: {
            'Чтение': '7450 MB/s',
            'Запись': '6900 MB/s',
            'Тип': 'NVMe M.2'
        }
    },
    { 
        id: nanoid(8),
        title: 'Kingston Fury Beast 32GB', 
        category: 'RAM', 
        description: 'DDR5, 6000MHz, CL40, 2x16GB, RGB подсветка. Высокоскоростная память с эффектной подсветкой.',
        price: 12500, 
        stock: 12,
        rating: 4.7,
        specs: {
            'Объем': '32GB (2x16)',
            'Скорость': '6000 MHz',
            'Тип': 'DDR5'
        }
    },
    { 
        id: nanoid(8),
        title: 'AMD Ryzen 7 7800X3D', 
        category: 'CPU', 
        description: '8 ядер, 16 потоков, до 5.0 ГГц, 3D V-Cache, AM5. Лучший процессор для игр с технологией 3D V-Cache.',
        price: 45000, 
        stock: 7,
        rating: 4.9,
        specs: {
            'Ядра': '8',
            'Потоки': '16',
            'Макс. частота': '5.0 GHz',
            'Кэш': '104MB'
        }
    },
    { 
        id: nanoid(8),
        title: 'WD Black SN850X 1TB', 
        category: 'SSD', 
        description: 'NVMe M.2 PCIe 4.0, чтение 7300 МБ/с, с радиатором. Скоростной SSD с эффективным охлаждением.',
        price: 11500, 
        stock: 20,
        rating: 4.8,
        specs: {
            'Чтение': '7300 MB/s',
            'Запись': '6300 MB/s',
            'Тип': 'NVMe M.2'
        }
    },
    { 
        id: nanoid(8),
        title: 'Corsair Vengeance 64GB', 
        category: 'RAM', 
        description: 'DDR5, 5600MHz, CL40, 2x32GB, для рабочих станций. Максимальный объем для профессиональных задач.',
        price: 22500, 
        stock: 6,
        rating: 4.6,
        specs: {
            'Объем': '64GB (2x32)',
            'Скорость': '5600 MHz',
            'Тип': 'DDR5'
        }
    },
    { 
        id: nanoid(8),
        title: 'AMD Radeon RX 7900 XTX', 
        category: 'GPU', 
        description: '24GB GDDR6, 384-bit, PCIe 4.0, поддержка FSR 3. Главный конкурент RTX 4090 с отличным соотношением цены.',
        price: 120000, 
        stock: 4,
        rating: 4.7,
        specs: {
            'Память': '24GB GDDR6',
            'Частота': '2500 MHz',
            'TDP': '355W'
        }
    },
    { 
        id: nanoid(8),
        title: 'Intel Core i5-13600K', 
        category: 'CPU', 
        description: '14 ядер (6P+8E), 20 потоков, до 5.1 ГГц, LGA 1700. Оптимальный выбор для игрового ПК.',
        price: 32000, 
        stock: 18,
        rating: 4.8,
        specs: {
            'Ядра': '14 (6P+8E)',
            'Потоки': '20',
            'Макс. частота': '5.1 GHz'
        }
    },
    { 
        id: nanoid(8),
        title: 'Crucial P3 Plus 4TB', 
        category: 'SSD', 
        description: 'NVMe M.2 PCIe 4.0, чтение 5000 МБ/с, QLC память. Огромный объем для вашей игровой коллекции.',
        price: 28000, 
        stock: 9,
        rating: 4.5,
        specs: {
            'Чтение': '5000 MB/s',
            'Запись': '4200 MB/s',
            'Тип': 'NVMe M.2'
        }
    }
];

// Поиск товара по ID
const findProduct = (id) => products.find(p => p.id === id);

// GET /api/products - все товары с фильтрацией
app.get('/api/products', (req, res) => {
    try {
        let result = [...products];
        const { search, category, minPrice, maxPrice, sort } = req.query;

        if (search) {
            const query = search.toLowerCase();
            result = result.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.description.toLowerCase().includes(query)
            );
        }

        if (category && category !== 'all') {
            result = result.filter(p => p.category === category);
        }

        if (minPrice) {
            result = result.filter(p => p.price >= Number(minPrice));
        }

        if (maxPrice) {
            result = result.filter(p => p.price <= Number(maxPrice));
        }

        // Сортировка
        switch (sort) {
            case 'price_asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating_desc':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'stock_asc':
                result.sort((a, b) => a.stock - b.stock);
                break;
            default:
                break;
        }

        res.json(result);
    } catch (error) {
        console.error('Error in GET /api/products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/products/:id - один товар
app.get('/api/products/:id', (req, res) => {
    try {
        const product = findProduct(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error in GET /api/products/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/products - создать товар
app.post('/api/products', (req, res) => {
    try {
        const { title, price, category, description, stock, specs } = req.body;

        // Валидация
        if (!title?.trim() || title.length < 3) {
            return res.status(400).json({ error: 'Название должно быть не короче 3 символов' });
        }
        if (!price || price <= 0) {
            return res.status(400).json({ error: 'Цена должна быть положительным числом' });
        }
        if (!category) {
            return res.status(400).json({ error: 'Выберите категорию' });
        }
        if (!description?.trim() || description.length < 20) {
            return res.status(400).json({ error: 'Описание должно быть не короче 20 символов' });
        }

        const newProduct = {
            id: nanoid(8),
            title: title.trim(),
            price: Number(price),
            category,
            description: description.trim(),
            stock: stock !== undefined ? Number(stock) : 0,
            rating: 0,
            specs: specs || {}
        };

        products.push(newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error in POST /api/products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/products/:id - обновить товар
app.patch('/api/products/:id', (req, res) => {
    try {
        const product = findProduct(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        const { title, price, category, description, stock, rating, specs } = req.body;

        if (title) product.title = title.trim();
        if (price) product.price = Number(price);
        if (category) product.category = category;
        if (description) product.description = description.trim();
        if (stock !== undefined) product.stock = Number(stock);
        if (rating !== undefined) product.rating = Number(rating);
        if (specs) product.specs = { ...product.specs, ...specs };

        res.json(product);
    } catch (error) {
        console.error('Error in PATCH /api/products/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/products/:id - удалить товар
app.delete('/api/products/:id', (req, res) => {
    try {
        const index = products.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        products.splice(index, 1);
        res.status(204).send();
    } catch (error) {
        console.error('Error in DELETE /api/products/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Обработка 404
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`🚀 Backend запущен на http://localhost:${port}`);
    console.log(`📦 Загружено ${products.length} товаров`);
});