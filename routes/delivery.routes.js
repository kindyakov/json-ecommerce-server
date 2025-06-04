import express from 'express';
import { checkAuth } from '../middlewares/auth.middleware.js';
import { getCities } from '../controllers/boxberry.controller.js';

const deliveryRouter = express.Router();

deliveryRouter.get('/boxberry', checkAuth, getCities)

export default deliveryRouter