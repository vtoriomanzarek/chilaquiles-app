'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DirectLoginPage() {
  const [email, setEmail] = useState('admin@chilaquiles.com')
  const [password, setPassword] = useState('admin123')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setMessage('Intentando iniciar sesión...')

    try {
      // Hacer la solicitud de autenticación directamente
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      // Procesar la respuesta
      const data = await response.json()
      
      if (!response.ok) {
        setMessage(`Error: ${data.message || 'Error desconocido'}`)
        setLoading(false)
        return
      }
      
      // Guardar el token en localStorage y cookies
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userRole', data.user.role)
      document.cookie = `authToken=${data.token}; path=/; max-age=86400`
      
      setMessage(`Login exitoso como ${data.user.email} (${data.user.role})! Preparando dashboard...`)
      setSuccess(true)
      
      // Cargar el dashboard directamente en esta página
      setTimeout(() => {
        setMessage('Cargando dashboard...')
        // Mostrar el dashboard directamente aquí
        loadDashboard(data.token, data.user.role)
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      setMessage(`Error en la solicitud: ${error}`)
      setLoading(false)
    }
  }

  const loadDashboard = async (token, role) => {
    try {
      setMessage(`Cargando dashboard para rol: ${role}...`)
      
      // Cargar datos del dashboard
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar datos del dashboard')
      }
      
      const dashboardData = await response.json()
      
      // Mostrar información del dashboard
      setMessage(`Dashboard cargado correctamente. Datos: ${JSON.stringify(dashboardData).substring(0, 100)}...`)
      
      // Redirigir manualmente al dashboard
      window.location.href = '/admin/dashboard'
    } catch (error) {
      setMessage(`Error al cargar dashboard: ${error.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Login Directo</h3>
            </div>
            <div className="card-body">
              {!success && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Email:</label>
                    <select 
                      className="form-select"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    >
                      <option value="admin@chilaquiles.com">Admin (admin@chilaquiles.com)</option>
                      <option value="cocina@chilaquiles.com">Cocina (cocina@chilaquiles.com)</option>
                      <option value="mesero@chilaquiles.com">Mesero (mesero@chilaquiles.com)</option>
                      <option value="caja@chilaquiles.com">Caja (caja@chilaquiles.com)</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Contraseña:</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <small className="text-muted">
                      Contraseña para todos los usuarios: admin123
                    </small>
                  </div>
                  
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Iniciar Sesión Directo'}
                  </button>
                </>
              )}
              
              {message && (
                <div className={`alert mt-3 ${success ? 'alert-success' : 'alert-info'}`}>
                  {message}
                </div>
              )}
              
              {success && (
                <div className="text-center mt-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              )}
              
              <div className="mt-3 text-center">
                <Link href="/admin/login" className="text-decoration-none">
                  Volver al formulario normal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
