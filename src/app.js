// src/app.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productViewsRouter from './routes/views/products.router.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductMongoManager from './dao/ProductMongoManager.js';

// Configuración inicial
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8080;

// 🛑 Verificar variables de entorno críticas
if (!process.env.MONGO_URI) {
  console.error('❌ Error: MONGO_URI no está definido en las variables de entorno');
  process.exit(1);
}

// 🚀 Conexión a MongoDB con manejo mejorado de errores
const connectDB = async () => {
  try {
    console.log('🔌 Intentando conectar a MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      
      serverSelectionTimeoutMS: 30000, // 30 segundos de espera
      socketTimeoutMS: 45000,         // 45 segundos para timeout de socket
      family: 4                       // Usar IPv4
    });
    
    console.log('✅ Conectado a MongoDB Atlas');
    
    // Verificación adicional de conexión
    await mongoose.connection.db.admin().ping();
    console.log('🟢 Ping a MongoDB exitoso');
    
    // Eventos de conexión
    mongoose.connection.on('connected', () => {
      console.log('Mongoose conectado a DB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Error de conexión a MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose desconectado de DB');
    });
    
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    
    // Detección de errores específicos
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n🔍 Error de DNS: No se puede resolver el nombre del host de MongoDB Atlas');
      console.error('Verifica que la URL de conexión sea correcta\n');
    } else if (error.message.includes('whitelist')) {
      console.error('\n🔒 Solución: Agrega tu IP actual a la whitelist en MongoDB Atlas:');
      console.error('1. Ve a https://cloud.mongodb.com');
      console.error('2. Selecciona tu cluster');
      console.error('3. Ve a "Network Access"');
      console.error('4. Haz clic en "Add Current IP Address"\n');
    } else if (error.message.includes('bad auth')) {
      console.error('\n🔐 Error de autenticación: Verifica usuario y contraseña\n');
    } else if (error.message.includes('timed out')) {
      console.error('\n⏱️ Timeout de conexión: Aumenta los valores de serverSelectionTimeoutMS y socketTimeoutMS\n');
    }
    
    process.exit(1);
  }
};

// Inicializar Express y servidor HTTP
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// ⚙️ Configuración de Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// 📂 Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// 📦 Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);
app.use('/products', productViewsRouter);

// Manejo de WebSockets
const productManager = new ProductMongoManager();

io.on('connection', async (socket) => {
  console.log('🟢 Cliente conectado via WebSocket');

  try {
    const initialProducts = await productManager.getProducts({ limit: 10, page: 1 });
    socket.emit('updateProducts', initialProducts.docs);
  } catch (error) {
    console.error('Error al obtener productos iniciales:', error);
  }

  socket.on('newProduct', async (productData) => {
    try {
      await productManager.addProduct(productData);
      const updatedProducts = await productManager.getProducts({ limit: 10, page: 1 });
      io.emit('updateProducts', updatedProducts.docs);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      socket.emit('error', { message: 'Error al agregar producto' });
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      await productManager.deleteProduct(productId);
      const updatedProducts = await productManager.getProducts({ limit: 10, page: 1 });
      io.emit('updateProducts', updatedProducts.docs);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      socket.emit('error', { message: 'Error al eliminar producto' });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// Manejo de errores global
process.on('unhandledRejection', (err) => {
  console.error('Error no capturado:', err);
});

// Iniciar servidor después de conectar a DB
const startServer = async () => {
  try {
    await connectDB(); // Aquí está el await principal para la conexión a DB
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();