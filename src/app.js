// src/app.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';
import connectDB from './config/db.js';
import productViewsRouter from './routes/views/products.router.js';



import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductMongoManager from './dao/ProductMongoManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

connectDB();

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
app.use(methodOverride('_method'));

// 📦 Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);
app.use('/products', productViewsRouter);


// 🧠 Lógica de productos para WebSocket usando MongoDB
const productManager = new ProductMongoManager();

io.on('connection', async (socket) => {
  console.log('🟢 Cliente conectado via WebSocket');

  // Enviar lista inicial de productos (página 1, limit 10, sin filtro ni orden)
  const initialProducts = await productManager.getProducts({ limit: 10, page: 1 });
  socket.emit('updateProducts', initialProducts.docs);

  // Escuchar creación de producto
  socket.on('newProduct', async (productData) => {
    await productManager.addProduct(productData);
    const updatedProducts = await productManager.getProducts({ limit: 10, page: 1 });
    io.emit('updateProducts', updatedProducts.docs);
  });

  // Escuchar eliminación de producto
  socket.on('deleteProduct', async (productId) => {
    await productManager.deleteProduct(productId); // ID es string MongoID
    const updatedProducts = await productManager.getProducts({ limit: 10, page: 1 });
    io.emit('updateProducts', updatedProducts.docs);
  });
});

// Arrancar el servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
