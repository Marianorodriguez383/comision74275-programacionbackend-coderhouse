import ProductModel from '../models/Product.js';

class ProductMongoManager {
  constructor() {
    this.productModel = ProductModel; // ✅ Agregar constructor
  }

  async getProducts({ limit = 10, page = 1, sort, query }) {
    const filter = query ? { $or: [
      { category: query },
      { available: query === 'true' }
    ]} : {};

    const sortOption = sort ? { price: sort === 'asc' ? 1 : -1 } : {};

    const result = await ProductModel.paginate(filter, {
      limit,
      page,
      sort: sortOption,
      lean: true,
    });

    return result;
  }

  async getProductById(pid) {
    return await ProductModel.findById(pid).lean();
  }

  async addProduct(productData) {
    const product = await ProductModel.create(productData);
    return product.toObject();
  }

  async updateProduct(productId, updateData) {
    try {
      return await ProductModel.findByIdAndUpdate( // ✅ Usar ProductModel directamente
        productId,
        updateData,
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  async deleteProduct(pid) {
    return await ProductModel.findByIdAndDelete(pid).lean();
  }
}

export default ProductMongoManager;