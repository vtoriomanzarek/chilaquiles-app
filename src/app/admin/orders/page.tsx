'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

interface OrderItem {
  id: string
  productId: string
  orderId: string
  quantity: number
  price: number
  product?: {
    name: string
    description: string
  }
}

interface Order {
  id: string
  userId: string
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('Error al obtener los pedidos')
        }
        const data = await response.json()
        setOrders(data)
      } catch (err) {
        setError('Error al cargar los pedidos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // El contenido dentro del AdminLayout
  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )
    }

    return (

      orders.length === 0 ? (
        <div className="alert alert-info">
          No hay pedidos registrados.
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-12 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Pedido #{order.id.substring(0, 8)}</h5>
                  <span className="badge bg-primary">{order.status}</span>
                </div>
                <div className="card-body">
                  <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                  
                  <h6 className="mt-3">Productos:</h6>
                  <ul className="list-group">
                    {order.items.map((item) => (
                      <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <span>{item.product?.name || `Producto ${item.productId.substring(0, 8)}`}</span>
                          {item.product?.description && (
                            <small className="d-block text-muted">{item.product.description}</small>
                          )}
                        </div>
                        <div>
                          <span className="badge bg-secondary me-2">{item.quantity}x</span>
                          <span className="text-success">${item.price.toFixed(2)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    )
  }

  return (
    <AdminLayout title="Pedidos">
      {renderContent()}
    </AdminLayout>
  )
}
