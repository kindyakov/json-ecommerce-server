import passport from 'passport';
import { createToken } from '../../helpers/createToken.js';
import { getBasket } from '../../helpers/getBasket.js';
import { getFavorites } from '../../helpers/getFavorites.js';

export const vkAuth = passport.authenticate('vkontakte', { session: false });
// Начинаем авторизацию — это GET /auth/vk

export const vkCallback = (req, res, next) => {
  // Обёртка, чтобы вызвать стратегию, а затем выдать ответ
  passport.authenticate('vkontakte', { session: false, failureRedirect: '/login-failed' },
    (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.redirect('/login-failed');
      }

      const token = createToken(user);
      const { basket, basketTotal } = getBasket(user.id)
      const favorites = getFavorites(user.id)

      return res.json({
        message: 'Успешный вход через ВКонтакте',
        status: 'success',
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone
        },
        basket,
        favorites,
        basketTotal
      });
    }
  )(req, res, next);
};
