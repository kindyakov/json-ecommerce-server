export function getBasket(userId) {
  let basket = global.DB.get('basket').filter({ userId }).value();
  let basketTotal = 0;

  if (basket.length) {
    basket = basket.map(item => {
      const product = global.DB.get('products').find({ id: item.productId }).value();

      if (product) {
        product.quantity = item.quantity;
        product.totalPrice = product.price * item.quantity;
        basketTotal += product.totalPrice;
      }

      return product;
    });
  }

  return { basket, basketTotal };
}