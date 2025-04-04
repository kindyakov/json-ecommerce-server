import passport from 'passport';
import { createToken } from '../../helpers/createToken.js';
import { getBasket } from '../../helpers/getBasket.js';
import { getFavorites } from '../../helpers/getFavorites.js';

export const localAuthController = (req, res, next) => {
  // Вызовем стратегию 'local' вручную через passport.authenticate
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.json({
        message: info?.message || 'Ошибка авторизации',
        status: 'error'
      });
    }

    const token = createToken(user);
    const { basket, basketTotal } = getBasket(user.id)
    const favorites = getFavorites(user.id)

    return res.json({
      message: 'Успешная авторизация!',
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
      basket,
      favorites,
      basketTotal,
    });
  })(req, res, next);
};
