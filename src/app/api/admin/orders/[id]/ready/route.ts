import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../../../auth/utils';

const prisma = new PrismaClient();

/**
 * Endpoint para marcar un pedido como listo (preparado)
 * Solo puede ser usado por usuarios con rol ADMIN o KITCHEN
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el rol sea válido para esta acción
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'KITCHEN') {
      return NextResponse.json(
        { error: 'No tiene permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Verificar que el pedido exista y esté en un estado válido para ser marcado como listo
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Solo se pueden marcar como listos los pedidos que están pagados o en preparación
    if (order.status !== 'PAID' && order.status !== 'PREPARING') {
      return NextResponse.json(
        { error: 'El pedido no puede ser marcado como listo desde su estado actual' },
        { status: 400 }
      );
    }

    // Actualizar el estado del pedido a READY (listo)
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status: 'READY',
        updatedAt: new Date()
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pedido marcado como listo',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error al marcar el pedido como listo:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
