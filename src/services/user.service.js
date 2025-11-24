import BaseService from './base.service.js';
import UserRepository from '../dao/repositories/user.repository.js';
import UserDTO from '../dao/dtos/user.dto.js';

export default class UserService extends BaseService {
  constructor() {
    super(new UserRepository());
  }

  async registerUser(userData) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.repository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Crear usuario
      const user = await this.repository.create(userData);
      
      // Retornar DTO sin información sensible
      return UserDTO.fromUser(user);
    } catch (error) {
      throw new Error(`Error registering user: ${error.message}`);
    }
  }

  async loginUser(email, password) {
    try {
      const user = await this.repository.findByEmail(email);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.isValidPassword(password)) {
        throw new Error('Contraseña incorrecta');
      }

      return UserDTO.fromUser(user);
    } catch (error) {
      throw new Error(`Error logging in: ${error.message}`);
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await this.repository.getUserWithoutSensitiveData(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return UserDTO.fromUser(user);
    } catch (error) {
      throw new Error(`Error getting user profile: ${error.message}`);
    }
  }

  async updateUserProfile(userId, updateData) {
    try {
      // Eliminar campos que no se pueden actualizar
      const { password, role, ...safeUpdateData } = updateData;
      
      const user = await this.repository.update(userId, safeUpdateData);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return UserDTO.fromUser(user);
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  async getUsersPaginated(filter = {}, options = {}) {
    try {
      return await this.repository.getUsersPaginated(filter, options);
    } catch (error) {
      throw new Error(`Error getting paginated users: ${error.message}`);
    }
  }
}