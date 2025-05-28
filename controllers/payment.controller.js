import { v4 as uuidv4 } from 'uuid';

export const createPayment = async (req, res) => {
  try {
    const { return_url, orderId, payment_method_type = 'bank_card' } = req.body
    const order = global.DB.get('orders').find({ id: orderId }).value();

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден.', status: 'error' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Заказ уже оплачен или отменён.', status: 'error' });
    }

    const createPayload = {
      capture: true,
      amount: { value: order.total, currency: 'RUB' },
      payment_method_data: { type: payment_method_type },
      confirmation: { type: 'redirect', return_url },
      metadata: { orderId }
    };

    const payment = await global.YouKassa.createPayment(createPayload, uuidv4());

    global.DB.get('payments').push({
      ...payment,
      createdAt: new Date().toISOString(),
    }).write();

    res.json({ redirect_url: payment.confirmation.confirmation_url })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Произошла ошибка при создании платежа!', status: 'error' });
  }
}

export const notificationsPayment = (req, res) => {
  const notification = req.body;
  const payment = notification.object;
  const { orderId } = payment.metadata;

  if (notification.event === 'payment.succeeded') {
    global.DB.get('payments')
      .find({ id: payment.id })
      .assign({ ...payment, updatedAt: new Date().toISOString(), })
      .write()

    global.DB.get('orders')
      .find({ id: orderId })
      .assign({
        status: 'paid',
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payment: { ...payment.payment_method },
      })
      .write();
  } else if (notification.event === 'payment.canceled') {
    global.DB.get('payments')
      .find({ id: payment.id })
      .assign({ ...payment, updatedAt: new Date().toISOString() })
      .write();

    global.DB.get('orders')
      .find({ id: orderId })
      .assign({ status: 'canceled', updatedAt: new Date().toISOString() })
      .write();

    const order = global.DB.get('orders').find({ id: orderId }).value();

    if (order) {
      order.products.forEach(product => {
        global.DB.get('basket').push({
          id: Date.now(),
          userId: order.userId,
          productId: product.id,
          quantity: product.quantity,
        }).write();
      })
    }
  }

  res.json({ status: 'success' })
}