'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Importar componentes específicos para cada rol
import AdminDashboard from './AdminDashboard'
import KitchenDashboard from './KitchenDashboard'
import WaiterDashboard from './WaiterDashboard'
import StaffDashboard from './StaffDashboard'

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

interface DashboardData {
  role: string
  stats: any
  orders?: any[]
  recentOrders?: any[]
  topProducts?: any[]
  tables?: any[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('authToken')
    const userRole = localStorage.getItem('userRole')
    
    if (!token) {
      router.push('/admin/login')
      return
    }

    // Obtener información del usuario desde el token (JWT)
    try {
      // Extraer la parte payload del token y decodificarla
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      setUser({
        id: payload.userId || 'user-id',
        name: payload.name || 'Usuario',
        email: payload.email || 'usuario@ejemplo.com',
        role: payload.role || userRole || 'ADMIN'
      })
      
      // Cargar datos del dashboard
      fetchDashboardData(token)
    } catch (error) {
      console.error('Error al decodificar el token:', error)
      setError('Error al verificar la sesión')
      setLoading(false)
    }
  }, [router])
  
  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos del dashboard')
      }
      
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando dashboard...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            <button 
              className="btn btn-outline-danger"
              onClick={handleLogout}
            >
              Cerrar sesión y volver a intentar
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse" style={{ minHeight: '100vh' }}>
          <div className="position-sticky pt-3">
            <div className="px-3 py-4 border-bottom">
              <h5>Chilaquiles App</h5>
              <p className="mb-0 text-muted">{user?.name}</p>
              <small className="text-muted">{user?.role}</small>
            </div>
            
            <ul className="nav flex-column mt-3">
              <li className="nav-item">
                <Link href="/admin/dashboard" className="nav-link active">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>
              </li>
              
              <li className="nav-item">
                <Link href="/admin/orders" className="nav-link">
                  <i className="bi bi-receipt me-2"></i>
                  Pedidos
                </Link>
              </li>
              
              {/* Mostrar opciones según el rol */}
              {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                <>
                  <li className="nav-item">
                    <Link href="/admin/products" className="nav-link">
                      <i className="bi bi-box me-2"></i>
                      Productos
                    </Link>
                  </li>
                  
                  <li className="nav-item">
                    <Link href="/admin/inventory" className="nav-link">
                      <i className="bi bi-list-check me-2"></i>
                      Inventario
                    </Link>
                  </li>
                  
                  <li className="nav-item">
                    <Link href="/admin/invoices" className="nav-link">
                      <i className="bi bi-file-earmark-text me-2"></i>
                      Facturas
                    </Link>
                  </li>
                </>
              )}
              
              {user?.role === 'ADMIN' && (
                <>
                  <li className="nav-item">
                    <Link href="/admin/users" className="nav-link">
                      <i className="bi bi-people me-2"></i>
                      Usuarios
                    </Link>
                  </li>
                  
                  <li className="nav-item">
                    <Link href="/admin/reports" className="nav-link">
                      <i className="bi bi-graph-up me-2"></i>
                      Reportes
                    </Link>
                  </li>
                  
                  <li className="nav-item">
                    <Link href="/admin/settings" className="nav-link">
                      <i className="bi bi-gear me-2"></i>
                      Configuración
                    </Link>
                  </li>
                </>
              )}
              
              <li className="nav-item mt-3">
                <button 
                  className="nav-link text-danger border-0 bg-transparent" 
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Dashboard</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
              <div className="btn-group me-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => fetchDashboardData(localStorage.getItem('authToken') || '')}>
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Actualizar
                </button>
              </div>
            </div>
          </div>
          
          {/* Contenido específico según el rol */}
          {user?.role === 'ADMIN' && <AdminDashboard data={dashboardData} />}
          {user?.role === 'KITCHEN' && <KitchenDashboard data={dashboardData} />}
          {user?.role === 'WAITER' && <WaiterDashboard data={dashboardData} />}
          {user?.role === 'STAFF' && <StaffDashboard data={dashboardData} />}
        </div>
      </div>
    </div>
  )
}
