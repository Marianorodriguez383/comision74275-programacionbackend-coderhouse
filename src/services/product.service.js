import BaseService from './base.service.js';
import ProductRepository from '../dao/repositories/product.repository.js';

export default class ProductService extends BaseService {
  constructor() {
    super(new ProductRepository());
  }

  async getProductsPaginated(filter = {}, options = {}) {
    try {
      return await this.repository.getProductsPaginated(filter, options);
    } catch (error) {
      throw new Error(`Error getting paginated products: ${error.message}`);
    }
  }

  async createProduct(productData) {
    try {
      // Verificar si el código ya existe
      const existingProduct = await this.repository.getProductByCode(productData.code);
      if (existingProduct) {
        throw new Error('El código del producto ya existe');
      }

      // Validar campos requeridos
      const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
      for (const field of requiredFields) {
        if (!productData[field]) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      // Establecer valores por defecto
      const productWithDefaults = {
        status: true,
        thumbnails: [],
        ...productData
      };

      return await this.repository.create(productWithDefaults);
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  async updateProductStock(productId, newStock) {
    try {
      if (newStock < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      const product = await this.repository.updateStock(productId, newStock);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return product;
    } catch (error) {
      throw new Error(`Error updating product stock: ${error.message}`);
    }
  }

  async validateProductsStock(products) {
    try {
      const productsWithStock = [];
      
      for (const item of products) {
        const product = await this.repository.findById(item.product);
        if (!product) {
          throw new Error(`Producto no encontrado: ${item.product}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para: ${product.title}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
        }

        productsWithStock.push({
          product: product,
          quantity: item.quantity,
          price: product.price
        });
      }

      return productsWithStock;
    } catch (error) {
      throw new Error(`Error validating products stock: ${error.message}`);
    }
  }
}