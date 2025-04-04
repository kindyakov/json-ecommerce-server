import express from 'express';
import { localAuthController } from '../controllers/auth/localAuth.controller.js';
import { vkAuth, vkCallback } from '../controllers/auth/vkAuth.controller.js';
import { yandexAuth, yandexCallback } from '../controllers/auth/yandexAuth.controller.js';

const authRouter = express.Router();

// Local
authRouter.post('/local', localAuthController);

// VK
authRouter.get('/vk', vkAuth);
authRouter.get('/vk/callback', vkCallback);

// Yandex
authRouter.get('/yandex', yandexAuth);
authRouter.get('/yandex/callback', yandexCallback);

export default authRouter;
