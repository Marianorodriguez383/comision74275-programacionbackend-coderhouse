// src/managers/CartManager.js
import path from 'path';
import { readJSON, writeJSON } from '../utils/fileHandler.js';

const cartsPath = path.resolve('data/carts.json');

export default class CartManager {
  constructor() {
    this.path = cartsPath;
  }

  async createCart() {
    const carts = await readJSON(this.path) || [];
    const newId = carts.length ? carts[carts.length - 1].id + 1 : 1;

    const newCart = {
      id: newId,
      products: []
    };

    carts.push(newCart);
    await writeJSON(this.path, carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await readJSON(this.path) || [];
    return carts.find(cart => cart.id === id) || null;
  }

  async addProductToCart(cartId, productId) {
    if (typeof cartId !== 'number' || cartId <= 0) {
      throw new Error('ID de carrito inválido');
    }
    if (typeof productId !== 'number' || productId <= 0) {
      throw new Error('ID de producto inválido');
    }

    const carts = await readJSON(this.path) || [];
    const cartIndex = carts.findIndex(c => c.id === cartId);

    if (cartIndex === -1) {
      throw new Error('Carrito no encontrado');
    }

    const cart = carts[cartIndex];
    const productInCart = cart.products.find(p => p.product === productId);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    carts[cartIndex] = cart;
    await writeJSON(this.path, carts);
    return cart;
  }

  // Método para eliminar un producto del carrito
  async removeProductFromCart(cartId, productId) {
    if (typeof cartId !== 'number' || cartId <= 0) {
      throw new Error('ID de carrito inválido');
    }
    if (typeof productId !== 'number' || productId <= 0) {
      throw new Error('ID de producto inválido');
    }

    const carts = await readJSON(this.path) || [];
    const cartIndex = carts.findIndex(c => c.id === cartId);

    if (cartIndex === -1) {
      throw new Error('Carrito no encontrado');
    }

    const cart = carts[cartIndex];
    const initialLength = cart.products.length;
    cart.products = cart.products.filter(p => p.product !== productId);

    if (cart.products.length === initialLength) {
      throw new Error('Producto no encontrado en el carrito');
    }

    carts[cartIndex] = cart;
    await writeJSON(this.path, carts);
    return cart;
  }

  // Método para vaciar el carrito (eliminar todos los productos)
  async clearCart(cartId) {
    if (typeof cartId !== 'number' || cartId <= 0) {
      throw new Error('ID de carrito inválido');
    }

    const carts = await readJSON(this.path) || [];
    const cartIndex = carts.findIndex(c => c.id === cartId);

    if (cartIndex === -1) {
      throw new Error('Carrito no encontrado');
    }

    carts[cartIndex].products = [];
    await writeJSON(this.path, carts);
    return carts[cartIndex];
  }
}
