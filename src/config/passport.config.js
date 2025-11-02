import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose'; 
import User from '../models/user.model.js';

// Estrategia Local para login
passport.use('login', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log('❌ User not found:', email);
        return done(null, false, { message: 'Usuario no encontrado' });
      }
      
      if (!user.isValidPassword(password)) {
        console.log('❌ Invalid password for:', email);
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
      
      console.log('✅ Login successful for:', email);
      return done(null, user);
    } catch (error) {
      console.log('❌ Login error:', error.message);
      return done(error);
    }
  }
));

// Estrategia JWT
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'mi_clave_super_secreta_comision_74275_coderhouse_2024' || 'secreto_desarrollo_74275'
};
// ✅ LOG :
console.log('🔐 PASSPORT - JWT_SECRET configurado:', 'mi_clave_super_secreta_comision_74275_coderhouse_2024' || 'USANDO POR DEFECTO');

// Estrategia "current" con DEBUG COMPLETO
passport.use('current', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    console.log('🔐 CURRENT - Payload recibido:', payload);
    console.log('🔐 CURRENT - Buscando usuario ID:', payload.id);
    
    // Verificar que el ID sea válido
    if (!mongoose.Types.ObjectId.isValid(payload.id)) {
      console.log('❌ CURRENT - ID inválido:', payload.id);
      return done(null, false, { message: 'ID de usuario inválido' });
    }
    
    const user = await User.findById(payload.id).select('-password');
    
    if (user) {
      console.log('✅ CURRENT - Usuario encontrado:', user.email);
      return done(null, user);
    } else {
      console.log('❌ CURRENT - Usuario NO encontrado con ID:', payload.id);
      console.log('❌ CURRENT - Payload completo:', payload);
      return done(null, false, { message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.log('❌ CURRENT - Error en estrategia:', error.message);
    return done(error, false);
  }
}));

console.log('✅ Passport strategies configured successfully');

export default passport;