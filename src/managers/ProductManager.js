// src/managers/ProductManager.js

import fs from 'fs/promises';
import path from 'path';

const productsPath = path.resolve('src/data/products.json');

export default class ProductManager {
  constructor() {
    this.path = productsPath;
  }

  async _readFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return []; // Si no hay archivo o error, devuelve array vacío
    }
  }

  async _writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async getProducts() {
    return await this._readFile();
  }

  async getProductById(id) {
    const products = await this._readFile();
    return products.find(p => p.id === id);
  }

  async addProduct(product) {
    const products = await this._readFile();
    const newId = products.length ? products[products.length - 1].id + 1 : 1;

    const newProduct = {
      id: newId,
      status: true,
      ...product
    };

    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const products = await this._readFile();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    // No permitimos actualizar el id
    updateData.id = id;

    products[index] = { ...products[index], ...updateData };
    await this._writeFile(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this._readFile();
    const updatedProducts = products.filter(p => p.id !== id);
    await this._writeFile(updatedProducts);
    return true;
  }
}
