import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as VKStrategy } from 'passport-vkontakte';
import { Strategy as YandexStrategy } from 'passport-yandex';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Для чтения переменных окружения (JWT_SECRET, VK_CLIENT_ID, и т.д.)
dotenv.config();

/**
 * Эта функция позже пригодится, чтобы находить пользователя в JSON:
 * db.get('users').find({ phone: ... }).value()
 * или создавать, если нет
 */
function findOrCreateUser(db, userData) {
  const { phone, vkId, yandexId, password } = userData;
  let existingUser;

  // Пробуем найти по телефону, если он передан
  if (phone) {
    existingUser = db.get('users').find({ phone }).value();
  }
  // Или по vkId
  if (vkId) {
    existingUser = db.get('users').find({ vkId }).value();
  }
  // Или по yandexId
  if (yandexId) {
    existingUser = db.get('users').find({ yandexId }).value();
  }

  // Если есть - возвращаем
  if (existingUser) {
    return existingUser;
  }

  // Если нет, создаём нового
  const newUser = {
    id: Date.now(),
    name: userData.name || '',
    phone: phone || '',
    vkId: vkId || null,
    yandexId: yandexId || null,
    password: password || null,
    createdAt: new Date()
  };

  db.get('users').push(newUser).write();

  return newUser;
}


/**
 * Локальная стратегия (phone + password)
 */
passport.use(new LocalStrategy(
  {
    usernameField: 'phone', // По умолчанию поле "username", меняем на "phone"
    passwordField: 'password'
  },
  async (phone, password, done) => {
    try {
      // Подключаемся к db через специальное поле, которое мы добавим в server.js
      const db = global.__DB__;
      const user = db.get('users').find({ phone }).value();

      if (!user) {
        return done(null, false, { message: 'Пользователь не найден' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return done(null, false, { message: 'Неверный пароль' });
      }
      // Если всё ок
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

/**
 * Стратегия ВКонтакте
 */
passport.use(new VKStrategy(
  {
    clientID: process.env.VK_CLIENT_ID,
    clientSecret: process.env.VK_CLIENT_SECRET,
    callbackURL: 'http://localhost:8888/auth/vk/callback' // Важно настроить в ВК
  },
  async (accessToken, refreshToken, params, profile, done) => {
    try {
      const db = global.__DB__;

      const userData = {
        vkId: profile.id,
        name: (profile.displayName) || ''
      };

      const user = findOrCreateUser(db, userData);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

/**
 * Стратегия Яндекс
 */
passport.use(new YandexStrategy(
  {
    clientID: process.env.YANDEX_CLIENT_ID,
    clientSecret: process.env.YANDEX_CLIENT_SECRET,
    callbackURL: 'http://localhost:8888/auth/yandex/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const db = global.__DB__;

      const userData = {
        yandexId: profile.id,
        name: profile.displayName || ''
      };

      const user = findOrCreateUser(db, userData);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

/**
 * Если хотите проверять JWT через Passport — используйте passport-jwt
 */
passport.use(new JwtStrategy(
  {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  },
  (payload, done) => {
    // payload — это { id, phone, iat, exp }, которые вы зашиваете в JWT
    try {
      const db = global.__DB__;

      const user = db.get('users').find({ id: payload.id }).value();

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

/**
 * Сериализация / десериализация пользователя (для сессий)
 * Если вы хотите работать только через JWT и не использовать session(),
 * можно опустить. Но оставим на всякий случай:
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const db = global.__DB__;
    const user = db.get('users').find({ id }).value();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;