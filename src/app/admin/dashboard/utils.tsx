/**
 * Utilidades para el dashboard administrativo
 */

/**
 * Obtiene el color del estado de un pedido para mostrar en la UI
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'PAID': return 'info';
    case 'PREPARING': return 'primary';
    case 'READY': return 'success';
    case 'DELIVERED': return 'secondary';
    case 'CANCELLED': return 'danger';
    default: return 'light';
  }
}

/**
 * Obtiene el texto en español del estado de un pedido
 */
export function getStatusText(status: string): string {
  switch (status) {
    case 'PENDING': return 'Pendiente';
    case 'PAID': return 'Pagado';
    case 'PREPARING': return 'Preparando';
    case 'READY': return 'Listo';
    case 'DELIVERED': return 'Entregado';
    case 'CANCELLED': return 'Cancelado';
    default: return status;
  }
}

/**
 * Función para marcar un pedido como en preparación (para cocina)
 */
export async function markOrderAsPreparing(orderId: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'PREPARING' })
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el estado del pedido');
    }
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

/**
 * Función para marcar un pedido como listo (para cocina)
 */
export async function markOrderAsReady(orderId: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/orders/${orderId}/ready`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el estado del pedido');
    }
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

/**
 * Función para marcar un pedido como entregado (para meseros)
 */
export async function markOrderAsDelivered(orderId: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/orders/${orderId}/delivered`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el estado del pedido');
    }
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

/**
 * Función para registrar el pago de un pedido (para caja)
 */
export async function registerOrderPayment(orderId: string, paymentMethod: string): Promise<{success: boolean, message?: string}> {
  try {
    console.log(`Intentando registrar pago para orden ${orderId} con método ${paymentMethod}`);
    
    // Obtener token de localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No se encontró token de autenticación');
      return { success: false, message: 'No se encontró token de autenticación' };
    }
    
    // También establecer el token como cookie para que el servidor pueda acceder a él
    document.cookie = `authToken=${token}; path=/; max-age=3600; SameSite=Strict`;
    
    console.log('Token obtenido:', token.substring(0, 20) + '...');
    
    const response = await fetch(`/api/admin/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ paymentMethod })
    });
    
    // Obtener la respuesta completa para diagnóstico
    const responseData = await response.json();
    console.log('Respuesta del servidor:', responseData);
    
    if (!response.ok) {
      const errorMessage = responseData.error || 'Error al registrar el pago del pedido';
      console.error(`Error ${response.status}: ${errorMessage}`);
      return { success: false, message: errorMessage };
    }
    
    return { success: true, message: 'Pago registrado correctamente' };
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Función para obtener la lista de pedidos según el rol
 */
export async function fetchOrders(): Promise<any[]> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/orders/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener los pedidos');
    }
    
    const data = await response.json();
    console.log('Datos obtenidos de la API:', data);
    return data.orders || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

/**
 * Función para obtener todos los pedidos sin filtrar
 */
export async function fetchAllOrders(): Promise<any> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/orders/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener todos los pedidos');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error);
    return { counts: {}, orders: [] };
  }
}
