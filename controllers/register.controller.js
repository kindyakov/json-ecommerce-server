import bcrypt from 'bcrypt';
import { createToken } from '../helpers/createToken.js';

export const register = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const checkUser = db.get('users').find({ phone: req.body.phone }).value()

    if (checkUser) {
      return res.json({ message: 'Пользователь с таким телефоном уже существует', status: 'error' })
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = {
      id: Date.now(),
      name: req.body.name,
      surname: '',
      patronymic: '',
      phone: req.body.phone,
      email: '',
      birthday: null,
      photo: null,
      age: null,
      vkId: null,
      yandexId: null,
      password: hashedPassword,
      createdAt: new Date()
    };

    db.get('users').push(user).write();

    const token = createToken(user);

    res.json({
      message: 'Вы успешно зарегистрировались!',
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
      basket: [],
      favorites: [],
    })
  } catch (error) {
    return res.status(500).json({ error: 'Произошла ошибка при регистрации пользователя' });
  }
}