/**
 * Формирует строку адреса из объекта данных.
 * @param {Object} data
 * @param {string} [data.city]
 * @param {string} [data.street]
 * @param {string} [data.house]
 * @param {string} [data.entrance]
 * @param {string} [data.floor]
 * @param {string} [data.apartment]
 * @returns {string}
 */
export function createAddress(data) {
  const fieldsOrder = {
    city: { idx: 0, format: v => v },
    street: { idx: 1, format: v => `ул. ${v}` },
    house: { idx: 2, format: v => `д. ${v}` },
    entrance: { idx: 3, format: v => `подъезд ${v}` },
    floor: { idx: 4, format: v => `этаж ${v}` },
    apartment: { idx: 5, format: v => `кв. ${v}` },
  };

  return Object.entries(data)
    .filter(([key, val]) =>
      fieldsOrder[key] && val != null && String(val).trim() !== ''
    )
    .map(([key, val]) => {
      const { idx, format } = fieldsOrder[key];
      return { idx, text: format(String(val).trim()) };
    })
    .sort((a, b) => a.idx - b.idx)
    .map(item => item.text)
    .join(', ');
}

