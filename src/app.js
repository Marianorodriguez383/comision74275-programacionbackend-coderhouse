// src/app.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

const httpServer = createServer(app);
const io = new Server(httpServer);

// ⚙️ Handlebars setup
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// 📂 Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 📦 Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Cambié '/views' a '/' para acceder a las vistas sin prefijo
app.use('/', viewsRouter);

// 🧠 Lógica de productos para WebSocket 
// Corregí la ruta al archivo JSON para que apunte bien a la carpeta 'data' fuera de 'src'
const productManager = new ProductManager(path.join(__dirname, '../data/products.json'));

// 🔌 WebSocket
io.on('connection', async (socket) => {
  console.log('🟢 Cliente conectado via WebSocket');

  // Enviar lista inicial de productos
  socket.emit('updateProducts', await productManager.getProducts());

  // Escuchar creación de producto
  socket.on('newProduct', async (productData) => {
    await productManager.addProduct(productData);
    const updatedProducts = await productManager.getProducts();
    io.emit('updateProducts', updatedProducts);
  });

  // Escuchar eliminación de producto
  socket.on('deleteProduct', async (productId) => {
    await productManager.deleteProduct(parseInt(productId));
    const updatedProducts = await productManager.getProducts();
    io.emit('updateProducts', updatedProducts);
  });
});

// Arrancar el servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
