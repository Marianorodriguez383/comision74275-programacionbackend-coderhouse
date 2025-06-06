// src/routes/views/products.router.js

import { Router } from 'express';
import ProductMongoManager from '../../dao/ProductMongoManager.js';

const router = Router();
const productManager = new ProductMongoManager();

// Ruta para renderizar el detalle del producto
router.get('/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productManager.getProductById(pid);

    if (!product) {
      return res.status(404).render('error', { message: 'Producto no encontrado.' });
    }

    res.render('productDetail', { product });
  } catch (error) {
    res.status(500).render('error', { message: 'Error al cargar el producto.' });
  }
});

export default router;
