import { Router } from 'express';
import User from '../models/user.model.js';
import passport from 'passport';

const router = Router();

// Middleware de autorización para admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      status: 'error',
      message: 'Acceso denegado. Se requiere rol de admin' 
    });
  }
};

// CREATE - Registro de usuario (ya lo tenemos en sessions, pero por si acaso)
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error',
        message: 'El email ya está registrado' 
      });
    }

    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password
    });

    await newUser.save();

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Error al registrar usuario', 
      error: error.message 
    });
  }
});

// READ - Obtener todos los usuarios (solo admin)
router.get('/', 
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.json({ status: 'success', payload: users });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Error al obtener usuarios', 
        error: error.message 
      });
    }
  }
);

// READ - Obtener usuario por ID
router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Usuario no encontrado' 
        });
      }

      // Solo permitir ver datos propios o admin
      if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ 
          status: 'error',
          message: 'No tienes permisos para ver este usuario' 
        });
      }

      res.json({ status: 'success', payload: user });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Error al obtener usuario', 
        error: error.message 
      });
    }
  }
);

// UPDATE - Actualizar usuario
router.put('/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { first_name, last_name, age, email } = req.body;
      
      // Solo permitir actualizar datos propios o admin
      if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ 
          status: 'error',
          message: 'No tienes permisos para actualizar este usuario' 
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { first_name, last_name, age, email },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Usuario no encontrado' 
        });
      }

      res.json({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        payload: updatedUser
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Error al actualizar usuario', 
        error: error.message 
      });
    }
  }
);

// DELETE - Eliminar usuario
router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Solo permitir eliminar datos propios o admin
      if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ 
          status: 'error',
          message: 'No tienes permisos para eliminar este usuario' 
        });
      }

      const deletedUser = await User.findByIdAndDelete(req.params.id);

      if (!deletedUser) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Usuario no encontrado' 
        });
      }

      res.json({
        status: 'success',
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Error al eliminar usuario', 
        error: error.message 
      });
    }
  }
);

export default router;