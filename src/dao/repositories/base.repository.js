export default class BaseRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async create(data) {
    return await this.dao.create(data);
  }

  async findById(id) {
    return await this.dao.findById(id);
  }

  async findOne(filter) {
    return await this.dao.findOne(filter);
  }

  async findAll(filter = {}) {
    return await this.dao.find(filter);
  }

  async update(id, data) {
    return await this.dao.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await this.dao.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await this.dao.countDocuments(filter);
  }
}