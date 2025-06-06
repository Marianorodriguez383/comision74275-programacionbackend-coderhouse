import { Router } from 'express';
import ProductMongoManager from '../dao/ProductMongoManager.js';
import CartMongoManager from '../dao/CartMongoManager.js';

const router = Router();
const productManager = new ProductMongoManager();
const cartManager = new CartMongoManager();

router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts({ limit: 10, page: 1 });
    res.render('home', { products: products.docs });
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
    const products = await productManager.getProducts({ limit: 10, page: 1 });
    res.render('realTimeProducts', { products: products.docs });
  } catch (error) {
    res.status(500).send('Error al cargar los productos');
  }
});

router.get('/cart/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await cartManager.getCartById(cartId);
    if (!cart) return res.status(404).send('Carrito no encontrado');

    const processedCart = {
      ...cart,
      products: cart.products.map(item => ({
        ...item,
        product: {
          ...item.product,
          title: item.product?.title || 'Producto no disponible',
          price: item.product?.price || 0,
          description: item.product?.description || '',
          category: item.product?.category || '',
          stock: item.product?.stock || 0
        }
      }))
    };

    res.render('cart', { cart: processedCart });
  } catch (error) {
    res.status(500).send('Error al obtener el carrito');
  }
});

export default router;