'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Importar componentes específicos para cada rol
import AdminDashboard from './AdminDashboard'
import KitchenDashboard from './KitchenDashboard'
import WaiterDashboard from './WaiterDashboard'
import StaffDashboard from './StaffDashboard'
import AdminLayout from '../components/AdminLayout'

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
    <AdminLayout title="Dashboard">
      {/* Contenido específico según el rol */}
      {user?.role === 'ADMIN' && <AdminDashboard data={dashboardData} />}
      {user?.role === 'KITCHEN' && <KitchenDashboard data={dashboardData} />}
      {user?.role === 'WAITER' && <WaiterDashboard data={dashboardData} />}
      {user?.role === 'STAFF' && <StaffDashboard data={dashboardData} />}
    </AdminLayout>
  )
}
