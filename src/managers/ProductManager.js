// src/managers/ProductManager.js
import path from 'path';
import { readJSON, writeJSON } from '../utils/fileHandler.js';

const productsPath = path.resolve('data/products.json');

export default class ProductManager {
  constructor() {
    this.path = productsPath;
  }

  async getProducts() {
    return await readJSON(this.path) || [];
  }

  async getProductById(id) {
    const products = await readJSON(this.path) || [];
    return products.find(p => p.id === id) || null;
  }

  async addProduct(product) {
    // Validaciones básicas
    if (
      !product.title || typeof product.title !== 'string' ||
      !product.description || typeof product.description !== 'string' ||
      !product.code || typeof product.code !== 'string' ||
      typeof product.price !== 'number' || product.price <= 0 ||
      typeof product.stock !== 'number' || product.stock < 0 ||
      !product.category || typeof product.category !== 'string'
    ) {
      throw new Error('Datos del producto inválidos o incompletos');
    }

    const products = await readJSON(this.path) || [];

    // Validar que no exista un producto con el mismo code (único)
    const exists = products.find(p => p.code === product.code);
    if (exists) throw new Error('Producto con ese código ya existe');

    const newId = products.length ? products[products.length - 1].id + 1 : 1;

    const newProduct = {
      id: newId,
      status: true,
      thumbnails: product.thumbnails || [],
      ...product
    };

    products.push(newProduct);
    await writeJSON(this.path, products);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const products = await readJSON(this.path) || [];
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');

    // No permitimos cambiar el id
    updateData.id = id;

    // Validar campos si vienen para actualizar (opcionales)
    if (updateData.title && typeof updateData.title !== 'string') throw new Error('Título inválido');
    if (updateData.description && typeof updateData.description !== 'string') throw new Error('Descripción inválida');
    if (updateData.code && typeof updateData.code !== 'string') throw new Error('Código inválido');
    if (updateData.price !== undefined && (typeof updateData.price !== 'number' || updateData.price <= 0)) throw new Error('Precio inválido');
    if (updateData.stock !== undefined && (typeof updateData.stock !== 'number' || updateData.stock < 0)) throw new Error('Stock inválido');
    if (updateData.category && typeof updateData.category !== 'string') throw new Error('Categoría inválida');
    if (updateData.status !== undefined && typeof updateData.status !== 'boolean') throw new Error('Status inválido');

    products[index] = { ...products[index], ...updateData };
    await writeJSON(this.path, products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await readJSON(this.path) || [];
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');

    products.splice(index, 1);
    await writeJSON(this.path, products);
    return true;
  }
}
