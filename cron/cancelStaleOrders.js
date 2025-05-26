import cron from 'node-cron';

cron.schedule('*/5 * * * *', () => {
  const staleOrders = global.DB.get('orders')
    .filter(order => order.status === 'pending' && new Date(order.expiresAt).getTime() < Date.now()) // > 30 минут
    .value();

  staleOrders.forEach(order => {
    // Обновить статус заказа
    global.DB.get('orders')
      .find({ id: order.id })
      .assign({ status: 'canceled', updatedAt: new Date().toISOString() })
      .write();

    // Вернуть товары в корзину
    order.productIds.forEach(productId => {
      global.DB.get('basket').push({
        id: Date.now(),
        userId: order.userId,
        productId,
        quantity: 1,
      }).write();
    })

    console.log(`Заказ ${order.id} отменён по таймеру.`);
  });
});
