import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Esta clave debería estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'chilaquiles-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validar que se proporcionaron email y password
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Correo y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar el usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Si no existe el usuario o la contraseña no coincide
    if (!user) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // En un sistema real, verificaríamos la contraseña con bcrypt
    // Por ahora, como no tenemos contraseñas hasheadas, haremos una verificación simple
    // En producción, SIEMPRE usa bcrypt para verificar contraseñas
    // const passwordMatch = await bcrypt.compare(password, user.password)
    
    // Simulación de verificación de contraseña (SOLO PARA DESARROLLO)
    // Aceptamos 'admin123' como contraseña para todos los usuarios durante desarrollo
    const passwordMatch = password === 'admin123' // Solo para pruebas

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar que el usuario tenga un rol administrativo
    if (user.role !== 'ADMIN' && user.role !== 'STAFF' && user.role !== 'KITCHEN' && user.role !== 'WAITER') {
      return NextResponse.json(
        { message: 'No tienes permisos para acceder al panel de administración' },
        { status: 403 }
      )
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    )

    // Devolver token y datos básicos del usuario
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
