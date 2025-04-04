import express from 'express';
import authRouter from './auth.routes.js';
import { checkAuth } from '../middlewares/auth.middleware.js';
import { filters } from '../controllers/filters.controller.js';
import { feedbacks } from '../controllers/feedbacks.controller.js';
import { register } from '../controllers/register.controller.js';
import { auth } from '../controllers/auth.controller.js';
import { addWithBasket, deleteFromBasket, basket } from '../controllers/basket.controller.js';
import { favorites, toggleFavorites } from '../controllers/favorites.controller.js';

const routes = express.Router();

routes.use('/auth', authRouter);

routes.route('/register').post(register)
// routes.route('/auth').post(auth)
routes.route('/feedbacks').get(feedbacks)
routes.route('/filters/:categorySlug?/:subCategorySlug?').get(filters)
routes.route('/basket').get(checkAuth, basket)
routes.route('/basket/:productId')
  .post(checkAuth, addWithBasket)
  .delete(checkAuth, deleteFromBasket);
routes.route('/favorites').get(checkAuth, favorites)
routes.route('/favorites/:productId').put(checkAuth, toggleFavorites);


export default routes;