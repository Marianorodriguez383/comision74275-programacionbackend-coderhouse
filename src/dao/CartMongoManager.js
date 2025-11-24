import CartModel from '../models/Cart.js';
import ProductModel from '../models/Product.js';

class CartMongoManager {
  constructor() {
    this.cartModel = CartModel; // ✅ Agregar constructor
  }

  async getCartById(cid) {
    const cart = await CartModel.findById(cid)
      .populate('products.product')
      .lean();
    
    if (cart && cart.products) {
      cart.products = cart.products.map(item => ({
        ...item,
        product: item.product ? { ...item.product } : null
      }));
    }
    
    return cart;
  }

  async createCart() {
    const cart = await CartModel.create({ products: [] });
    return cart.toObject();
  }

  async addProductToCart(cid, pid) {
    const cart = await CartModel.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');

    const product = await ProductModel.findById(pid);
    if (!product) throw new Error('Producto no encontrado');

    const item = cart.products.find(p => p.product.toString() === pid);
    if (item) {
      item.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    return this.getCartById(cid);
  }

  async removeProductFromCart(cid, pid) {
    const cart = await CartModel.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    return this.getCartById(cid);
  }

  async updateCart(cid, products) {
    const cart = await CartModel.findByIdAndUpdate(
      cid, 
      { products }, 
      { new: true, lean: true }
    );
    return cart;
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await CartModel.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) throw new Error('Producto no encontrado en el carrito');

    item.quantity = quantity;
    await cart.save();
    return this.getCartById(cid);
  }

  async clearCart(cid) {
    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true, lean: true }
    );
    return cart;
  }

  async deleteCart(cid) {
    const result = await CartModel.findByIdAndDelete(cid).lean();
    if (!result) throw new Error('Carrito no encontrado');
    return result;
  }

  async updateCartProducts(cartId, products) {
    try {
      return await CartModel.findByIdAndUpdate( // ✅ Usar CartModel directamente
        cartId,
        { products: products },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating cart products: ${error.message}`);
    }
  }
}

export default CartMongoManager;