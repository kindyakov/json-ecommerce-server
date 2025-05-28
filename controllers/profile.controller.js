import { getBasket } from '../helpers/getBasket.js';
import { getFavorites } from '../helpers/getFavorites.js';

export const profile = async (req, res) => {
  try {
    const user = global.DB.get('users').find({ id: req.user.id }).value();

    if (!user) {
      return res.json({ message: 'Пользователь с не найден', status: 'error' });
    }

    const { basket, basketTotal } = getBasket(req.user.id)
    const favorites = getFavorites(req.user.id)

    const profile = {
      user: { ...user },
      basket,
      favorites,
      orders: [],
      basketTotal
    }

    delete profile?.user?.password
    delete profile?.user?.vkId
    delete profile?.user?.yandexId

    res.json(profile)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Произошла ошибка', status: 'error' });
  }
}