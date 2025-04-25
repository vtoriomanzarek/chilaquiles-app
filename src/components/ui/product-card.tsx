import Image from 'next/image'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
  selected?: boolean
  onSelect?: (product: Product) => void
}

export function ProductCard({ product, selected = false, onSelect }: ProductCardProps) {
  return (
    <div
      className={`card h-100 ${selected ? 'border-success bg-success bg-opacity-10' : 'border'}`}
      onClick={() => onSelect?.(product)}
      style={{ 
        cursor: 'pointer', 
        transition: 'all 0.2s ease',
        backgroundColor: selected ? 'rgba(25, 135, 84, 0.1)' : '#fffbf0',
        boxShadow: '0 3px 10px rgba(210, 180, 140, 0.1)'
      }}
    >
      <div className="position-relative" style={{ height: '200px' }}>
        <Image
          src={`/images/placeholder.svg`}
          alt={product.name}
          fill
          className="card-img-top"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text text-muted small">{product.description}</p>
        <p className="card-text text-success fw-bold mt-auto">${product.price.toFixed(2)}</p>
      </div>
      {selected && (
        <div className="position-absolute top-0 end-0 m-2 bg-success text-white rounded-circle p-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-check"
            viewBox="0 0 16 16"
          >
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
          </svg>
        </div>
      )}
    </div>
  )
}
