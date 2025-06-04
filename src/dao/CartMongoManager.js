import CartModel from '../models/Cart.js';

class CartMongoManager {
  async getCartById(cid) {
    return await CartModel.findById(cid).populate('products.product').lean();
  }

  async createCart() {
    return await CartModel.create({ products: [] });
  }

  async addProductToCart(cid, pid) {
    const cart = await CartModel.findById(cid);
    const item = cart.products.find(p => p.product.toString() === pid);

    if (item) {
      item.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    return await cart.save();
  }

  async removeProductFromCart(cid, pid) {
    const cart = await CartModel.findById(cid);
    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    return await cart.save();
  }

  async updateCart(cid, products) {
    return await CartModel.findByIdAndUpdate(cid, { products }, { new: true });
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await CartModel.findById(cid);
    const item = cart.products.find(p => p.product.toString() === pid);
    if (item) {
      item.quantity = quantity;
    }
    return await cart.save();
  }

  async clearCart(cid) {
    return await CartModel.findByIdAndUpdate(cid, { products: [] }, { new: true });
  }
}

export default CartMongoManager;
