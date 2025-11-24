import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UserService from '../services/user.service.js';
import { isAdmin, isUser, isUserOrAdmin } from '../middleware/authorization.js';
import PasswordReset from '../models/passwordReset.model.js';
import { EmailService } from '../services/email.service.js';

const router = Router();
const userService = new UserService();

// ✅ ENDPOINT DEBUG TEMPORAL
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
    const decoded = jwt.verify(token, 'mi_clave_super_secreta_comision_74275_coderhouse_2024');
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

// ✅ LOGIN - USANDO USER SERVICE
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

        try {
          // ✅ USAR USER SERVICE para validar login
          const userDTO = await userService.loginUser(user.email, req.body.password);
          
          const payload = {
            id: userDTO.id,
            email: userDTO.email,
            role: userDTO.role
          };

          console.log('🔐 LOGIN - JWT_SECRET usado: mi_clave_super_secreta_comision_74275_coderhouse_2024');

          const token = jwt.sign(
            payload, 
            'mi_clave_super_secreta_comision_74275_coderhouse_2024',
            { expiresIn: '24h' }
          );

          return res.json({
            status: 'success',
            message: 'Login exitoso',
            token: `Bearer ${token}`,
            user: userDTO.toJSON()
          });
        } catch (loginError) {
          return res.status(401).json({
            status: 'error',
            message: loginError.message
          });
        }
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

// ✅ REGISTER - USANDO USER SERVICE
router.post('/register', async (req, res) => {
  try {
    // ✅ USAR USER SERVICE para registro
    const userDTO = await userService.registerUser(req.body);
    
    const payload = {
      id: userDTO.id,
      email: userDTO.email,
      role: userDTO.role
    };

    const token = jwt.sign(
      payload, 
      'mi_clave_super_secreta_comision_74275_coderhouse_2024',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      token: `Bearer ${token}`,
      user: userDTO.toJSON()
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// ✅ REGISTER ADMIN - USANDO USER SERVICE
router.post('/register-admin', async (req, res) => {
  try {
    const userData = {
      ...req.body,
      role: 'admin' // ✅ Siempre crea como admin
    };

    // ✅ USAR USER SERVICE para registro de admin
    const userDTO = await userService.registerUser(userData);
    
    const payload = {
      id: userDTO.id,
      email: userDTO.email,
      role: userDTO.role
    };

    const token = jwt.sign(
      payload, 
      'mi_clave_super_secreta_comision_74275_coderhouse_2024',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Usuario ADMIN registrado exitosamente',
      token: `Bearer ${token}`,
      user: userDTO.toJSON()
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// ✅ CURRENT USER - CON DTO
router.get('/current', (req, res, next) => {
  console.log('🔍 CURRENT ENDPOINT - Iniciando autenticación...');
  
  passport.authenticate('current', { session: false }, (err, user, info) => {
    console.log('🔍 CURRENT ENDPOINT - Callback de authenticate');
    
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
    
    // ✅ USAR DTO para la respuesta
    const userDTO = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      age: user.age,
      role: user.role,
      cart: user.cart
    };
    
    res.json({
      status: 'success',
      payload: userDTO
    });
  })(req, res, next);
});

// ✅ RUTAS DE PRUEBA PARA MIDDLEWARES
router.get('/test/admin', 
  passport.authenticate('current', { session: false }),
  isAdmin,
  (req, res) => {
    res.json({
      status: 'success',
      message: '✅ Acceso permitido - Eres administrador',
      user: req.user.email
    });
  }
);

router.get('/test/user', 
  passport.authenticate('current', { session: false }),
  isUser,
  (req, res) => {
    res.json({
      status: 'success',
      message: '✅ Acceso permitido - Eres usuario normal',
      user: req.user.email
    });
  }
);

router.get('/test/user-or-admin', 
  passport.authenticate('current', { session: false }),
  isUserOrAdmin,
  (req, res) => {
    res.json({
      status: 'success',
      message: `✅ Acceso permitido - Rol: ${req.user.role}`,
      user: req.user.email
    });
  }
);

// ✅ SISTEMA DE RECUPERACIÓN DE CONTRASEÑA

// 1. Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'El email es requerido'
      });
    }

    // ✅ USAR USER SERVICE para buscar usuario
    try {
      const userDTO = await userService.loginUser(email, 'dummy'); // Solo para verificar que existe
      
      // Generar token único
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Crear registro de recuperación
      const passwordReset = new PasswordReset({
        userId: userDTO.id,
        token: resetToken,
      });

      await passwordReset.save();

      // Enviar email
      await EmailService.sendPasswordResetEmail(
        userDTO.email, 
        resetToken, 
        `${userDTO.first_name} ${userDTO.last_name}`
      );

      res.json({
        status: 'success',
        message: 'Si el email existe, se enviarán instrucciones de recuperación'
      });
    } catch (userError) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        status: 'success',
        message: 'Si el email existe, se enviarán instrucciones de recuperación'
      });
    }

  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al procesar la solicitud'
    });
  }
});

// 2. Verificar token de recuperación
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const resetRecord = await PasswordReset.findOne({ token })
      .populate('userId');

    if (!resetRecord || !resetRecord.isValid()) {
      return res.status(400).json({
        status: 'error',
        message: 'Token inválido o expirado'
      });
    }

    res.json({
      status: 'success',
      message: 'Token válido',
      email: resetRecord.userId.email
    });

  } catch (error) {
    console.error('❌ Error verificando token:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar el token'
    });
  }
});

// 3. Restablecer contraseña
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const resetRecord = await PasswordReset.findOne({ token })
      .populate('userId');

    if (!resetRecord || !resetRecord.isValid()) {
      return res.status(400).json({
        status: 'error',
        message: 'Token inválido o expirado'
      });
    }

    const user = resetRecord.userId;

    // Verificar que la nueva contraseña no sea igual a la anterior
    const isSamePassword = user.isValidPassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        status: 'error',
        message: 'La nueva contraseña no puede ser igual a la anterior'
      });
    }

    // Actualizar contraseña usando el Service
    await userService.updateUserProfile(user._id, { password: newPassword });

    // Marcar token como usado
    resetRecord.used = true;
    await resetRecord.save();

    res.json({
      status: 'success',
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('❌ Error restableciendo contraseña:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al restablecer la contraseña'
    });
  }
});

export default router;