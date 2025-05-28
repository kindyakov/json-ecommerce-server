import bcrypt from 'bcrypt';
import { createToken } from '../helpers/createToken.js';

export const auth = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { password, phone } = req.body;

    const user = db.get('users').find({ phone }).value();

    if (!user) {
      return res.json({ message: 'Пользователь с таким телефоном не найден', status: 'error' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.json({ message: 'Неверный пароль', status: 'error' });
    }

    const token = createToken(user);

    let basket = db.get('basket').filter({ userId: user.id }).value();
    let favorites = db.get('favorites').filter({ userId: user.id }).value();
    let basketTotal = 0;

    if (basket.length) {
      basket = basket.map(item => {
        // Получаем актуальные данные товара по productId
        const product = db.get('products').find({ id: item.productId }).value();
        if (product) {
          product.quantity = item.quantity;
          product.totalPrice = product.price * item.quantity;
          basketTotal += product.totalPrice;
        }
        return product;
      });
    }

    if (favorites.length) {
      favorites = favorites.map(item =>
        db.get('products').find({ id: item.productId }).value()
      );
    }

    res.json({
      message: 'Вы успешно авторизовались!',
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
      basket,
      favorites,
      basketTotal
    })
  } catch (error) {
    return res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя', status: 'error' });
  }
}