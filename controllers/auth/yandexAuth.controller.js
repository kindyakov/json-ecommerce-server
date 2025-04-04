import passport from 'passport';
import { createToken } from '../../helpers/createToken.js';
import { getBasket } from '../../helpers/getBasket.js';
import { getFavorites } from '../../helpers/getFavorites.js';

export const yandexAuth = passport.authenticate('yandex', { session: false });

export const yandexCallback = (req, res, next) => {
  passport.authenticate('yandex', { session: false, failureRedirect: '/login-failed' },
    (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.redirect('/login-failed');
      }

      const token = createToken(user);
      const { basket, basketTotal } = getBasket(user.id)
      const favorites = getFavorites(user.id)

      return res.json({
        message: 'Успешный вход через Яндекс',
        status: 'success',
        token,
        user: {
          id: user.id,
          name: user.name
          // ...
        },
        basket,
        favorites,
        basketTotal
      });
    }
  )(req, res, next);
};
