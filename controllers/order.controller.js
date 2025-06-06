import { v4 as uuidv4 } from 'uuid';
import { PaymentMethods } from '../settings/paymentMethods.js';

export const createOrder = (req, res) => {
  try {
    const { products } = req.body;
    let total = 0;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста.', status: 'error' });
    }

    for (const { id, quantity } of products) {
      const product = global.DB.get('products').find({ id }).value();

      if (!product) {
        return res.status(404).json({ message: `Товар ${id} не найден.`, status: 'error' });
      }

      total += product.price * quantity;
    }

    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ message: 'Некорректная сумма заказа.', status: 'error' });
    }

    const user = global.DB.get('users').find({ id: req.user.id }).value();

    const order = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: 'pending',
      total,
      countProduct: products?.reduce((acc, item) => acc + item.quantity || 0, 0),
      products: products.map(({ id, quantity }) => ({ id, quantity })),
      userId: req.user.id,
      client: {
        name: user.name || '',
        surname: user.surname || '',
        phone: user.phone || '',
      },
      deliveryId: null,
      payment: {
        method: null,
        status: null,
        id: null
      },
      comment: null,
      discount: 0
    }

    global.DB.get('orders').push(order).write();

    global.DB.get('basket')
      .remove(item => item.userId === req.user.id && products.some(p => p.id === item.productId))
      .write();

    res.json({ message: 'Заказ создан!', status: 'success', orderId: order.id })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Произошла ошибка при создании Заказа!', status: 'error' });
  }
}

export const updateOrder = (req, res) => {
  const { id } = req.params;
  const { delivery } = req.body;

  const order = { ...global.DB.get('orders').find({ userId: req.user.id, id }).value() }

  if (!order) {
    return res.status(404).json({ message: `Заказ ${id} не найден.`, status: 'error' });
  }

  global.DB
    .get('orders')
    .find({ userId: req.user.id, id })
    .assign({ delivery })
    .write();

  order.products = order.products.map(({ id, quantity }) => {
    return { ...global.DB.get('products').find({ id }).value(), quantity }
  })

  res.json(order)
}

export const getOrders = (req, res) => {
  const orders = [...global.DB.get('orders').filter({ userId: req.user.id, }).value()]

  for (const order of orders) {
    order.products = order.products.map(({ id, quantity }) => {
      return { ...global.DB.get('products').find({ id }).value(), quantity }
    })
  }

  res.json(orders)
}

export const getOrder = (req, res) => {
  const { id } = req.params;
  const order = { ...global.DB.get('orders').find({ userId: req.user.id, id }).value() }
  const user = global.DB.get('users').find({ id: req.user.id }).value()

  if (!order) {
    return res.status(404).json({ message: `Заказ ${id} не найден.`, status: 'error' });
  }
  const userDeliveries = global.DB.get('delivery').filter({ userId: user.id }).value();

  // Сортируем доставки по дате создания (от новых к старым)
  userDeliveries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let uniqueDeliveries = [];
  const addressSet = new Set();

  if (user.lastDeliveryId) {
    const lastDelivery = userDeliveries.find(d => d.id === user.lastDeliveryId);
    if (lastDelivery) {
      uniqueDeliveries.push(lastDelivery);
      addressSet.add(lastDelivery.address);
    }
  }

  for (const delivery of userDeliveries) {
    if (!addressSet.has(delivery.address)) {
      uniqueDeliveries.push(delivery);
      addressSet.add(delivery.address);
    }
  }

  if (userDeliveries.length) {
    uniqueDeliveries = uniqueDeliveries.map(({ address, cost, data, id, method }) => ({ address, cost, data, id, method }))
  }

  order.products = order.products.map(({ id, quantity }) => ({
    ...global.DB.get('products').find({ id }).value(),
    quantity
  }));

  res.json({
    ...order,
    delivery: uniqueDeliveries,
    paymentMethods: PaymentMethods()
  })
}