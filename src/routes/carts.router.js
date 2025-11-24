import { Router } from 'express';
import passport from 'passport';
import CartMongoManager from '../dao/CartMongoManager.js';
import ProductMongoManager from '../dao/ProductMongoManager.js';
import { isUser, isUserOrAdmin, isAdmin } from '../middleware/authorization.js';
import TicketManager from '../dao/TicketManager.js'; 

const router = Router();
const cartManager = new CartMongoManager();
const productManager = new ProductMongoManager();
const ticketManager = new TicketManager(); 

// POST /api/carts → Crear un nuevo carrito (SOLO USUARIOS AUTENTICADOS)
router.post('/', 
  passport.authenticate('current', { session: false }),
  isUserOrAdmin,
  async (req, res) => {
    try {
      const newCart = await cartManager.createCart();
      res.status(201).json({
        status: 'success',
        message: 'Carrito creado exitosamente',
        payload: newCart
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        error: 'Error al crear el carrito.' 
      });
    }
  }
);

// GET /api/carts/:cid → Listar productos de un carrito (SOLO USUARIO PROPIETARIO O ADMIN)
router.get('/:cid', 
  passport.authenticate('current', { session: false }),
  isUserOrAdmin,
  async (req, res) => {
    try {
      const cartId = req.params.cid;
      const cart = await cartManager.getCartById(cartId);

      if (!cart) {
        return res.status(404).json({ 
          status: 'error',
          error: 'Carrito no encontrado.' 
        });
      }

      // ✅ VERIFICACIÓN ADICIONAL: Solo el usuario dueño del carrito o admin puede verlo
      if (req.user.role !== 'admin' && cart.user && cart.user.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          error: 'No tienes permisos para ver este carrito.'
        });
      }

      res.json({
        status: 'success',
        payload: cart.products
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        error: 'Error al obtener el carrito.' 
      });
    }
  }
);

// POST /api/carts/:cid/product/:pid → Agregar producto al carrito (SOLO USUARIOS)
router.post('/:cid/product/:pid', 
  passport.authenticate('current', { session: false }),
  isUser, // ✅ SOLO USUARIOS, NO ADMINS
  async (req, res) => {
    try {
      const { cid, pid } = req.params;

      // Validar si existe el producto
      const product = await productManager.getProductById(pid);
      if (!product) {
        return res.status(404).json({ 
          status: 'error',
          error: 'Producto no encontrado.' 
        });
      }

      const updatedCart = await cartManager.addProductToCart(cid, pid);
      
      res.json({
        status: 'success',
        message: 'Producto agregado al carrito',
        payload: updatedCart
      });
    } catch (error) {
      res.status(400).json({ 
        status: 'error',
        error: error.message 
      });
    }
  }
);

// PUT /api/carts/:cid/product/:pid → Modificar cantidad (SOLO USUARIOS)
router.put('/:cid/product/:pid', 
  passport.authenticate('current', { session: false }),
  isUser,
  async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ 
          status: 'error',
          error: 'La cantidad debe ser un número mayor a 0.' 
        });
      }

      const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);

      if (!updatedCart) {
        return res.status(404).json({ 
          status: 'error',
          error: 'Carrito o producto no encontrado.' 
        });
      }

      res.json({
        status: 'success',
        message: 'Cantidad actualizada',
        payload: updatedCart
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: 'error',
        error: 'Error al actualizar la cantidad del producto en el carrito.' 
      });
    }
  }
);

// DELETE /api/carts/:cid/product/:pid → Eliminar producto del carrito (SOLO USUARIOS)
router.delete('/:cid/product/:pid', 
  passport.authenticate('current', { session: false }),
  isUser,
  async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const updatedCart = await cartManager.removeProductFromCart(cid, pid);

      if (!updatedCart) {
        return res.status(404).json({ 
          status: 'error',
          error: 'Carrito no encontrado o producto no existe en el carrito.' 
        });
      }

      res.json({
        status: 'success',
        message: 'Producto eliminado del carrito',
        payload: updatedCart
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        error: 'Error al eliminar el producto del carrito.' 
      });
    }
  }
);

