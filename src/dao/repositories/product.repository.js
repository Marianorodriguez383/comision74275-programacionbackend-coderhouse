import BaseRepository from './base.repository.js';
import Product from '../models/product.model.js';

export default class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async getProductsPaginated(filter = {}, options = {}) {
    const { limit = 10, page = 1, sort = {} } = options;
    const skip = (page - 1) * limit;

    const products = await this.dao
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await this.dao.countDocuments(filter);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(total / limit),
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
      }
    };
  }

  async getProductByCode(code) {
    return await this.dao.findOne({ code });
  }

  async updateStock(productId, newStock) {
    return await this.dao.findByIdAndUpdate(
      productId, 
      { stock: newStock }, 
      { new: true }
    );
  }
}