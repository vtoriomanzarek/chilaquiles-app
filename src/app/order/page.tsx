'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { ProductSelector } from '@/components/order-flow/product-selector'
import { OrderSummary } from '@/components/order-flow/order-summary'

export default function OrderPage() {
  const [step, setStep] = useState(1)
  const [orderComplete, setOrderComplete] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<{
    tortillaChips?: Product
    sauce?: Product
    protein?: Product
    extras?: Product[]
    drink?: Product
  }>({ extras: [] })

  const [products, setProducts] = useState<{
    TORTILLA_CHIPS: Product[]
    SAUCE: Product[]
    PROTEIN: Product[]
    TOPPING: Product[]
    EXTRAS: Product[]
    DRINK: Product[]
  }>({ TORTILLA_CHIPS: [], SAUCE: [], PROTEIN: [], TOPPING: [], EXTRAS: [], DRINK: [] })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const categories = ['TORTILLA_CHIPS', 'SAUCE', 'PROTEIN', 'TOPPING', 'EXTRAS', 'DRINK']
        const productsByCategory: Record<string, Product[]> = {
          TORTILLA_CHIPS: [],
          SAUCE: [],
          PROTEIN: [],
          TOPPING: [],
          EXTRAS: [],
          DRINK: []
        }

        for (const category of categories) {
          try {
            const response = await fetch(`/api/products?category=${category}`)
            if (response.ok) {
              const data = await response.json()
              productsByCategory[category] = data
            } else {
              console.warn(`Error fetching ${category} products:`, response.statusText)
            }
          } catch (err) {
            console.warn(`Error fetching ${category} products:`, err)
          }
        }

        setProducts(productsByCategory as { 
          TORTILLA_CHIPS: Product[]; 
          SAUCE: Product[]; 
          PROTEIN: Product[]; 
          TOPPING: Product[];
          EXTRAS: Product[]; 
          DRINK: Product[]; 
        })
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [])

  const handleProductSelect = (category: keyof typeof selectedProducts) => (product: Product) => {
    if (category === 'extras') {
      setSelectedProducts((prev) => {
        const currentExtras = prev.extras || [];
        // Verificar si el producto ya está seleccionado
        const isAlreadySelected = currentExtras.some(item => item.id === product.id);
        
        if (isAlreadySelected) {
          // Si ya está seleccionado, lo quitamos
          return {
            ...prev,
            extras: currentExtras.filter(item => item.id !== product.id)
          };
        } else {
          // Si no está seleccionado, lo agregamos
          return {
            ...prev,
            extras: [...currentExtras, product]
          };
        }
      });
      // No avanzamos automáticamente en los complementos
    } else {
      setSelectedProducts((prev) => ({
        ...prev,
        [category]: product,
      }));
      if (step < 5) { // Ahora tenemos 5 pasos en total
        setStep(step + 1);
      }
    }
  }
  
  const calculateTotal = () => {
    return Object.entries(selectedProducts).reduce((total, [key, product]) => {
      if (key === 'extras' && Array.isArray(product)) {
        return total + product.reduce((sum, item) => sum + item.price, 0);
      }
      return total + (product?.price || 0);
    }, 0);
  }
  
  const handleFinishOrder = () => {
    setOrderComplete(true);
  }

  return (
    <main className="page-container" style={{ backgroundColor: '#fffdf7' }}>
      {/* Progress bar */}
      <div className="border-bottom py-3" style={{ backgroundColor: '#fff5d6' }}>
        <div className="container">
          <div className="progress-steps d-flex justify-content-center">
            <ul className="list-unstyled d-flex mb-0">
              {[
                { name: 'Totopos', status: step >= 1 ? 'current' : 'upcoming' },
                { name: 'Salsa', status: step >= 2 ? 'current' : 'upcoming' },
                { name: 'Proteína', status: step >= 3 ? 'current' : 'upcoming' },
                { name: 'Complementos', status: step >= 4 ? 'current' : 'upcoming' },
                { name: 'Bebida', status: step >= 5 ? 'current' : 'upcoming' },
              ].map((item, index) => (
                <li key={item.name} className="d-flex align-items-center">
                  {index !== 0 && (
                    <div className="mx-2 d-none d-sm-block text-muted">
                      <i className="bi bi-chevron-right"></i>
                    </div>
                  )}
                  <div className="d-flex align-items-center">
                    <div
                      className={`d-flex align-items-center justify-content-center rounded-circle me-2 ${item.status === 'current' ? 'bg-success text-white' : 'bg-light text-muted border'}`}
                      style={{ width: '32px', height: '32px' }}
                    >
                      <small>{index + 1}</small>
                    </div>
                    <span className="text-muted">{item.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-wrap">
        {orderComplete ? (
          <OrderSummary 
            products={selectedProducts}
            total={calculateTotal()}
            onBack={() => setOrderComplete(false)}
          />
        ) : (
          <>
            {step === 1 && (
              <ProductSelector
                title="Elige tus totopos"
                description="Selecciona la base de tus chilaquiles"
                products={products.TORTILLA_CHIPS}
                selectedProduct={selectedProducts.tortillaChips}
                onProductSelect={handleProductSelect('tortillaChips')}
              />
            )}
            {step === 2 && (
              <ProductSelector
                title="Elige tu salsa"
                description="¿Verde o roja? ¡Tú decides!"
                products={products.SAUCE}
                selectedProduct={selectedProducts.sauce}
                onProductSelect={handleProductSelect('sauce')}
              />
            )}
            {step === 3 && (
              <ProductSelector
                title="Elige tu proteína"
                description="Añade proteína a tus chilaquiles"
                products={[...products.PROTEIN, ...products.TOPPING]}
                selectedProduct={selectedProducts.protein}
                onProductSelect={handleProductSelect('protein')}
              />
            )}
            {step === 4 && (
              <ProductSelector
                title="Elige tus complementos"
                description="Puedes elegir varios complementos"
                products={products.EXTRAS}
                selectedProduct={selectedProducts.extras}
                onProductSelect={handleProductSelect('extras')}
                multiSelect={true}
              />
            )}
            {step === 5 && (
              <ProductSelector
                title="Elige tu bebida"
                description="Completa tu orden con la bebida perfecta"
                products={products.DRINK}
                selectedProduct={selectedProducts.drink}
                onProductSelect={handleProductSelect('drink')}
              />
            )}
          </>
        )}
      </div>

      {/* Footer con resumen y botones de navegación */}
      {!orderComplete && <div className="border-top py-3 footer-fixed" style={{ backgroundColor: '#fff5d6' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Tu orden</h5>
              <p className="text-muted mb-0 small">
                {Object.entries(selectedProducts).reduce((count, [key, value]) => {
                  if (key === 'extras' && Array.isArray(value)) {
                    return count + value.length;
                  }
                  return count + (value ? 1 : 0);
                }, 0)} productos seleccionados
              </p>
            </div>
            <div className="d-flex gap-2">
              {step > 1 && (
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => setStep(step - 1)}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Regresar
                </button>
              )}
              <button 
                className="btn btn-success" 
                disabled={step === 5 && !selectedProducts.drink}
                onClick={() => {
                  if (step < 5) {
                    // Si estamos en el paso de complementos (4), podemos continuar sin seleccionar nada
                    if (step === 4 || selectedProducts[step === 1 ? 'tortillaChips' : step === 2 ? 'sauce' : step === 3 ? 'protein' : 'drink']) {
                      setStep(step + 1);
                    }
                  } else {
                    handleFinishOrder();
                  }
                }}
              >
                {step < 5 ? (
                  <>
                    Continuar
                    <i className="bi bi-arrow-right ms-1"></i>
                  </>
                ) : (
                  <>
                    Finalizar pedido
                    <i className="bi bi-check-circle ms-1"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>}
    </main>
  )
}
