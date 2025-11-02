import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const router = Router();

// ✅ ENDPOINT DEBUG TEMPORAL - agregar esto AL INICIO
router.get('/current-debug', (req, res) => {
  try {
    console.log('🔍 DEBUG - Headers recibidos:', req.headers);
    
    const authHeader = req.headers.authorization;
    console.log('🔍 DEBUG - Authorization header:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ status: 'error', message: 'No authorization header' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Invalid authorization format' });
    }
    
    const token = authHeader.substring(7);
    console.log('🔍 DEBUG - Token extracted:', token);
    
    // Verificar el token manualmente
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 DEBUG - Token decoded:', decoded);
    
    res.json({
      status: 'success',
      message: 'DEBUG - Token válido',
      decoded: decoded
    });
    
  } catch (error) {
    console.log('❌ DEBUG - Token error:', error.message);
    res.status(401).json({ 
      status: 'error', 
      message: 'DEBUG - Token inválido',
      error: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err || !user) {
        return res.status(401).json({ 
          status: 'error',
          message: info?.message || 'Error de autenticación' 
        });
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const payload = {
          id: user._id,
          email: user.email,
          role: user.role
        };

        // ✅ LOG AGREGADO AQUÍ - JWT_SECRET usado en login
        console.log('🔐 LOGIN - JWT_SECRET usado:', process.env.JWT_SECRET || 'USANDO POR DEFECTO');

        const token = jwt.sign(
          payload, 
          'mi_clave_super_secreta_comision_74275_coderhouse_2024' || 'secreto_desarrollo_74275',
          { expiresIn: '24h' }
        );

        return res.json({
          status: 'success',
          message: 'Login exitoso',
          token: `Bearer ${token}`,
          user: {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
          }
        });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

// Current user 
router.get('/current', (req, res, next) => {
  console.log('🔍 CURRENT ENDPOINT - Iniciando autenticación...');
  
  passport.authenticate('current', { session: false }, (err, user, info) => {
    console.log('🔍 CURRENT ENDPOINT - Callback de authenticate');
    console.log('🔍 CURRENT ENDPOINT - Error:', err);
    console.log('🔍 CURRENT ENDPOINT - User:', user ? user.email : 'NO USER');
    console.log('🔍 CURRENT ENDPOINT - Info:', info);
    
    if (err) {
      console.log('❌ CURRENT ENDPOINT - Error de autenticación:', err.message);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Error de autenticación',
        error: err.message 
      });
    }
    
    if (!user) {
      console.log('❌ CURRENT ENDPOINT - Usuario no autenticado');
      return res.status(401).json({ 
        status: 'error', 
        message: 'No autorizado',
        info: info 
      });
    }
    
    console.log('✅ CURRENT ENDPOINT - Usuario autenticado:', user.email);
    res.json({
      status: 'success',
      payload: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart
      }
    });
  })(req, res, next);
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    // Verificar si el usuario ya existe
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

    // Generar token automáticamente después del registro
    const payload = {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role
    };

    const token = jwt.sign(
      payload, 
      'mi_clave_super_secreta_comision_74275_coderhouse_2024' || 'secreto_desarrollo_74275',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      token: `Bearer ${token}`,
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

export default router;