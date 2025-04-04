import jsonServer from 'json-server';
import dotenv from 'dotenv'
import passport from './passport.config.js';
import routes from './routes/index.routes.js';
import { paginationMiddleware } from './middlewares/pagination.middleware.js';

dotenv.config();

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const PORT = 8888;

server.locals.db = router.db; // экземпляр lowdb
global.__DB__ = router.db;

// Подключаем дефолтных посредников (logger, static, cors, no-cache)
server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use(paginationMiddleware) // Пагинация


server.use(passport.initialize()); // Инициализация Passport

server.use(routes) // Мои роутеры

// Дополнительный middleware для обработки POST запросов
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
  }
  next(); // 
});

server.use(router); // Стандартные роутеры JSON Server 

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});
