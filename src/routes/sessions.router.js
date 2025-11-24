import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UserService from '../services/user.service.js';
// ✅ IMPORTACIONES CORREGIDAS
import UserRepository from '../dao/repositories/user.repository.js';
import UserDTO from '../dao/dtos/user.dto.js';
import { isAdmin, isUser, isUserOrAdmin } from '../middleware/authorization.js';
import PasswordReset from '../models/passwordReset.model.js';
import { EmailService } from '../services/email.service.js';

const router = Router();
const userService = new UserService();
const userRepository = new UserRepository();

// ✅ CURRENT USER - CON REPOSITORY + DTO (VERSIÓN CORREGIDA)
router.get('/current', async (req, res, next) => {
  console.log('🔍 CURRENT ENDPOINT - Iniciando autenticación...');
  
  passport.authenticate('current', { session: false }, async (err, user, info) => {
    console.log('🔍 CURRENT ENDPOINT - Callback de authenticate');
    
    try {
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
      
      // ✅ USAR USER REPOSITORY para obtener usuario sin datos sensibles
      const cleanUser = await userRepository.getUserWithoutSensitiveData(user._id);
      
      if (!cleanUser) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuario no encontrado'
        });
      }
      
      // ✅ USAR DTO para la respuesta (sin información sensible)
      const userDTO = new UserDTO(cleanUser);
      
      console.log('✅ CURRENT ENDPOINT - DTO generado sin información sensible');
      
      res.json({
        status: 'success',
        payload: userDTO
      });
      
    } catch (error) {
      console.error('❌ CURRENT ENDPOINT - Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  })(req, res, next);
});

// ✅ MANTENEMOS TODAS LAS OTRAS RUTAS SIN CAMBIOS
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

router.post('/register', async (req, res) => {
  try {
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

router.post('/register-admin', async (req, res) => {
  try {
    const userData = {
      ...req.body,
      role: 'admin'
    };

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

// ✅ MANTENEMOS RUTAS DE PRUEBA
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

// ✅ MANTENEMOS SISTEMA DE RECUPERACIÓN
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'El email es requerido'
      });
    }

    try {
      const userDTO = await userService.loginUser(email, 'dummy');
      
      const resetToken = crypto.randomBytes(32).toString('hex');

      const passwordReset = new PasswordReset({
        userId: userDTO.id,
        token: resetToken,
      });

      await passwordReset.save();

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

    const isSamePassword = user.isValidPassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        status: 'error',
        message: 'La nueva contraseña no puede ser igual a la anterior'
      });
    }

    await userService.updateUserProfile(user._id, { password: newPassword });

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