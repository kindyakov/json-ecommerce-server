export const basket = (req, res) => {
  const db = req.app.locals.db;

  let basket = db.get('basket').filter({ userId: req.user.id }).value();
  let basketTotal = 0

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

  res.json(basket)
}

export const addWithBasket = (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  const db = req.app.locals.db;

  const product = db.get('products').find({ id: +productId }).value()

  if (!product) {
    return res.json({ message: 'Товар не найден!', status: 'error' });
  }

  const checkInBasket = db.get('basket').find({ userId: req.user.id, productId: +productId }).value()

  if (checkInBasket) {
    db.get('basket')
      .find({ userId: req.user.id, productId: +productId })
      .assign({ quantity })
      .write();

    res.json({ message: 'Товар обновлен в корзине!', status: 'success' })
  } else {
    db.get('basket').push({
      id: Date.now(),
      userId: req.user.id,
      productId: +productId,
      quantity,
    }).write();

    return res.json({ message: 'Товар добавлен в корзину!', status: 'success' })
  }
}

export const deleteFromBasket = (req, res) => {
  const { productId } = req.params;
  const db = req.app.locals.db;

  const product = db.get('products').find({ id: +productId }).value()

  if (!product) {
    return res.json({ message: 'Товар не найден!', status: 'error' });
  }

  const checkInBasket = db.get('basket').find({ userId: req.user.id, productId: +productId }).value()

  if (!checkInBasket) {
    res.json({ message: 'Товар отсутствует в корзине!', status: 'error' });
  } else {
    db.get('basket')
      .remove({ userId: req.user.id, productId: +productId })
      .write();
  }

  res.json({ message: 'Товар удален из корзины!', status: 'success' })
}
