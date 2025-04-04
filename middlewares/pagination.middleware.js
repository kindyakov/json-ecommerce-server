import { paginate } from "../utils/pagination.js";

/**
 * Middleware для применения пагинации к ответу
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 * @param {Function} next - Функция next Express
 */
export const paginationMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Проверяем, указаны ли параметры пагинации в query
    if (req.query._page || req.query._limit) {
      if (res.locals.paginationTarget && data && typeof data === 'object') {
        const targetKey = res.locals.paginationTarget;

        if (Array.isArray(data[targetKey])) {
          const paginatedResult = paginate(data[targetKey], req);
          // Заменяем массив в указанном поле на пагинированный результат
          data[targetKey] = paginatedResult.data;
          // Добавляем meta-информацию в общий объект
          data.meta = paginatedResult.meta;
        }

      } else if (Array.isArray(data)) {
        // Если возвращаемый объект – это массив
        const paginatedResult = paginate(data, req);
        data = {
          data: paginatedResult.data,
          meta: paginatedResult.meta
        };
      }
    }

    return originalJson.call(this, data);
  };

  next();
};