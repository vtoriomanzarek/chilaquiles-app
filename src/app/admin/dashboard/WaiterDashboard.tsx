'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '../../../utils/format'
import { getStatusColor, getStatusText, markOrderAsDelivered } from './utils'

interface WaiterDashboardProps {
  data: any
}

export default function WaiterDashboard({ data }: WaiterDashboardProps) {
  const [stats, setStats] = useState(data?.stats || {});
  const [orders, setOrders] = useState(data?.orders || []);
  const tables = data?.tables || [];
  const [processingOrders, setProcessingOrders] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Cargar datos actualizados cuando cambie el refreshTrigger
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los datos del dashboard');
        }
        
        const newData = await response.json();
        console.log('Datos actualizados del dashboard:', newData);
        setStats(newData.stats || {});
        setOrders(newData.orders || []);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      }
    };
    
    fetchDashboardData();
  }, [refreshTrigger]);
  
  // Filtrar pedidos que están listos para entregar (relevantes para meseros)
  const readyOrders = orders.filter((order: any) => order.status === 'READY');
  
  // Función para marcar un pedido como entregado
  const handleMarkAsDelivered = async (orderId: string) => {
    if (processingOrders.includes(orderId)) return;
    
    setProcessingOrders(prev => [...prev, orderId]);
    
    try {
      const success = await markOrderAsDelivered(orderId);
      
      if (success) {
        // Recargar los datos
        setRefreshTrigger(prev => prev + 1);
        // Notificar al usuario
        alert('Pedido marcado como entregado correctamente');
      } else {
        alert('Error al marcar el pedido como entregado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado del pedido');
    } finally {
      setProcessingOrders(prev => prev.filter(id => id !== orderId));
    }
  };
  
  return (
    <div>
      <div className="alert alert-info">
        <h4 className="alert-heading">Mesero</h4>
        <p>Bienvenido al panel de meseros. Aquí puedes ver los pedidos listos para entregar y registrar nuevos pedidos.</p>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Listos para Entregar
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {typeof stats.readyOrders === 'number' ? stats.readyOrders : 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-check-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Entregados Hoy
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {typeof stats.deliveredToday === 'number' ? stats.deliveredToday : 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-truck fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Nuevos Pedidos
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    <Link href="/order" className="btn btn-sm btn-primary">
                      <i className="bi bi-plus-circle me-1"></i> Crear pedido
                    </Link>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-clipboard-plus fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">Pedidos listos para entregar</h6>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => setRefreshTrigger(prev => prev + 1)}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
              </button>
            </div>
            <div className="card-body">
              {readyOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Mesa/Cliente</th>
                        <th>Productos</th>
                        <th>Estado</th>
                        <th>Fecha/Hora</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
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
                          <td>
                            <span className={`badge bg-${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => handleMarkAsDelivered(order.id)}
                              disabled={processingOrders.includes(order.id)}
                            >
                              {processingOrders.includes(order.id) ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                  Procesando...
                                </>
                              ) : (
                                'Marcar como entregado'
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-info-circle text-info fa-3x mb-3"></i>
                  <p>No hay pedidos listos para entregar en este momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Estado de mesas</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {tables.length > 0 ? (
                  tables.map((table: any) => (
                    <div className="col-4 mb-3" key={table.id || table.number}>
                      <div className={`card ${table.status === 'AVAILABLE' ? 'bg-success' : 'bg-danger'} text-white text-center p-3`}>
                        <h5>Mesa {table.number}</h5>
                        <small>{table.status === 'AVAILABLE' ? 'Disponible' : 'Ocupada'}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-4">
                    <p className="text-muted">No hay información de mesas disponible.</p>
                    <div className="row">
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <div className="col-4 mb-3" key={num}>
                          <div className={`card ${num % 2 === 0 ? 'bg-success' : 'bg-danger'} text-white text-center p-3`}>
                            <h5>Mesa {num}</h5>
                            <small>{num % 2 === 0 ? 'Disponible' : 'Ocupada'}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
