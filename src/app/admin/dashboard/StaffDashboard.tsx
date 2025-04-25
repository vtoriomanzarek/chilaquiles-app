'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '../../../utils/format'
import { getStatusColor, getStatusText, registerOrderPayment, fetchOrders } from './utils'

// Constantes para métodos de pago
const PAYMENT_METHODS = {
  CASH: 'CASH',
  CARD: 'CARD',
  TRANSFER: 'TRANSFER'
}

interface StaffDashboardProps {
  data: any
}

export default function StaffDashboard({ data }: StaffDashboardProps) {
  const stats = data?.stats || {};
  const [orders, setOrders] = useState<any[]>(data?.orders || []);
  const [processingOrders, setProcessingOrders] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Cargar datos actualizados cuando cambie el refreshTrigger
  useEffect(() => {
    const loadOrders = async () => {
      if (refreshTrigger > 0) {
        setLoading(true);
        try {
          console.log('Recargando datos del dashboard...');
          // Cargar pedidos actualizados
          const updatedOrders = await fetchOrders();
          console.log('Pedidos actualizados:', updatedOrders);
          setOrders(updatedOrders);
        } catch (error) {
          console.error('Error al recargar pedidos:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadOrders();
  }, [refreshTrigger]);
  
  // Cargar datos iniciales
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        // Cargar pedidos iniciales
        const initialOrders = await fetchOrders();
        console.log('Carga inicial de pedidos:', initialOrders);
        setOrders(initialOrders);
      } catch (error) {
        console.error('Error en carga inicial:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initialLoad();
  }, []);
  
  // Filtrar pedidos por estado
  const pendingOrders = orders.filter((order: any) => order.status === 'PENDING');
  const paidOrders = orders.filter((order: any) => order.status === 'PAID');
  const preparingOrders = orders.filter((order: any) => order.status === 'PREPARING');
  const readyOrders = orders.filter((order: any) => order.status === 'READY');
  const deliveredOrders = orders.filter((order: any) => order.status === 'DELIVERED');
  
  // Calcular estadísticas
  const totalSales = stats.totalSales || 0;
  const completedOrders = stats.completedOrders || 0;
  const todayOrders = stats.todayOrders || 0;

  // Función para registrar el pago de un pedido
  const handleRegisterPayment = async (orderId: string, paymentMethod: string) => {
    if (processingOrders.includes(orderId)) return;
    
    setProcessingOrders(prev => [...prev, orderId]);
    
    try {
      // Usar la versión mejorada de registerOrderPayment que devuelve más información
      const result = await registerOrderPayment(orderId, paymentMethod);
      
      if (result.success) {
        // Recargar los datos
        setRefreshTrigger(prev => prev + 1);
        // Notificar al usuario
        alert(result.message || 'Pago registrado correctamente');
        
        // Recargar la página para mostrar los cambios actualizados
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Mostrar mensaje de error específico
        alert(result.message || 'Error al registrar el pago');
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error inesperado al registrar el pago');
    } finally {
      setProcessingOrders(prev => prev.filter(id => id !== orderId));
    }
  };
  
  return (
    <div>
      <div className="alert alert-info">
        <h4 className="alert-heading">Caja</h4>
        <p>Bienvenido al panel de caja. Aquí puedes gestionar los pagos y ver el estado de los pedidos.</p>
      </div>
      
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    VENTAS TOTALES
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    ${totalSales.toFixed(2)}
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
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    PEDIDOS HOY
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {todayOrders}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-calendar-day fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="alert alert-info mb-0 h-100 d-flex align-items-center">
            <div>
              <i className="bi bi-info-circle-fill me-2"></i>
              <strong>Tip:</strong> Usa el panel de "Estado de Pedidos" para ver todos los pedidos agrupados por su estado actual.
            </div>
          </div>
        </div>
      </div>

      {/* Estado de pedidos por categoría */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">Estado de Pedidos</h6>
              <button 
                className="btn btn-sm btn-outline-primary" 
                onClick={() => setRefreshTrigger(prev => prev + 1)}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
              </button>
            </div>
            <div className="card-body">
              <div className="row">
                {/* PENDING */}
                <div className="col-md-3 mb-4">
                  <div className="card bg-warning bg-opacity-10 h-100">
                    <div className="card-header bg-warning bg-opacity-25 py-2">
                      <h6 className="m-0 font-weight-bold">PENDIENTES ({pendingOrders.length})</h6>
                    </div>
                    <div className="card-body p-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {pendingOrders.length > 0 ? (
                        <ul className="list-group list-group-flush">
                          {pendingOrders.map((order: any) => (
                            <li key={order.id} className="list-group-item p-2 bg-transparent">
                              <div className="d-flex justify-content-between align-items-center">
                                <small>{order.id.substring(0, 8)}...</small>
                                <span className="badge bg-warning">${order.total.toFixed(2)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-muted my-3">No hay pedidos pendientes</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* PAID */}
                <div className="col-md-2 mb-4">
                  <div className="card bg-info bg-opacity-10 h-100">
                    <div className="card-header bg-info bg-opacity-25 py-2">
                      <h6 className="m-0 font-weight-bold">PAGADOS ({paidOrders.length})</h6>
                    </div>
                    <div className="card-body p-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {paidOrders.length > 0 ? (
                        <ul className="list-group list-group-flush">
                          {paidOrders.map((order: any) => (
                            <li key={order.id} className="list-group-item p-2 bg-transparent">
                              <div className="d-flex justify-content-between align-items-center">
                                <small>{order.id.substring(0, 8)}...</small>
                                <span className="badge bg-info">${order.total.toFixed(2)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-muted my-3">No hay pedidos pagados</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* PREPARING */}
                <div className="col-md-2 mb-4">
                  <div className="card bg-primary bg-opacity-10 h-100">
                    <div className="card-header bg-primary bg-opacity-25 py-2">
                      <h6 className="m-0 font-weight-bold">EN PREPARACIÓN ({preparingOrders.length})</h6>
                    </div>
                    <div className="card-body p-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {preparingOrders.length > 0 ? (
                        <ul className="list-group list-group-flush">
                          {preparingOrders.map((order: any) => (
                            <li key={order.id} className="list-group-item p-2 bg-transparent">
                              <div className="d-flex justify-content-between align-items-center">
                                <small>{order.id.substring(0, 8)}...</small>
                                <span className="badge bg-primary">${order.total.toFixed(2)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-muted my-3">No hay pedidos en preparación</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* READY */}
                <div className="col-md-2 mb-4">
                  <div className="card bg-success bg-opacity-10 h-100">
                    <div className="card-header bg-success bg-opacity-25 py-2">
                      <h6 className="m-0 font-weight-bold">LISTOS ({readyOrders.length})</h6>
                    </div>
                    <div className="card-body p-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {readyOrders.length > 0 ? (
                        <ul className="list-group list-group-flush">
                          {readyOrders.map((order: any) => (
                            <li key={order.id} className="list-group-item p-2 bg-transparent">
                              <div className="d-flex justify-content-between align-items-center">
                                <small>{order.id.substring(0, 8)}...</small>
                                <span className="badge bg-success">${order.total.toFixed(2)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-muted my-3">No hay pedidos listos</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* DELIVERED */}
                <div className="col-md-3 mb-4">
                  <div className="card h-100" style={{backgroundColor: 'rgba(128, 0, 128, 0.1)'}}>
                    <div className="card-header py-2" style={{backgroundColor: 'rgba(128, 0, 128, 0.25)'}}>
                      <h6 className="m-0 font-weight-bold text-purple">ENTREGADOS ({deliveredOrders.length})</h6>
                    </div>
                    <div className="card-body p-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {deliveredOrders.length > 0 ? (
                        <ul className="list-group list-group-flush">
                          {deliveredOrders.map((order: any) => (
                            <li key={order.id} className="list-group-item p-2 bg-transparent">
                              <div className="d-flex justify-content-between align-items-center">
                                <small>{order.id.substring(0, 8)}...</small>
                                <span className="badge" style={{backgroundColor: 'purple', color: 'white'}}>${order.total.toFixed(2)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-muted my-3">No hay pedidos entregados</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">Pedidos pendientes de pago</h6>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
          </button>
        </div>
        <div className="card-body">
          {pendingOrders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mesa/Cliente</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha/Hora</th>
                    <th style={{ width: '200px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order: any) => {
                    // Extraer información de la mesa desde los metadatos
                    let tableInfo = 'Para llevar';
                    try {
                      if (order.metadata) {
                        const metadata = JSON.parse(order.metadata);
                        if (metadata.table) {
                          tableInfo = metadata.table === '0' ? 'Para llevar' : `Mesa ${metadata.table}`;
                        }
                      }
                    } catch (e) {
                      console.error('Error al parsear metadatos:', e);
                    }
                    
                    return (
                    <tr key={order.id}>
                      <td>{order.id.substring(0, 8)}...</td>
                      <td>{tableInfo}</td>
                      <td>
                        {order.items?.map((item: any, index: number) => (
                          <div key={index}>
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-success btn-sm" 
                            onClick={() => handleRegisterPayment(order.id, PAYMENT_METHODS.CASH)}
                            disabled={processingOrders.includes(order.id) || loading}
                          >
                            {processingOrders.includes(order.id) ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Procesando...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-cash me-1"></i> Efectivo
                              </>
                            )}
                          </button>
                          <button 
                            className="btn btn-info btn-sm" 
                            onClick={() => handleRegisterPayment(order.id, PAYMENT_METHODS.CARD)}
                            disabled={processingOrders.includes(order.id) || loading}
                          >
                            <i className="bi bi-credit-card me-1"></i> Tarjeta
                          </button>
                          <Link 
                            href={`/admin/invoice/create?orderId=${order.id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            <i className="bi bi-file-earmark-text me-1"></i> Facturar
                          </Link>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              No hay pedidos pendientes de pago.
            </div>
          )}
        </div>
      </div>
      
      {/* Pedidos pagados recientemente */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Pedidos pagados recientemente</h5>
        </div>
        
        {paidOrders.length > 0 || preparingOrders.length > 0 || readyOrders.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mesa/Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Método de Pago</th>
                  <th>Hora de Pago</th>
                  <th>Fecha/Hora Creación</th>
                </tr>
              </thead>
              <tbody>
                {[...paidOrders, ...preparingOrders, ...readyOrders].map((order: any) => {
                  // Intentar extraer el método de pago, la hora de pago y la mesa de los metadatos
                  let paymentMethod = 'No disponible';
                  let paidAt = 'No disponible';
                  let tableInfo = 'Para llevar';
                  
                  try {
                    if (order.metadata) {
                      const metadata = JSON.parse(order.metadata);
                      if (metadata.paymentMethod) {
                        paymentMethod = metadata.paymentMethod === 'CASH' ? 'Efectivo' : 
                                      metadata.paymentMethod === 'CARD' ? 'Tarjeta' : 
                                      metadata.paymentMethod === 'TRANSFER' ? 'Transferencia' : 
                                      metadata.paymentMethod;
                      }
                      if (metadata.paidAt) {
                        const date = new Date(metadata.paidAt);
                        paidAt = date.toLocaleTimeString();
                      }
                      // Extraer información de la mesa
                      if (metadata.table) {
                        tableInfo = metadata.table === '0' ? 'Para llevar' : `Mesa ${metadata.table}`;
                      }
                    }
                  } catch (e) {
                    console.error('Error al parsear metadatos:', e);
                  }
                  
                  return (
                    <tr key={order.id}>
                      <td>{order.id.substring(0, 8)}...</td>
                      <td>{tableInfo}</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>{paymentMethod}</td>
                      <td>{paidAt}</td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="alert alert-info">
            No hay pedidos pagados recientemente.
          </div>
        )}
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Resumen del día</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Ventas totales:</span>
                  <strong>{formatCurrency(stats.totalSalesToday || 0)}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Pagos con tarjeta:</span>
                  <strong>{formatCurrency(stats.cardPaymentsToday || 0)}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Pagos en efectivo:</span>
                  <strong>{formatCurrency(stats.cashPaymentsToday || 0)}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Pedidos completados:</span>
                  <strong>{stats.completedOrdersToday || 0}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Pedidos pendientes:</span>
                  <strong>{stats.pendingOrdersToday || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Acciones rápidas</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link href="/order" className="btn btn-primary mb-2">
                  <i className="bi bi-receipt me-2"></i> Nuevo pedido
                </Link>
                <Link href="/admin/invoices" className="btn btn-info mb-2">
                  <i className="bi bi-file-earmark-text me-2"></i> Ver facturas
                </Link>
                <Link href="/admin/reports" className="btn btn-warning mb-2">
                  <i className="bi bi-printer me-2"></i> Imprimir reportes
                </Link>
                <button className="btn btn-secondary">
                  <i className="bi bi-box-arrow-right me-2"></i> Cerrar caja
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
