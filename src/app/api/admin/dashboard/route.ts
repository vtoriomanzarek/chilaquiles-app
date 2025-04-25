import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'chilaquiles-secret-key-change-in-production'

export async function GET(request: Request) {
  try {
    // Obtener token de autorización
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verificar token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener rol del usuario
    const userRole = decoded.role

    // Datos comunes para todos los roles
    const totalOrders = await prisma.order.count()
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    })
    const preparingOrders = await prisma.order.count({
      where: { status: 'PREPARING' }
    })
    const readyOrders = await prisma.order.count({
      where: { status: 'READY' }
    })
    const deliveredOrders = await prisma.order.count({
      where: { status: 'DELIVERED' }
    })

    // Calcular ventas totales
    const totalSales = await prisma.order.aggregate({
      _sum: {
        total: true
      }
    })

    // Datos específicos según el rol
    if (userRole === 'ADMIN') {
      // Para administradores: todos los datos
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      })

      // Obtener detalles de los productos más vendidos
      const productIds = topProducts.map(item => item.productId)
      const productDetails = await prisma.product.findMany({
        where: {
          id: {
            in: productIds
          }
        }
      })

      // Combinar datos de productos más vendidos
      const topProductsWithDetails = topProducts.map(item => {
        const product = productDetails.find(p => p.id === item.productId)
        return {
          id: item.productId,
          name: product?.name || 'Producto desconocido',
          quantity: item._sum.quantity,
          price: product?.price || 0
        }
      })

      return NextResponse.json({
        role: userRole,
        stats: {
          totalOrders,
          pendingOrders,
          preparingOrders,
          readyOrders,
          deliveredOrders,
          totalSales: totalSales._sum.total || 0
        },
        recentOrders,
        topProducts: topProductsWithDetails
      })
    } 
    else if (userRole === 'KITCHEN') {
      // Para cocina: pedidos pendientes y en preparación
      const pendingAndPreparingOrders = await prisma.order.findMany({
        where: {
          status: {
            in: ['PENDING', 'PAID', 'PREPARING']
          }
        },
        orderBy: { createdAt: 'asc' },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      return NextResponse.json({
        role: userRole,
        stats: {
          pendingOrders,
          preparingOrders,
          readyOrders
        },
        orders: pendingAndPreparingOrders
      })
    } 
    else if (userRole === 'WAITER') {
      // Para meseros: pedidos listos para entregar
      const readyOrdersList = await prisma.order.findMany({
        where: {
          status: 'READY'
        },
        orderBy: { createdAt: 'asc' },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
      
      // Para propósitos de prueba, vamos a establecer manualmente el contador de pedidos entregados hoy
      // Esto es temporal para mostrar que el contador funciona
      
      // Obtener todos los pedidos entregados para depuración
      const allDeliveredOrders = await prisma.order.findMany({
        where: {
          status: 'DELIVERED'
        },
        select: {
          id: true,
          status: true,
          updatedAt: true,
          createdAt: true
        }
      })
      
      console.log('Todos los pedidos entregados:', JSON.stringify(allDeliveredOrders, null, 2))
      
      // Contar los pedidos entregados hoy (comparando la fecha)
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const deliveredToday = allDeliveredOrders.filter((order: any) => {
        const orderDate = new Date(order.updatedAt); // Usamos updatedAt porque es cuando se marcó como entregado
        return orderDate >= startOfToday;
      }).length
      
      console.log('Pedidos entregados hoy (para demostración):', deliveredToday)

      return NextResponse.json({
        role: userRole,
        stats: {
          readyOrders: readyOrdersList.length,  // Número, no el array completo
          deliveredOrders: deliveredOrders,      // Número total de entregados
          deliveredToday: deliveredToday         // Número de entregados hoy
        },
        orders: readyOrdersList
      })
    } 
    else if (userRole === 'STAFF') {
      // Para caja: pedidos pendientes de pago y resumen de ventas
      const pendingPaymentOrders = await prisma.order.findMany({
        where: {
          status: 'PENDING'
        },
        orderBy: { createdAt: 'asc' },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Ventas del día
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todaySales = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: today
          },
          status: {
            in: ['PAID', 'PREPARING', 'READY', 'DELIVERED']
          }
        },
        _sum: {
          total: true
        }
      })

      return NextResponse.json({
        role: userRole,
        stats: {
          pendingOrders,
          totalOrders,
          todaySales: todaySales._sum.total || 0,
          totalSales: totalSales._sum.total || 0
        },
        orders: pendingPaymentOrders
      })
    } 
    else {
      // Rol no reconocido
      return NextResponse.json({ error: 'Rol no autorizado' }, { status: 403 })
    }
  } catch (error) {
    console.error('Error en dashboard:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
