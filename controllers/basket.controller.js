import { getBasket } from '../helpers/getBasket.js';

export const basket = (req, res) => {
  const { basket, basketTotal } = getBasket(req.user.id);
  res.json(basket)
}

export const addWithBasket = (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  const product = global.DB.get('products').find({ id: +productId }).value()

  if (!product) {
    return res.json({ message: 'Товар не найден!', status: 'error' });
  }

  const checkInBasket = global.DB.get('basket').find({ userId: req.user.id, productId: +productId }).value()

  if (checkInBasket) {
    global.DB.get('basket')
      .find({ userId: req.user.id, productId: +productId })
      .assign({ quantity })
      .write();

    res.json({ message: 'Товар обновлен в корзине!', status: 'success' })
  } else {
    global.DB.get('basket').push({
      id: Date.now(),
      userId: req.user.id,
      productId: +productId,
      quantity,
    }).write();

    return res.json({ message: 'Товар добавлен в корзину!', status: 'success' })
  }
}

export const deleteFromBasket = (req, res) => {
  const productIds = req.body || [];

  if (!productIds.length) {
    return res.json({ message: 'Не передан массив id товаров!', status: 'error' })
  }

  const itemsInBasket = global.DB.get('basket')
    .filter(item => item.userId === req.user.id && productIds.includes(item.productId))
    .value();

  if (!itemsInBasket.length) {
    return res.json({ message: 'Ни один из указанных товаров не найден в корзине!', status: 'error' });
  }

  global.DB.get('basket')
    .remove(item => item.userId === req.user.id && productIds.includes(item.productId))
    .write();

  res.json({ message: 'Товары удалены из корзины!', status: 'success' });
}
