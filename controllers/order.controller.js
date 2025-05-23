import { v4 as uuidv4 } from 'uuid';

export const createOrder = (req, res) => {
  try {
    const { productsId, total } = req.body;

    if (!Array.isArray(productsId) || productsId.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста.' });
    }
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ error: 'Некорректная сумма заказа.' });
    }

    const order = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      total,
      productsId,
      userId: req.user.id,
      delivery: {
        method: null,
        cost: 0,
      }, // {"method": "курьер","cost": 500,"address": "Москва, ул. Ленина, д. 10, кв. 5"}
      payment: {
        method: null,
        status: null,
        transactionId: null
      }, // {"method": "СБП","status": "paid","transactionId": "abc123"}
      comment: '',
      discount: 0
    }

    global.DB.get('orders').push(order).write();

    res.json({ message: 'Заказ создан!', status: 'success', orderId: order.id })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Произошла ошибка при создании Заказа!' });
  }
}

export const getOrders = (req, res) => {
  const orders = global.DB.get('orders').filter({ userId: req.user.id, }).value();
  res.json(orders)
}