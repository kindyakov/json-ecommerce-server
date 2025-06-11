export const getProducts = (req, res) => {
  let products = global.DB.get('products').filter(req.query).value()

  if (products.length) {
    products.forEach(p => {
      if (p.variants.length) {
        let variants = []

        for (const id of p.variants) {
          const product = global.DB.get('products').find({ id }).value()
          if (!product) continue
          variants.push({
            id,
            inStock: product.inStock,
            price: product.price,
            slug: product.slug,
            attributes: {
              memory: product.features?.memory || '',
              color: product.features?.color || ''
            }
          })
        }

        p.variants = variants
      }
    });
  }

  res.json(products)
}