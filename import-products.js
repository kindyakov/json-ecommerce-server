import Typesense from 'typesense'
import axios from 'axios'

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

async function getProducts() {
  try {
    const response = await axios.get('http://localhost:8888/api/products')
    return response.data
  } catch (error) {
    console.log(error)
  }
}

function transformProducts(products) {
  return products.map((product) => {
    const baseVariant = product.variants?.[0] || {};

    return {
      id: String(product.id),
      title: product.title,
      description: product.description,
      fullDescription: product.fullDescription,
      categorySlug: product.categorySlug,
      subCategorySlug: product.subCategorySlug,
      brandId: product.brandId || 0,
      price: baseVariant.price || product.price,
      oldPrice: product.oldPrice,
      discount: product.discount,
      inStock: baseVariant.inStock ?? product.inStock,
      rating: product.rating,
      reviewCount: product.reviewCount,
      tags: product.tags,
      color: baseVariant.attributes?.color || '',
      memory: baseVariant.attributes?.memory || '',
      slug: product.slug
    };
  });
}

(async () => {
  try {
    const products = await getProducts()
    const transformedProducts = transformProducts(products)

    const result = await client.collections('products').documents().import(transformedProducts, {
      action: 'upsert',
      batch_size: 100
    });

    console.log(result);
  } catch (error) {
    // console.error('Ошибка импорта:', error);

    if (error.importResults) {
      console.error('\nПодробности ошибок импорта:\n');
      error.importResults.forEach((result, i) => {
        console.error(`Документ #${i + 1}:`, result);
      });
    }
  }
})();