import UserService from '../services/user.service.js';

const userService = new UserService();

export default class UserController {
  static async register(req, res) {
    try {
      const userDTO = await userService.registerUser(req.body);
      
      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        payload: userDTO.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const userDTO = await userService.getUserProfile(req.user.id);
      
      res.json({
        status: 'success',
        payload: userDTO.toJSON()
      });
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userDTO = await userService.updateUserProfile(req.user.id, req.body);
      
      res.json({
        status: 'success',
        message: 'Perfil actualizado exitosamente',
        payload: userDTO.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}