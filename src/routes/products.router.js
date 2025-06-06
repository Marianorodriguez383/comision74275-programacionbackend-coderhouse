

import { Router } from 'express';
import ProductMongoManager from '../dao/ProductMongoManager.js';

const router = Router();
const productManager = new ProductMongoManager();

// GET /api/products → Listar productos con paginación, filtro y orden
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const limitNum = parseInt(limit) || 10;
    const pageNum = parseInt(page) || 1;
    const sortStr = sort === 'asc' || sort === 'desc' ? sort : null;
    const queryStr = query || null;

    const result = await productManager.getProducts({
      limit: limitNum,
      page: pageNum,
      sort: sortStr,
      query: queryStr,
    });

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    const prevLink = result.hasPrevPage
      ? `${baseUrl}?page=${result.prevPage}&limit=${limitNum}${sortStr ? `&sort=${sortStr}` : ''}${queryStr ? `&query=${queryStr}` : ''}`
      : null;
    const nextLink = result.hasNextPage
      ? `${baseUrl}?page=${result.nextPage}&limit=${limitNum}${sortStr ? `&sort=${sortStr}` : ''}${queryStr ? `&query=${queryStr}` : ''}`
      : null;

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Error al obtener productos',
      message: error.message,
    });
  }
});

// GET /api/products/:pid → Obtener producto por ID
router.get('/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productManager.getProductById(pid);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
});

// POST /api/products → Agregar nuevo producto
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
      thumbnails: thumbnails || [],
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto.' });
  }
});

// PUT /api/products/:pid → Actualizar producto
router.put('/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    const updateData = req.body;

    const updatedProduct = await productManager.updateProduct(pid, updateData);

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto.' });
  }
});

// DELETE /api/products/:pid → Eliminar producto
router.delete('/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    const deleted = await productManager.deleteProduct(pid);

    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({ message: 'Producto eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
});



export default router;
