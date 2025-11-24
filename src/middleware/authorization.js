// Middleware para verificar si el usuario es administrador
export const isAdmin = (req, res, next) => {
  console.log('🔐 MIDDLEWARE - Verificando rol de administrador...');
  
  if (!req.user) {
    console.log('❌ MIDDLEWARE - Usuario no autenticado');
    return res.status(401).json({
      status: 'error',
      message: 'No autorizado - usuario no autenticado'
    });
  }

  if (req.user.role !== 'admin') {
    console.log('❌ MIDDLEWARE - Usuario no es administrador:', req.user.email);
    return res.status(403).json({
      status: 'error',
      message: 'Acceso denegado - Se requiere rol de administrador'
    });
  }

  console.log('✅ MIDDLEWARE - Usuario es administrador:', req.user.email);
  next();
};

// Middleware para verificar si el usuario es user normal
export const isUser = (req, res, next) => {
  console.log('🔐 MIDDLEWARE - Verificando rol de usuario...');
  
  if (!req.user) {
    console.log('❌ MIDDLEWARE - Usuario no autenticado');
    return res.status(401).json({
      status: 'error',
      message: 'No autorizado - usuario no autenticado'
    });
  }

  if (req.user.role !== 'user') {
    console.log('❌ MIDDLEWARE - Usuario no tiene rol user:', req.user.email);
    return res.status(403).json({
      status: 'error',
      message: 'Acceso denegado - Se requiere rol de usuario'
    });
  }

  console.log('✅ MIDDLEWARE - Usuario tiene rol user:', req.user.email);
  next();
};

// Middleware para verificar si es user O admin
export const isUserOrAdmin = (req, res, next) => {
  console.log('🔐 MIDDLEWARE - Verificando rol (user o admin)...');
  
  if (!req.user) {
    console.log('❌ MIDDLEWARE - Usuario no autenticado');
    return res.status(401).json({
      status: 'error',
      message: 'No autorizado - usuario no autenticado'
    });
  }

  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    console.log('❌ MIDDLEWARE - Rol no válido:', req.user.role);
    return res.status(403).json({
      status: 'error',
      message: 'Acceso denegado - Rol no válido'
    });
  }

  console.log('✅ MIDDLEWARE - Rol válido:', req.user.role, '-', req.user.email);
  next();
};