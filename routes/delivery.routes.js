import express from 'express';
import { checkAuth } from '../middlewares/auth.middleware.js';
import { getPoints, getPoint, calcDelivery } from '../controllers/delivery/boxberry.controller.js';

const deliveryRouter = express.Router();

deliveryRouter.get('/boxberry/list-points', checkAuth, getPoints)
deliveryRouter.get('/boxberry/point', checkAuth, getPoint)
deliveryRouter.get('/boxberry/calc-delivery', checkAuth, calcDelivery)

export default deliveryRouter