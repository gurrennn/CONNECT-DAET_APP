import { GET } from '@/app/api/shop/products/route'

describe('/api/shop/products', () => {
  it('returns list of products', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBeGreaterThan(0)
  })

  it('returns products with required fields', async () => {
    const response = await GET()
    const data = await response.json()

    const product = data.data[0]
    expect(product).toHaveProperty('id')
    expect(product).toHaveProperty('name')
    expect(product).toHaveProperty('price')
    expect(product).toHaveProperty('category')
    expect(product).toHaveProperty('stock')
  })

  it('includes Daet T-Shirt product', async () => {
    const response = await GET()
    const data = await response.json()

    const tshirt = data.data.find((p: any) => p.name === 'Daet Souvenir T-Shirt')
    expect(tshirt).toBeDefined()
    expect(tshirt.price).toBe(450)
    expect(tshirt.category).toBe('Apparel')
  })
})
