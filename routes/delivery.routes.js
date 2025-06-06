import express from 'express';
import { checkAuth } from '../middlewares/auth.middleware.js';
import { getPoints, getPoint } from '../controllers/boxberry.controller.js';

const deliveryRouter = express.Router();

deliveryRouter.get('/boxberry/list-points', checkAuth, getPoints)
deliveryRouter.get('/boxberry/point', checkAuth, getPoint)

export default deliveryRouter