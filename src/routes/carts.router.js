// src/routes/carts.router.js
import { Router } from 'express';
import CartMongoManager from '../dao/CartMongoManager.js'; // <-- Asegurate de importar el correcto

const router = Router();
const cartManager = new CartMongoManager();

// POST /api/carts → Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito.' });
  }
});

// GET /api/carts/:cid → Listar productos de un carrito
router.get('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid; // Ya es un string
    const cart = await cartManager.getCartById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado.' });
    }

    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito.' });
  }
});

// POST /api/carts/:cid/product/:pid → Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    const updatedCart = await cartManager.addProductToCart(cartId, productId);

    if (!updatedCart) {
      return res.status(404).json({ error: 'Carrito no encontrado.' });
    }

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto al carrito.' });
  }
});

export default router;