// DELETE /api/carts/:cid → Vaciar todo el carrito (SOLO USUARIOS)
router.delete('/:cid', 
  passport.authenticate('current', { session: false }),
  isUser,
  async (req, res) => {
    try {
      const updatedCart = await cartManager.clearCart(req.params.cid);

      if (!updatedCart) {
        return res.status(404).json({ 
          status: 'error',
          error: 'Carrito no encontrado.' 
        });
      }

      res.json({ 
        status: 'success',
        message: 'Carrito vaciado con éxito.', 
        payload: updatedCart 
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        error: 'Error al vaciar el carrito.' 
      });
    }
  }
);

// DELETE /api/carts/:cid/delete → Eliminar completamente un carrito (SOLO ADMIN)
router.delete('/:cid/delete', 
  passport.authenticate('current', { session: false }),
  isAdmin, // ✅ SOLO ADMIN PUEDE ELIMINAR CARRITOS COMPLETAMENTE
  async (req, res) => {
    try {
      const result = await cartManager.deleteCart(req.params.cid);

      if (!result) {
        return res.status(404).json({ 
          status: 'error',
          error: 'Carrito no encontrado.' 
        });
      }

      res.json({ 
        status: 'success',
        message: 'Carrito eliminado completamente.' 
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        error: 'Error al eliminar el carrito.' 
      });
    }
  }
);

// 
// ✅ PURCHASE ENDPOINT - COMPLETO
router.post('/:cid/purchase', 
  passport.authenticate('current', { session: false }),
  isUser,
  async (req, res) => {
    try {
      const cartId = req.params.cid;
      const userEmail = req.user.email;

      console.log(`🛒 Iniciando compra para carrito: ${cartId}, usuario: ${userEmail}`);

      // 1. Obtener el carrito
      const cart = await cartManager.getCartById(cartId);
      if (!cart) {
        return res.status(404).json({
          status: 'error',
          error: 'Carrito no encontrado.'
        });
      }

      // 2. Validar que el carrito tenga productos
      if (!cart.products || cart.products.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'El carrito está vacío.'
        });
      }

      const productsToPurchase = [];
      const productsOutOfStock = [];
      let totalAmount = 0;

      // 3. Validar stock y calcular total
      for (const item of cart.products) {
        const product = await productManager.getProductById(item.product._id || item.product);
        
        if (!product) {
          productsOutOfStock.push({
            product: item.product._id || item.product,
            title: item.product.title || 'Producto no encontrado',
            requested: item.quantity,
            available: 0
          });
          continue;
        }

        if (product.stock >= item.quantity) {
          // Producto disponible
          const productTotal = product.price * item.quantity;
          totalAmount += productTotal;

          productsToPurchase.push({
            product: product._id,
            quantity: item.quantity,
            price: product.price,
            title: product.title
          });

          // Actualizar stock
          await productManager.updateProduct(product._id, {
            stock: product.stock - item.quantity
          });
        } else {
          // Producto sin stock suficiente
          productsOutOfStock.push({
            product: product._id,
            title: product.title,
            requested: item.quantity,
            available: product.stock
          });
        }
      }

      // 4. Verificar si hay productos para comprar
      if (productsToPurchase.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'No hay productos con stock suficiente para completar la compra.',
          productsOutOfStock
        });
      }

      // 5. Crear ticket
      const ticketData = {
        amount: totalAmount,
        purchaser: userEmail,
        products: productsToPurchase
      };

      const ticket = await ticketManager.createTicket(ticketData);

      // 6. Actualizar carrito (dejar solo productos sin stock)
      const remainingProducts = productsOutOfStock.map(item => ({
        product: item.product,
        quantity: item.requested
      }));

      await cartManager.updateCartProducts(cartId, remainingProducts);

      // 7. Respuesta exitosa
      const response = {
        status: 'success',
        message: 'Compra realizada exitosamente',
        ticket: {
          id: ticket._id,
          code: ticket.code,
          purchase_datetime: ticket.purchase_datetime,
          amount: ticket.amount,
          purchaser: ticket.purchaser,
          products: ticket.products
        }
      };

      // 8. Si hay productos sin stock, agregar información
      if (productsOutOfStock.length > 0) {
        response.productsOutOfStock = productsOutOfStock;
        response.message += `. Algunos productos no tenían stock suficiente y permanecen en el carrito.`;
      }

      console.log(`✅ Compra exitosa. Ticket: ${ticket.code}, Monto: $${totalAmount}`);
      
      res.json(response);

    } catch (error) {
      console.error('❌ Error en proceso de compra:', error);
      res.status(500).json({
        status: 'error',
        error: 'Error al procesar la compra.',
        message: error.message
      });
    }
  }
);

export default router;