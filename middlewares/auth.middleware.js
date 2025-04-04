import jwt from 'jsonwebtoken';

export const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Отсутствует токен авторизации' });
  }

  const token = authHeader.split(' ')[1]; // Ожидается формат "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: 'Неверный формат токена' });
  }

  try {
    // Верифицируем токен; секретный ключ лучше хранить в переменных окружения
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Можно использовать данные токена в дальнейшем
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Неверный токен' });
  }
};
