// src/routes/views.router.js
import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js'; // Ajusta según tu estructura

const router = Router();
const productManager = new ProductManager(); // O tu método para obtener productos

router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts(); // Ajusta según tu método
    res.render('home', { products });
  } catch (error) {
    res.status(500).send('Error al cargar los productos');
  }
});

router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getProducts(); // Ajusta según tu método
    res.render('realTimeProducts', { products });
  } catch (error) {
    res.status(500).send('Error al cargar los productos');
  }
});

export default router;