import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { products, total, orderNumber, tableNumber } = body

    // Verificar si se proporcionaron los datos necesarios
    if (!products || !total || !orderNumber) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos para crear el pedido' },
        { status: 400 }
      )
    }
    
    // Preparar los metadatos del pedido (número de orden y mesa)
    const metadata = {
      orderNumber,
      table: tableNumber || 'Para llevar' // Si no se proporciona mesa, es para llevar
    }

    // Crear un usuario anónimo para el pedido si no existe uno
    let user = await prisma.user.findFirst({
      where: {
        email: 'cliente@ejemplo.com'
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'cliente@ejemplo.com',
          name: 'Cliente Anónimo',
        }
      })
    }

    // Preparar los items del pedido
    const orderItems = []
    
    // Procesar productos individuales (no arrays)
    for (const [category, product] of Object.entries(products)) {
      if (product && category !== 'extras') {
        // Asegurarse de que product es un objeto con id y price
        const productObj = product as { id: string; price: number };
        orderItems.push({
          productId: productObj.id,
          quantity: 1,
          price: productObj.price
        })
      }
    }
    
    // Procesar complementos (array de productos)
    if (products.extras && Array.isArray(products.extras)) {
      for (const extra of products.extras) {
        // Asegurarse de que extra es un objeto con id y price
        const extraObj = extra as { id: string; price: number };
        orderItems.push({
          productId: extraObj.id,
          quantity: 1,
          price: extraObj.price
        })
      }
    }

    // Crear el pedido en la base de datos
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        items: {
          create: orderItems
        },
        status: 'PENDING', // Estado inicial del pedido
        metadata: JSON.stringify(metadata) // Guardar metadatos como JSON string
      },
      include: {
        items: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Pedido creado exitosamente',
      order
    })
  } catch (error) {
    console.error('Error al crear el pedido:', error)
    return NextResponse.json(
      { error: 'Error al crear el pedido' },
      { status: 500 }
    )
  }
}

// Endpoint para obtener todos los pedidos (para fines de prueba)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error al obtener los pedidos:', error)
    return NextResponse.json(
      { error: 'Error al obtener los pedidos' },
      { status: 500 }
    )
  }
}
