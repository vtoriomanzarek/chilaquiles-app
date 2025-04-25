'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '../../../utils/format'
import { getStatusColor, getStatusText } from './utils'

interface AdminDashboardProps {
  data: any
}

export default function AdminDashboard({ data }: AdminDashboardProps) {
  const stats = data?.stats || {};
  const topProducts = data?.topProducts || [];
  const recentOrders = data?.recentOrders || [];
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  return (
    <div>
      <div className="alert alert-info">
        <h4 className="alert-heading">Administrador</h4>
        <p>Bienvenido al panel de administración. Aquí puedes ver estadísticas generales y gestionar todos los aspectos del negocio.</p>
      </div>
      
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Ventas Totales
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {formatCurrency(stats.totalSales || 0)}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-currency-dollar fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Pedidos Totales
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalOrders || 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-receipt fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Pedidos Pendientes
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.pendingOrders || 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-clock fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Pedidos en Preparación
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.preparingOrders || 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-fire fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-lg-6">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Pedidos Recientes</h6>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => setRefreshTrigger(prev => prev + 1)}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                {recentOrders.length > 0 ? (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order: any) => (
                        <tr key={order.id}>
                          <td>{order.id.substring(0, 8)}...</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>{formatCurrency(order.total)}</td>
                          <td>
                            <span className={`badge bg-${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td>
                            <Link 
                              href={`/admin/orders/${order.id}`}
                              className="btn btn-sm btn-primary"
                            >
                              <i className="bi bi-eye me-1"></i> Ver
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-3">No hay pedidos recientes</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Productos más vendidos</h6>
            </div>
            <div className="card-body">
              {topProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product: any) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.quantity}</td>
                          <td>{formatCurrency(product.price)}</td>
                          <td>{formatCurrency(product.price * product.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-3">No hay datos de productos</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Acciones administrativas</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <Link href="/admin/products" className="btn btn-primary btn-block w-100">
                    <i className="bi bi-box me-2"></i> Gestionar Productos
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link href="/admin/inventory" className="btn btn-success btn-block w-100">
                    <i className="bi bi-list-check me-2"></i> Inventario
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link href="/admin/users" className="btn btn-info btn-block w-100">
                    <i className="bi bi-people me-2"></i> Gestionar Usuarios
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link href="/admin/reports" className="btn btn-warning btn-block w-100">
                    <i className="bi bi-graph-up me-2"></i> Reportes
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link href="/admin/invoices" className="btn btn-secondary btn-block w-100">
                    <i className="bi bi-file-earmark-text me-2"></i> Facturas
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link href="/admin/settings" className="btn btn-dark btn-block w-100">
                    <i className="bi bi-gear me-2"></i> Configuración
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
