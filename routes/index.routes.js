import express from 'express';
import authRouter from './auth.routes.js';
import paymentRouter from './payment.routes.js';
import deliveryRouter from './delivery.routes.js'

import { checkAuth } from '../middlewares/auth.middleware.js';
import { filters } from '../controllers/filters.controller.js';
import { feedbacks } from '../controllers/feedbacks.controller.js';
import { register } from '../controllers/register.controller.js';
import { auth } from '../controllers/auth.controller.js';
import { addWithBasket, deleteFromBasket, basket } from '../controllers/basket.controller.js';
import { favorites, toggleFavorites } from '../controllers/favorites.controller.js';
import { profile } from '../controllers/profile.controller.js';
import { createOrder, getOrders, getOrder, updateOrder } from '../controllers/order.controller.js';
import { getProducts } from '../controllers/products.controller.js';
import { search } from '../controllers/search.controller.js';

const routes = express.Router();

routes.use('/auth', authRouter);
routes.use('/payment', paymentRouter);
routes.use('/delivery', deliveryRouter);

routes.route('/register').post(register)
// routes.route('/auth').post(auth)

// Отзывы
routes.route('/feedbacks').get(feedbacks)

// Каталог
routes.route('/filters/:categorySlug?/:subCategorySlug?').get(filters)

// Товары
routes.route('/products').get(getProducts)

// Корзина
routes.route('/basket')
  .get(checkAuth, basket)
  .delete(checkAuth, deleteFromBasket);
routes.route('/basket/:productId')
  .post(checkAuth, addWithBasket)

// Избранные
routes.route('/favorites').get(checkAuth, favorites)
routes.route('/favorites/:productId').put(checkAuth, toggleFavorites);

// Профиль
routes.route('/profile').get(checkAuth, profile)

// Заказы
routes.route('/order')
  .post(checkAuth, createOrder)
  .get(checkAuth, getOrders)

routes.route('/order/:id')
  .get(checkAuth, getOrder)
  .put(checkAuth, updateOrder)

// Поиск
routes.route('/search').get(search)

export default routes;