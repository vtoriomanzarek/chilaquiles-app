export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: 'TORTILLA_CHIPS' | 'SAUCE' | 'PROTEIN' | 'TOPPING' | 'EXTRAS' | 'DRINK'
  available: boolean
  createdAt: Date
  updatedAt: Date
}
