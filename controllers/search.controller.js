import Typesense from 'typesense'

const client = new Typesense.Client({
  nodes: [
    {
      host: 'localhost',
      port: 8108,
      protocol: 'http'
    }
  ],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2
});

export const search = async (req, res) => {
  try {
    const {
      q = '',
      category = '',
      subCategory = '',
      brandId = '',
      minPrice = '',
      maxPrice = '',
      inStock = '',
      color = '',
      memory = '',
      tags = '',
      page = 1,
      per_page = 20,
      sort_by = 'price:asc'
    } = req.query;

    let searchParameters = {
      q: q || '*',
      query_by: 'title,description,fullDescription,tags',
      per_page: parseInt(per_page),
      page: parseInt(page),
      sort_by: sort_by,
      facet_by: 'categorySlug,subCategorySlug,brandId,inStock,color,memory,tags'
    };

    // Добавляем фильтры если они есть
    let filters = [];

    if (category) filters.push(`categorySlug:=${category}`);
    if (subCategory) filters.push(`subCategorySlug:=${subCategory}`);
    if (brandId) filters.push(`brandId:=${brandId}`);
    if (inStock !== '') filters.push(`inStock:=${inStock === 'true'}`);
    if (color) filters.push(`color:=${color}`);
    if (memory) filters.push(`memory:=${memory}`);
    if (tags) filters.push(`tags:=${tags}`);

    // Фильтр по цене
    if (minPrice || maxPrice) {
      let priceFilter = 'price:';
      if (minPrice && maxPrice) {
        priceFilter += `[${minPrice}..${maxPrice}]`;
      } else if (minPrice) {
        priceFilter += `>=${minPrice}`;
      } else if (maxPrice) {
        priceFilter += `<=${maxPrice}`;
      }
      filters.push(priceFilter);
    }

    if (filters.length > 0) {
      searchParameters.filter_by = filters.join(' && ');
    }

    const searchResults = await client
      .collections('products')
      .documents()
      .search(searchParameters);

    res.json({
      hits: searchResults.hits,
      found: searchResults.found,
      search_time_ms: searchResults.search_time_ms,
      page: searchResults.page,
      facet_counts: searchResults.facet_counts,
      per_page: searchResults.request_params.per_page
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Ошибка поиска', status: 'error' });
  }
}