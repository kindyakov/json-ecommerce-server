export function getFavorites(userId) {
  let favorites = global.DB.get('favorites').filter({ userId }).value();

  if (favorites.length) {
    favorites = favorites.map(item =>
      global.DB.get('products').find({ id: item.productId }).value()
    );
  }

  return favorites
}