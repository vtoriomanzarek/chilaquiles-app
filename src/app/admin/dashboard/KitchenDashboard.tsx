'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '../../../utils/format'
import { getStatusColor, getStatusText, markOrderAsReady, markOrderAsPreparing, fetchOrders } from './utils'

interface KitchenDashboardProps {
  data: any
}

export default function KitchenDashboard({ data }: KitchenDashboardProps) {
  const stats = data?.stats || {};
  const [orders, setOrders] = useState<any[]>(data?.orders || []);
  const [processingOrders, setProcessingOrders] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Cargar pedidos actualizados cuando cambie el refreshTrigger
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        // Cargar datos desde el dashboard
        console.log('Datos iniciales del dashboard:', data);
        
        // Cargar pedidos filtrados por rol
        const fetchedOrders = await fetchOrders();
        console.log('Pedidos obtenidos de la API:', fetchedOrders);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, [refreshTrigger, data]);
  
  // Filtrar pedidos por estado
  const pendingOrders = orders.filter((order: any) => order.status === 'PENDING');
  const paidOrders = orders.filter((order: any) => order.status === 'PAID');
  const preparingOrders = orders.filter((order: any) => order.status === 'PREPARING');
  const readyOrders = orders.filter((order: any) => order.status === 'READY');
  
  // Mostrar en consola para depuración
  console.log('Todos los pedidos:', orders.length);
  console.log('Pedidos pendientes (PENDING):', pendingOrders.length);
  console.log('Pedidos pagados (PAID):', paidOrders.length);
  console.log('Pedidos en preparación (PREPARING):', preparingOrders.length);
  console.log('Pedidos listos (READY):', readyOrders.length);
  
  // Estado para mostrar notificaciones
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info', visible: boolean}>(
    {message: '', type: 'info', visible: false}
  );

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({message, type, visible: true});
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setNotification(prev => ({...prev, visible: false}));
    }, 3000);
  };
  
  // Función para marcar un pedido como en preparación
  const handleMarkAsPreparing = async (orderId: string) => {
    if (processingOrders.includes(orderId)) return;
    
    setProcessingOrders(prev => [...prev, orderId]);
    
    try {
      const success = await markOrderAsPreparing(orderId);
      
      if (success) {
        // Mostrar notificación de éxito
        showNotification('Pedido marcado como en preparación correctamente', 'success');
        // Recargar los datos
        setRefreshTrigger(prev => prev + 1);
      } else {
        showNotification('Error al marcar el pedido como en preparación', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al actualizar el estado del pedido', 'error');
    } finally {
      setProcessingOrders(prev => prev.filter(id => id !== orderId));
    }
  };
  
  // Función para marcar un pedido como listo para entregar
  const handleMarkAsReady = async (orderId: string) => {
    if (processingOrders.includes(orderId)) return;
    
    setProcessingOrders(prev => [...prev, orderId]);
    
    try {
      const success = await markOrderAsReady(orderId);
      
      if (success) {
        // Mostrar notificación de éxito
        showNotification('Pedido marcado como listo para entregar correctamente', 'success');
        // Recargar los datos
        setRefreshTrigger(prev => prev + 1);
      } else {
        showNotification('Error al marcar el pedido como listo', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al actualizar el estado del pedido', 'error');
    } finally {
      setProcessingOrders(prev => prev.filter(id => id !== orderId));
    }
  };
  
  return (
    <div>
      {/* Notificación */}
      {notification.visible && (
        <div className={`alert alert-${notification.type === 'success' ? 'success' : notification.type === 'error' ? 'danger' : 'info'} alert-dismissible fade show`}>
          {notification.message}
          <button type="button" className="btn-close" onClick={() => setNotification(prev => ({...prev, visible: false}))}></button>
        </div>
      )}
      
      <div className="alert alert-info">
        <h4 className="alert-heading">Cocina</h4>
        <p>Bienvenido al panel de cocina. Aquí puedes ver los pedidos pendientes y marcarlos como preparados.</p>
      </div>
      
      {/* Panel de estado de pedidos */}
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">Estado de Pedidos</h6>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Cargando...
              </>
            ) : (
              <>Actualizar</>
            )}
          </button>
        </div>
        <div className="card-body">
          <div className="row">
            {/* PENDIENTES */}
            <div className="col">
              <div className="card mb-3" style={{ backgroundColor: '#FFF9C4', minHeight: '200px' }}>
                <div className="card-header text-dark fw-bold d-flex justify-content-between align-items-center">
                  <span>PENDIENTES ({pendingOrders.length})</span>
                </div>
                <div className="card-body p-2">
                  {pendingOrders.length > 0 ? (
                    <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                      {pendingOrders.map((order: any) => (
                        <div key={order.id} className="card mb-2 border-warning">
                          <div className="card-body p-2">
                            <p className="card-text mb-1 small fw-bold">{order.id.substring(0, 8)}...</p>
                            <p className="card-text mb-1 small">{order.table || 'Para llevar'}</p>
                            <p className="card-text mb-0 small text-end fw-bold">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="mb-0">No hay pedidos pendientes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* PAGADOS */}
            <div className="col">
              <div className="card mb-3" style={{ backgroundColor: '#BBDEFB', minHeight: '200px' }}>
                <div className="card-header text-dark fw-bold d-flex justify-content-between align-items-center">
                  <span>PAGADOS ({paidOrders.length})</span>
                </div>
                <div className="card-body p-2">
                  {paidOrders.length > 0 ? (
                    <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                      {paidOrders.map((order: any) => {
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
                        <div key={order.id} className="card mb-2 border-info">
                          <div className="card-body p-2">
                            <p className="card-text mb-1 small fw-bold">{order.id.substring(0, 8)}...</p>
                            <p className="card-text mb-1 small">{tableInfo}</p>
                            <p className="card-text mb-1 small text-muted"><i className="bi bi-clock me-1"></i>{new Date(order.createdAt).toLocaleString()}</p>
                            <div className="d-grid gap-1 mt-2">
                              <button 
                                className="btn btn-sm btn-primary" 
                                onClick={() => handleMarkAsPreparing(order.id)}
                                disabled={processingOrders.includes(order.id)}
                              >
                                {processingOrders.includes(order.id) ? 'Procesando...' : 'Iniciar preparación'}
                              </button>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="mb-0">No hay pedidos pagados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* EN PREPARACIÓN */}
            <div className="col">
              <div className="card mb-3" style={{ backgroundColor: '#FFE0B2', minHeight: '200px' }}>
                <div className="card-header text-dark fw-bold d-flex justify-content-between align-items-center">
                  <span>EN PREPARACIÓN ({preparingOrders.length})</span>
                </div>
                <div className="card-body p-2">
                  {preparingOrders.length > 0 ? (
                    <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                      {preparingOrders.map((order: any) => {
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
                        <div key={order.id} className="card mb-2 border-warning">
                          <div className="card-body p-2">
                            <p className="card-text mb-1 small fw-bold">{order.id.substring(0, 8)}...</p>
                            <p className="card-text mb-1 small">{tableInfo}</p>
                            <p className="card-text mb-1 small text-muted"><i className="bi bi-clock me-1"></i>{new Date(order.createdAt).toLocaleString()}</p>
                            <div className="d-grid gap-1 mt-2">
                              <button 
                                className="btn btn-sm btn-success" 
                                onClick={() => handleMarkAsReady(order.id)}
                                disabled={processingOrders.includes(order.id)}
                              >
                                {processingOrders.includes(order.id) ? 'Procesando...' : 'Marcar como listo'}
                              </button>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="mb-0">No hay pedidos en preparación</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* LISTOS */}
            <div className="col">
              <div className="card mb-3" style={{ backgroundColor: '#C8E6C9', minHeight: '200px' }}>
                <div className="card-header text-dark fw-bold d-flex justify-content-between align-items-center">
                  <span>LISTOS ({readyOrders.length})</span>
                </div>
                <div className="card-body p-2">
                  {readyOrders.length > 0 ? (
                    <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                      {readyOrders.map((order: any) => {
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
                        <div key={order.id} className="card mb-2 border-success">
                          <div className="card-body p-2">
                            <p className="card-text mb-1 small fw-bold">{order.id.substring(0, 8)}...</p>
                            <p className="card-text mb-1 small">{tableInfo}</p>
                            <p className="card-text mb-1 small text-muted"><i className="bi bi-clock me-1"></i>{new Date(order.createdAt).toLocaleString()}</p>
                            <p className="card-text mb-0 small text-success">Listo para entregar</p>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="mb-0">No hay pedidos listos</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  )
}
