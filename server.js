import jsonServer from 'json-server';
import dotenv from 'dotenv'
import path from 'path';
import express from 'express';
import passport from './passport.config.js';
import routes from './routes/index.routes.js';
import { paginationMiddleware } from './middlewares/pagination.middleware.js';

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const PORT = process.env.PORT
const HOST = process.env.HOST

server.locals.db = router.db; // экземпляр lowdb
global.DB = router.db; // экземпляр lowdb
global.URL = `${HOST}:${PORT}`

// Подключаем дефолтных посредников (logger, static, cors, no-cache)
server.use(middlewares);

server.use(
  express.static(path.join(process.cwd(), 'public'))
);

// 4) SPA-fallback: любые URL, не начинающиеся с /api, → index.html
server.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

server.use(jsonServer.bodyParser);

server.use(paginationMiddleware) // Пагинация

server.use(passport.initialize()); // Инициализация Passport

server.use('/api', routes) // Мои роутеры

// Дополнительный middleware для обработки POST запросов
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
  }
  next(); // 
});

server.use('/api', router); // Стандартные роутеры JSON Server 

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен...`);
  console.log(`🔗 http://${global.URL}`);
});
