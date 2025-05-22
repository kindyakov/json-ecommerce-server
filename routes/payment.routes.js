import express from 'express';
import { checkAuth } from '../middlewares/auth.middleware.js';
import { createPayment } from '../controllers/payment.controller.js';
import { notificationsPayment } from '../controllers/payment.controller.js'

const paymentRouter = express.Router();

paymentRouter.post('/', checkAuth, createPayment)
paymentRouter.post('/notifications', notificationsPayment)

export default paymentRouter