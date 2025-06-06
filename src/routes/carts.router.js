import { Router } from 'express';
import CartMongoManager from '../dao/CartMongoManager.js';
import ProductMongoManager from '../dao/ProductMongoManager.js';

const router = Router();
const cartManager = new CartMongoManager();
const productManager = new ProductMongoManager(); // ✅ instanciado correctamente

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
    const cartId = req.params.cid;
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
    const { cid, pid } = req.params;

    // Validar si existe el producto
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const updatedCart = await cartManager.addProductToCart(cid, pid);
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/carts/:cid/product/:pid → Modificar cantidad del producto en el carrito
router.put('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'La cantidad debe ser un número mayor a 0.' });
    }

    const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);

    if (!updatedCart) {
      return res.status(404).json({ error: 'Carrito o producto no encontrado.' });
    }

    res.json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la cantidad del producto en el carrito.' });
  }
});

// DELETE /api/carts/:cid/product/:pid → Eliminar producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.removeProductFromCart(cid, pid);

    if (!updatedCart) {
      return res.status(404).json({ error: 'Carrito no encontrado o producto no existe en el carrito.' });
    }

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto del carrito.' });
  }
});

// DELETE /api/carts/:cid → Vaciar todo el carrito
router.delete('/:cid', async (req, res) => {
  try {
    const updatedCart = await cartManager.clearCart(req.params.cid);

    if (!updatedCart) {
      return res.status(404).json({ error: 'Carrito no encontrado.' });
    }

    res.json({ message: 'Carrito vaciado con éxito.', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ error: 'Error al vaciar el carrito.' });
  }
});

// DELETE /api/carts/:cid/delete → Eliminar completamente un carrito
router.delete('/:cid/delete', async (req, res) => {
  try {
    const result = await cartManager.deleteCart(req.params.cid);

    if (!result) {
      return res.status(404).json({ error: 'Carrito no encontrado.' });
    }

    res.json({ message: 'Carrito eliminado completamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el carrito.' });
  }
});

export default router;
