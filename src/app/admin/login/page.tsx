'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  
  // Efecto para redirigir después de un login exitoso
  useEffect(() => {
    if (loginSuccess) {
      console.log('Redirigiendo al dashboard...');
      // Usar setTimeout para asegurar que las cookies se hayan establecido
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 500);
    }
  }, [loginSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Iniciando sesión con:', { email, password })
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Respuesta del servidor:', response.status)
      
      const data = await response.json()
      console.log('Datos recibidos:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión')
      }
      
      // Guardar el token en localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userRole', data.user.role)
      
      // Guardar el token en cookies también para el middleware
      document.cookie = `authToken=${data.token}; path=/; max-age=28800; SameSite=Strict`
      
      console.log('Login exitoso, preparando redirección...')
      // Marcar el login como exitoso para que el efecto se encargue de la redirección
      setLoginSuccess(true)
    } catch (err: any) {
      console.error('Error en login:', err)
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }
  
  // Función alternativa para login (por si el formulario sigue dando problemas)
  const handleLoginClick = async () => {
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña')
      return
    }
    
    console.log('Iniciando sesión mediante botón alternativo')
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Respuesta del servidor:', response.status)
      
      const data = await response.json()
      console.log('Datos recibidos:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión')
      }
      
      // Guardar el token en localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userRole', data.user.role)
      
      // Guardar el token en cookies también para el middleware
      document.cookie = `authToken=${data.token}; path=/; max-age=28800; SameSite=Strict`
      
      console.log('Login exitoso, redirigiendo...')
      // Esperar un poco para asegurar que las cookies se hayan establecido
      setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 500)
    } catch (err: any) {
      console.error('Error en login alternativo:', err)
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Administración de Chilaquiles</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Iniciando sesión...
                    </>
                  ) : 'Iniciar sesión'}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <Link href="/" className="text-decoration-none">
                  Volver a la página principal
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <small className="text-muted">
              Acceso exclusivo para personal autorizado
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}
