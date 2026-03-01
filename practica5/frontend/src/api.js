import axios from 'axios';

const client = axios.create({ baseURL: 'http://localhost:3000/api' });

export const api = {
  getProducts: async () => {
    const { data } = await client.get('/products');
    return data;
  },
  createProduct: async (product) => {
    const { data } = await client.post('/products', product);
    return data;
  },
  deleteProduct: async (id) => {
    await client.delete(`/products/${id}`);
  },
  uploadImage: async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    // Используем client (у него уже есть префикс /api)
    const { data } = await client.post('/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.imageUrl;
  }
};