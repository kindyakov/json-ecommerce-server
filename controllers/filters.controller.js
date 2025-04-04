import lodash from 'lodash';

export const filters = (req, res) => {
  const { categorySlug, subCategorySlug } = req.params;
  const db = req.app.locals.db;

  // Ищем категорию по slug
  const category = db.get('categories').find({ slug: categorySlug }).value();
  if (!category) {
    return res.status(404).json({});
  }

  // Находим все подкатегории для данной категории
  const subcategoryIds = db.get('subcategories')
    .filter(subCategorySlug ? { slug: subCategorySlug } : { categoryId: category.id })
    .map('id')
    .value();

  // Выбираем все товары, относящиеся к найденным подкатегориям
  let products = db.get('products')
    .filter(product => subcategoryIds.includes(product.subCategoryId))
    .value();

  if (!products.length) {
    return res.json({ filters: {} });
  }

  products = products.filter(product => {
    let { price, colors, tags, features, ...params } = req.query;
    let result = true;

    if (price) {
      const minPrice = parseFloat(price.min) || 0;
      const maxPrice = parseFloat(price.max) || product.price;
      result = product.price >= minPrice && product.price <= maxPrice;
    }

    if (colors) {
      colors = colors.split(',');
      result = result && colors.some(color => product.colors.includes(color)); // Проверяем, что хотя бы один цвет совпадает
    }

    if (tags) {
      tags = tags.split(',');
      result = result && tags.some(tag => product.tags.includes(tag)); // Проверяем, что хотя бы один тег совпадает
    }

    // Проверяем features
    if (features) {
      let _result = true;
      Object.keys(features).forEach(key => {
        const queryValues = features[key];
        const productValue = product.features ? product.features[key] : undefined;

        if (!productValue) {
          _result = false;
          return;
        }

        if (Array.isArray(productValue)) {
          _result = _result && queryValues.some(value => productValue.includes(value));
        } else {
          _result = _result && queryValues.includes(productValue);
        }
      });

      result = _result;
    }

    // Проверяем остальные параметры
    if (params) {
      for (const key of Object.keys(params)) {
        if (['_page', '_limit'].includes(key)) {
          continue
        }

        let queryValue = params[key];
        const productValue = product[key];

        // Приводим queryValue к типу productValue
        if (typeof productValue === 'boolean') {
          queryValue = queryValue.toLowerCase() === 'true';
        } else if (typeof productValue === 'number') {
          queryValue = parseFloat(queryValue);
        }

        if (Array.isArray(productValue)) {
          result = result && productValue.includes(queryValue);
        } else {
          result = result && productValue === queryValue;
        }
      }
    }

    return result;
  })

  // Агрегация цены
  const prices = db.get('products')
    .filter(product => subcategoryIds.includes(product.subCategoryId))
    .value().map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Уникальные значения для colors и tags
  // const colors = lodash.uniq(lodash.flatten(products.map(p => p.colors || [])));
  const tags = lodash.uniq(lodash.flatten(products.map(p => p.tags || [])));

  // Агрегация features
  let features = {};
  products.forEach(product => {
    if (product.features && typeof product.features === 'object') {
      Object.keys(product.features).forEach(key => {
        if (!features[key]) {
          features[key] = [];
        }
        features[key].push(product.features[key]);
      });
    }
  });
  Object.keys(features).forEach(key => {
    features[key] = lodash.uniq(features[key]);
  });

  const filters = {
    price: { min: minPrice, max: maxPrice },
    // colors,
    tags,
    features
  };

  res.locals.paginationTarget = 'products';

  res.json({ filters, products });
}