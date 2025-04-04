export function getFavorites(userId) {
  let favorites = global.__DB__.get('favorites').filter({ userId }).value();

  if (favorites.length) {
    favorites = favorites.map(item =>
      global.__DB__.get('products').find({ id: item.productId }).value()
    );
  }

  return favorites
}