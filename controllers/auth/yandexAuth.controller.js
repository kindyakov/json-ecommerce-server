import passport from 'passport';
import { createToken } from '../../helpers/createToken.js';

export const yandexAuth = passport.authenticate('yandex', { session: false });

export const yandexCallback = (req, res, next) => {
  passport.authenticate('yandex', { session: false, failureRedirect: '/login-failed' },
    (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.redirect('/login-failed');
      }

      const token = createToken(user);

      // res.cookie('token', token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production', // В продакшене true, в dev – false
      //   sameSite: 'lax', // или 'strict', чтобы повысить защиту от CSRF
      //   maxAge: 24 * 60 * 60 * 1000 // 1 день
      // });

      return res.redirect(`${global.CLIENT_URL}/auth-success?token=${token}`);
    }
  )(req, res, next);
};
