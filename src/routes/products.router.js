// src/routes/products.router.js

import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

// GET /api/products/ → Listar todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos.' });
  }
});

// GET /api/products/:pid → Obtener un producto por ID
router.get('/:pid', async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const product = await productManager.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
});

// POST /api/products/ → Agregar un nuevo producto
router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || price == null || stock == null || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const newProduct = await productManager.addProduct({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails: thumbnails || []
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto.' });
  }
});

// PUT /api/products/:pid → Actualizar un producto
router.put('/:pid', async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const updateData = req.body;

    const updatedProduct = await productManager.updateProduct(id, updateData);

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto.' });
  }
});

// DELETE /api/products/:pid → Eliminar un producto
router.delete('/:pid', async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const deleted = await productManager.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({ message: 'Producto eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
});

export default router;
