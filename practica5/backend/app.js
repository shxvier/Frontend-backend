const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { nanoid } = require('nanoid');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3001' }));

// 1. Настройка Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../frontend/public/images/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));

// 2. Исправленная настройка Swagger (без автоматического сканирования)
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'PC Parts Store API',
    version: '1.0.0',
    description: 'Документация API для Контрольной работы №1',
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/api/products': {
      get: {
        summary: 'Получить список всех товаров',
        responses: { '200': { description: 'Успешный возврат списка' } }
      },
      post: {
        summary: 'Добавить новый товар',
        responses: { '201': { description: 'Товар создан' } }
      }
    },
    '/api/upload': {
      post: {
        summary: 'Загрузить изображение',
        responses: { '200': { description: 'Файл успешно загружен' } }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// База данных (10 товаров)
let products = [
    { id: '1', title: 'RTX 4090 Founders', category: 'GPU', price: 185000, description: 'Лучшая карта для 4K', image: '/images/rtx4090.png' },
    { id: '2', title: 'Intel i9-14900K', category: 'CPU', price: 62000, description: '24 ядра, 6.0 ГГц', image: '/images/i9.png' },
    { id: '3', title: 'Ryzen 7 7800X3D', category: 'CPU', price: 45000, description: 'Игровой лидер с 3D V-Cache', image: '/images/r7.png' },
    { id: '4', title: 'Samsung 990 Pro 2TB', category: 'SSD', price: 19500, description: 'Скорость до 7450 МБ/с', image: '/images/ssd.png' },
    { id: '5', title: 'Kingston Fury 32GB', category: 'RAM', price: 13000, description: 'DDR5 6000MT/s', image: '/images/ram.png' },
    { id: '6', title: 'ASUS ROG Z790-E', category: 'Motherboard', price: 48000, description: 'Поддержка PCIe 5.0', image: '/images/mb.png' },
    { id: '7', title: 'DeepCool PX1000G', category: 'PSU', price: 16000, description: 'Блок питания ATX 3.0', image: '/images/psu.png' },
    { id: '8', title: 'Lian Li O11 Dynamic', category: 'Case', price: 15500, description: 'Корпус-аквариум', image: '/images/case.png' },
    { id: '9', title: 'Noctua NH-D15', category: 'Cooler', price: 12000, description: 'Легендарное охлаждение', image: '/images/cooler.png' },
    { id: '10', title: 'RTX 4070 Ti Super', category: 'GPU', price: 95000, description: 'Идеально для 2K', image: '/images/rtx4070.png' }
];

// Эндпоинты
app.get('/api/products', (req, res) => res.json(products));

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не выбран' });
  res.json({ imageUrl: `/images/${req.file.filename}` });
});

app.post('/api/products', (req, res) => {
  const newProduct = { id: nanoid(8), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.delete('/api/products/:id', (req, res) => {
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

app.listen(3000, () => console.log('Backend started on http://localhost:3000'));