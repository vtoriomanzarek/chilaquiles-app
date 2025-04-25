import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../../../../api/auth/utils';

const prisma = new PrismaClient();

/**
 * Endpoint para registrar el pago de un pedido
 * Solo puede ser usado por usuarios con rol ADMIN o STAFF (caja)
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Endpoint de pago llamado para el pedido:', params.id);
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    console.log('Resultado de autenticación:', authResult);
    
    if (!authResult.success) {
      console.error('Error de autenticación:', authResult.error);
      return NextResponse.json(
        { error: 'No autorizado: ' + authResult.error },
        { status: 401 }
      );
    }

    // Verificar que el rol sea válido para esta acción
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'No tiene permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const { id } = params;
    let paymentMethod;
    
    try {
      const body = await request.json();
      paymentMethod = body.paymentMethod;
      console.log('Datos recibidos:', { id, paymentMethod, body });
    } catch (error) {
      console.error('Error al parsear el cuerpo de la solicitud:', error);
      return NextResponse.json(
        { error: 'Error al procesar los datos de la solicitud' },
        { status: 400 }
      );
    }

    // Verificar que se proporcionó un método de pago válido
    if (!paymentMethod || !['CASH', 'CARD', 'TRANSFER'].includes(paymentMethod)) {
      console.error('Método de pago no válido:', paymentMethod);
      return NextResponse.json(
        { error: `Método de pago no válido: ${paymentMethod || 'no proporcionado'}` },
        { status: 400 }
      );
    }

    // Verificar que el pedido exista y esté en un estado válido para ser pagado
    console.log('Buscando pedido con ID:', id);
    const order = await prisma.order.findUnique({
      where: { id }
    });
    
    console.log('Pedido encontrado:', order);

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Solo se pueden pagar los pedidos que están pendientes
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'El pedido ya ha sido pagado o no puede ser pagado en su estado actual' },
        { status: 400 }
      );
    }

    // Actualizar el estado del pedido a PAID (pagado) y registrar el método de pago
    console.log('Actualizando pedido a estado PAID con método:', paymentMethod);
    let updatedOrder;
    
    try {
      updatedOrder = await prisma.order.update({
        where: { id },
        data: { 
          status: 'PAID',
          // Almacenar el método de pago y la fecha de pago como metadatos ya que no están en el esquema
          metadata: JSON.stringify({ 
            paymentMethod,
            paidAt: new Date().toISOString() 
          }),
          updatedAt: new Date()
        },
      });
      console.log('Pedido actualizado correctamente:', updatedOrder);
    } catch (dbError) {
      console.error('Error al actualizar el pedido en la base de datos:', dbError);
      return NextResponse.json(
        { error: 'Error al actualizar el pedido en la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pago registrado correctamente',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error al registrar el pago:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
