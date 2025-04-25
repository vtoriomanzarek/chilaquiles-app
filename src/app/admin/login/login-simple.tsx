'use client'

import { useState } from 'react'

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
      
      // Guardar el token en localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userRole', data.user.role)
      
      setMessage('Login exitoso! Redirigiendo...')
      
      // Esperar un momento antes de redirigir
      setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 1000)
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
              </div>
              
              <div className="mb-3">
                <label className="form-label">Contraseña:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
