import BaseRepository from './base.repository.js';
import User from '../models/user.model.js';

export default class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.dao.findOne({ email });
  }

  async updatePassword(userId, newPassword) {
    return await this.dao.findByIdAndUpdate(
      userId, 
      { password: newPassword }, 
      { new: true }
    );
  }

  async getUserWithoutSensitiveData(userId) {
    return await this.dao.findById(userId).select('-password -__v');
  }

  async getUsersPaginated(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = {} } = options;
    const skip = (page - 1) * limit;

    const users = await this.dao
      .find(filter)
      .select('-password -__v')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await this.dao.countDocuments(filter);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}