'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('admin@chilaquiles.com')
  const [password, setPassword] = useState('admin123')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setMessage('Intentando iniciar sesión...')

    try {
      // Hacer la solicitud de autenticación
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      setMessage(`Respuesta del servidor: ${response.status}`)
      
      // Procesar la respuesta
      const data = await response.json()
      
      if (!response.ok) {
        setMessage(`Error: ${data.message || 'Error desconocido'}`)
        return
      }
      
      // Guardar el token en localStorage y cookies para que el middleware lo detecte
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userRole', data.user.role)
      
      // Establecer cookie para que el middleware la detecte
      document.cookie = `authToken=${data.token}; path=/; max-age=86400`
      
      setMessage('Login exitoso! Redirigiendo...')
      
      // Esperar un momento antes de redirigir
      setTimeout(() => {
        // Usar redirección directa para evitar problemas con el middleware
        window.location.replace('/admin/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      setMessage(`Error en la solicitud: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Login Simple</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="text"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <small className="text-muted">
                  Usuarios disponibles: admin@chilaquiles.com, cocina@chilaquiles.com, mesero@chilaquiles.com, caja@chilaquiles.com
                </small>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Contraseña:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {loading ? 'Procesando...' : 'Iniciar Sesión'}
              </button>
              
              {message && (
                <div className="alert alert-info mt-3">
                  {message}
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
