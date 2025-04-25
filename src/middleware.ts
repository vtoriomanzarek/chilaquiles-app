import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Esta clave debería estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'chilaquiles-secret-key-change-in-production'

export async function middleware(request: NextRequest) {
  // Obtener la ruta actual
  const path = request.nextUrl.pathname

  // Definir rutas públicas (no requieren autenticación)
  const isPublicPath = 
    path === '/admin/login' || 
    !path.startsWith('/admin') || 
    path === '/api/auth/login'

  // Obtener el token de las cookies o del header de autorización
  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('Authorization')?.split(' ')[1]

  // Si es una ruta pública, permitir acceso
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Si no hay token y la ruta requiere autenticación, redirigir al login
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    // Verificar el token
    const secret = new TextEncoder().encode(JWT_SECRET)
    await jwtVerify(token, secret)
    
    // Token válido, permitir acceso
    return NextResponse.next()
  } catch (error) {
    // Token inválido, redirigir al login
    console.error('Error verificando token:', error)
    
    // Almacenar la URL original para redireccionar después del login
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.set('redirectUrl', request.url)
    return response
  }
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
