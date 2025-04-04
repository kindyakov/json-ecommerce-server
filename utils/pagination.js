/**
 * Функция для пагинации данных
 * @param {Array} data - Массив данных для пагинации
 * @param {Object} req - Объект запроса Express
 * @returns {Object} - Объект с пагинированными данными и метаинформацией
 */
export const paginate = (data, req) => {
  // Получаем параметры пагинации из запроса
  const page = parseInt(req.query._page) || 1;
  const limit = parseInt(req.query._limit) || 10;

  // Вычисляем индексы для среза данных
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Получаем пагинированные данные
  const paginatedData = data.slice(startIndex, endIndex);

  // Формируем метаинформацию
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: paginatedData,
    meta: {
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage: endIndex < totalItems,
      hasPreviousPage: startIndex > 0
    }
  };
};
