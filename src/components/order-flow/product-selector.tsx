import { Product } from '@/types'
import { ProductCard } from '../ui/product-card'
import { useEffect, useState } from 'react';

interface ProductSelectorProps {
  title: string
  description: string
  products: Product[]
  selectedProduct?: Product | Product[] | null
  onProductSelect: (product: Product) => void
  multiSelect?: boolean
}

export function ProductSelector({
  title,
  description,
  products,
  selectedProduct,
  onProductSelect,
  multiSelect = false,
}: ProductSelectorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeño retraso para que la animación sea visible
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`py-5 ${isVisible ? 'fade-in' : 'opacity-0'}`}>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-success mb-3">
            {title}
          </h2>
          <p className="lead text-muted">
            {description}
          </p>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {Array.isArray(products) && products.map((product, index) => (
            <div 
              className="col" 
              key={product.id}
              style={{
                animation: `slideIn 0.3s ease-out forwards`,
                animationDelay: `${index * 0.1}s`,
                opacity: 0
              }}
            >
              <ProductCard
                product={product}
                selected={
                  multiSelect && Array.isArray(selectedProduct)
                    ? selectedProduct.some(item => item.id === product.id)
                    : !Array.isArray(selectedProduct) && selectedProduct?.id === product.id
                }
                onSelect={onProductSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
