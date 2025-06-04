// src/routes/views.router.js
import { Router } from 'express';
import ProductMongoManager from '../dao/ProductMongoManager.js';


const router = Router();
const productManager = new ProductMongoManager(); // O tu método para obtener productos

router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts(); // Ajusta según tu método
    res.render('home', { products });
  } catch (error) {
    res.status(500).send('Error al cargar los productos');
  }
});

router.get('/products', async (req, res) => {
  const { limit = 5, page = 1, sort, query } = req.query;

  try {
    const result = await productManager.getProducts({ limit, page, sort, query });

    res.render('products', {
      products: result.docs,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit
    });
  } catch (error) {
    res.status(500).send('Error al cargar los productos.');
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