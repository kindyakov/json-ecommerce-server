import { v4 as uuidv4 } from 'uuid';
import { PaymentMethods } from '../settings/paymentMethods.js';
import { createAddress } from '../helpers/createAddress.js';

export const createPayment = async (req, res) => {
  try {
    const { delivery, client, return_url, orderId, payment_method_type } = req.body

    // Проверка наличия обязательных полей
    if (!delivery || typeof delivery !== 'object') {
      return res.status(400).json({ message: 'Некорректные данные доставки.', status: 'error' });
    }

    if (!client || typeof client !== 'object') {
      return res.status(400).json({ message: 'Некорректные данные клиента.', status: 'error' });
    }

    if (!return_url || typeof return_url !== 'string') {
      return res.status(400).json({ message: 'Некорректный URL возврата.', status: 'error' });
    }

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ message: 'Некорректный идентификатор заказа.', status: 'error' });
    }

    if (!payment_method_type || typeof payment_method_type !== 'string') {
      return res.status(400).json({ message: 'Некорректный тип способа оплаты.', status: 'error' });
    }

    // Список поддерживаемых способов оплаты YooKassa
    const supportedPaymentMethods = PaymentMethods.map(item => item.id)

    if (!supportedPaymentMethods.includes(payment_method_type)) {
      return res.status(400).json({ message: 'Неподдерживаемый способ оплаты.', status: 'error' });
    }

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

    global.DB.get('orders')
      .find({ id: orderId })
      .assign({
        updatedAt: new Date().toISOString(),
        delivery: {
          ...delivery,
          address: createAddress(delivery.data[delivery.method])
        },
        client
      })
      .write();

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