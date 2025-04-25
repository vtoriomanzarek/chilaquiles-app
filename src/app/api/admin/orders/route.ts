import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth/utils';

const prisma = new PrismaClient();

/**
 * Endpoint para obtener la lista de pedidos
 * Permite filtrar por estado y limitar la cantidad de resultados
 */
export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const skip = (page - 1) * limit;

    // Construir filtros según el rol del usuario
    const filters: any = {};
    
    // Si se especificó un estado, filtrar por él
    if (status) {
      filters.status = status;
    }
    
    // Filtros específicos según el rol
    switch (authResult.user?.role) {
      case 'KITCHEN':
        // La cocina solo ve pedidos pagados o en preparación
        filters.status = { in: ['PAID', 'PREPARING'] };
        break;
      case 'WAITER':
        // Los meseros ven pedidos listos para entregar o recién entregados
        filters.status = { in: ['READY', 'DELIVERED'] };
        break;
      case 'STAFF':
        // La caja ve principalmente pedidos pendientes de pago
        if (!status) {
          filters.status = { in: ['PENDING', 'PAID'] };
        }
        break;
      // El admin puede ver todos los pedidos
    }

    // Obtener los pedidos con sus items
    const orders = await prisma.order.findMany({
      where: filters,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Contar el total de pedidos para la paginación
    const total = await prisma.order.count({
      where: filters
    });

    // Transformar los datos para la respuesta
    const formattedOrders = orders.map(order => {
      // Intentar extraer metadatos si existen
      let tableInfo = '';
      let paymentMethodInfo = null;
      let paidAtInfo = null;
      
      try {
        if (order.metadata) {
          const metadata = JSON.parse(order.metadata);
          tableInfo = metadata.table || '';
          paymentMethodInfo = metadata.paymentMethod || null;
          paidAtInfo = metadata.paidAt ? new Date(metadata.paidAt) : null;
        }
      } catch (e) {
        console.error('Error al parsear metadatos:', e);
      }
      
      return {
        id: order.id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        status: order.status,
        total: order.total,
        metadata: order.metadata,
        table: tableInfo,  // Extraído de los metadatos
        paymentMethod: paymentMethodInfo,  // Extraído de los metadatos
        paidAt: paidAtInfo,  // Extraído de los metadatos
        user: order.user,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.product.name,
          productId: item.productId
        }))
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
