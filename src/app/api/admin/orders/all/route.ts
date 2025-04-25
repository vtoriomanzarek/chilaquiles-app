import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '../../../auth/utils'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    
    // Obtener todos los pedidos sin filtrar por estado
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Contar pedidos por estado
    const pendingCount = orders.filter(order => order.status === 'PENDING').length
    const paidCount = orders.filter(order => order.status === 'PAID').length
    const preparingCount = orders.filter(order => order.status === 'PREPARING').length
    const readyCount = orders.filter(order => order.status === 'READY').length
    const deliveredCount = orders.filter(order => order.status === 'DELIVERED').length

    // Formatear los items para la respuesta
    const formattedOrders = orders.map(order => {
      // Extraer los datos del pedido de forma segura
      const { id, total, status, createdAt, updatedAt } = order;
      // Algunos campos pueden ser opcionales en el modelo
      const table = 'table' in order ? order.table : null;
      const customer = 'customer' in order ? order.customer : null;
      
      return {
        id,
        table,
        customer,
        total,
        status,
        createdAt,
        updatedAt,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.product.name,
          productId: item.productId
        }))
      };
    })

    return NextResponse.json({
      counts: {
        total: orders.length,
        pending: pendingCount,
        paid: paidCount,
        preparing: preparingCount,
        ready: readyCount,
        delivered: deliveredCount
      },
      orders: formattedOrders
    })
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
