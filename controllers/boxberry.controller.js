import axios from 'axios'

const API_BOXBERRY = 'https://api.boxberry.ru/json.php'

export const getPoints = async (req, res) => {
  try {
    const { south, west, north, east } = req.query;

    if (!south || !west || !north || !east) {
      return res.status(400).json({ message: 'Недостаточно данных', status: 'error' });
    }

    const response = await axios.get(API_BOXBERRY, {
      params: {
        token: process.env.BOXBERRY_API_KEY,
        method: 'ListPoints',
        // CityCode: 29
      }
    });

    const filteredPoints = response.data.filter(point => {
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

    const response = await axios.get(API_BOXBERRY, {
      params: {
        token: process.env.BOXBERRY_API_KEY,
        method: 'PointsDescription',
        code,
        photo: true
      }
    });

    res.json(response.data)
  } catch (error) {
    return res.status(500).json({ message: 'Произошла ошибка', status: 'error' });
  }
}