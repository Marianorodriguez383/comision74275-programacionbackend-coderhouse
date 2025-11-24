export default class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      throw new Error(`Error creating: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const result = await this.repository.findById(id);
      if (!result) {
        throw new Error('Resource not found');
      }
      return result;
    } catch (error) {
      throw new Error(`Error finding by id: ${error.message}`);
    }
  }

  async findAll(filter = {}) {
    try {
      return await this.repository.findAll(filter);
    } catch (error) {
      throw new Error(`Error finding all: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const result = await this.repository.update(id, data);
      if (!result) {
        throw new Error('Resource not found');
      }
      return result;
    } catch (error) {
      throw new Error(`Error updating: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const result = await this.repository.delete(id);
      if (!result) {
        throw new Error('Resource not found');
      }
      return result;
    } catch (error) {
      throw new Error(`Error deleting: ${error.message}`);
    }
  }
}