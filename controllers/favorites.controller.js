export const favorites = (req, res) => {
  const db = req.app.locals.db;
  let favorites = db.get('favorites').filter({ userId: user.id }).value();

  if (favorites.length) {
    favorites = favorites.map(item =>
      db.get('products').find({ id: item.productId }).value()
    );
  }
  res.json(favorites)
}

export const toggleFavorites = (req, res) => {
  const { productId } = req.params;
  const db = req.app.locals.db;

  const product = db.get('products').find({ id: +productId }).value()

  if (!product) {
    return res.json({ message: 'Товар не найден!', status: 'error' });
  }

  const checkInFavorites = db.get('favorites').find({ userId: req.user.id, productId: +productId }).value()

  if (checkInFavorites) {
    db.get('favorites')
      .remove({ userId: req.user.id, productId: +productId })
      .write();

    return res.json({ message: 'Товар удален из избранного!', status: 'success' });
  } else {
    db.get('favorites').push({
      id: Date.now(),
      userId: req.user.id,
      productId: +productId,
    }).write();

    return res.json({ message: 'Товар добавлен в избранное!', status: 'success' });
  }
};