// src/managers/CartManager.js

import fs from 'fs/promises';
import path from 'path';

const cartsPath = path.resolve('src/data/carts.json');

export default class CartManager {
  constructor() {
    this.path = cartsPath;
  }

  async _readFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async _writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async createCart() {
    const carts = await this._readFile();
    const newId = carts.length ? carts[carts.length - 1].id + 1 : 1;

    const newCart = {
      id: newId,
      products: []
    };

    carts.push(newCart);
    await this._writeFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this._readFile();
    return carts.find(cart => cart.id === id);
  }

  async addProductToCart(cartId, productId) {
    const carts = await this._readFile();
    const cartIndex = carts.findIndex(c => c.id === cartId);

    if (cartIndex === -1) {
      return null;
    }

    const cart = carts[cartIndex];
    const productInCart = cart.products.find(p => p.product === productId);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    carts[cartIndex] = cart;
    await this._writeFile(carts);
    return cart;
  }
}
