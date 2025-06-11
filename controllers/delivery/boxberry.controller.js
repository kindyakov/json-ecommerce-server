import axios from 'axios'
import fs from 'fs'
import path from 'path'

const API_BOXBERRY = 'https://api.boxberry.ru/json.php'
const CACHE_DIR = path.resolve('./cache')
const CACHE_FILE = path.join(CACHE_DIR, 'boxberry_points.json')
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 часов (в миллисекундах)

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

const fetchPointsData = async () => {
  try {
    const { data } = await axios.get(API_BOXBERRY, {
      params: {
        token: process.env.BOXBERRY_API_KEY,
        method: 'ListPoints',
      }
    })

    const cacheData = {
      lastUpdated: Date.now(),
      data
    }
    console.log('получение пунктов')

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData))
    return data
  } catch (error) {
    throw new Error('Ошибка при обновлении кэша')
  }
}

const getCachedData = async () => {
  try {
    // Если файл кэша не существует
    if (!fs.existsSync(CACHE_FILE)) {
      return await fetchPointsData()
    }

    // Читаем кэш
    const rawData = fs.readFileSync(CACHE_FILE, 'utf8')
    const cache = JSON.parse(rawData)

    // Проверяем актуальность кэша
    const isCacheExpired = Date.now() - cache.lastUpdated > CACHE_TTL

    if (isCacheExpired) {
      console.log('Кэш устарел, обновляем...')
      return await fetchPointsData()
    }

    return cache.data
  } catch (error) {
    console.error('Ошибка чтения кэша:', error)
    return await fetchPointsData()
  }
}

export const getPoints = async (req, res) => {
  try {
    const { south, west, north, east } = req.query;

    if (!south || !west || !north || !east) {
      return res.status(400).json({ message: 'Недостаточно данных', status: 'error' });
    }

    const data = await getCachedData();

    const filteredPoints = data.filter(point => {
      if (!point.GPS) return false;

      const [latStr, lngStr] = point.GPS.split(','); // [широта, долгота]
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (isNaN(lat) || isNaN(lng)) return false;

      const southNum = parseFloat(south);
      const northNum = parseFloat(north);
      const westNum = parseFloat(west);
      const eastNum = parseFloat(east);

      const lngMin = Math.min(southNum, northNum);
      const lngMax = Math.max(southNum, northNum);
      const latMin = Math.min(westNum, eastNum);
      const latMax = Math.max(westNum, eastNum);

      return (
        lat >= latMin &&
        lat <= latMax &&
        lng >= lngMin &&
        lng <= lngMax
      );
    });

    res.json(filteredPoints);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Произошла ошибка', status: 'error' });
  }
}

export const getPoint = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Не передан код пункта', status: 'error' });
    }

    const { data } = await axios.get(API_BOXBERRY, {
      params: {
        token: process.env.BOXBERRY_API_KEY,
        method: 'PointsDescription',
        code,
        photo: true
      }
    });

    res.json(data)
  } catch (error) {
    return res.status(500).json({ message: 'Произошла ошибка', status: 'error' });
  }
}

export const calcDelivery = async (req, res) => {
  try {
    const { orderId, pointCode } = req.query

    const order = global.DB.get('orders').find({ userId: req.user.id, id: orderId }).value()

    if (!order) {
      return res.status(404).json({ message: `Заказ ${orderId} не найден.`, status: 'error' });
    }

    const products = order.products.map(({ id }) => global.DB.get('products').find({ id }).value())

    if (!pointCode) {
      return res.status(404).json({ message: `Не указан код ПВЗ.`, status: 'error' });
    }

    let totalWeight = 0;
    let dimensions = {
      height: 0,
      width: 0,
      depth: 0
    };

    products.forEach(product => {
      totalWeight += product.weight;

      dimensions.height += product.dimensions.height;
      dimensions.width += product.dimensions.width
      dimensions.depth += product.dimensions.depth;
    });

    const response = await axios.get(API_BOXBERRY, {
      params: {
        token: process.env.BOXBERRY_API_KEY,
        method: 'DeliveryCosts',
        targetstart: 48621, // Код пункта приема заказа
        target: pointCode, // Код пункта выдачи заказа
        ordersum: order.total,          // Объявленная стоимость посылки (страховая стоимость)
        paysum: order.total,
        weight: totalWeight,            // вес в граммах 
        ...dimensions,
      }
    });

    res.json(response.data)
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка при расчете доставки', status: 'error' });
  }
}