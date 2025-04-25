// Script para verificar el estado de los pedidos en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
  try {
    // Obtener todos los pedidos
    const allOrders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Contar pedidos por estado
    const pendingCount = allOrders.filter(order => order.status === 'PENDING').length;
    const paidCount = allOrders.filter(order => order.status === 'PAID').length;
    const preparingCount = allOrders.filter(order => order.status === 'PREPARING').length;
    const readyCount = allOrders.filter(order => order.status === 'READY').length;
    const deliveredCount = allOrders.filter(order => order.status === 'DELIVERED').length;

    console.log('=== ESTADO ACTUAL DE LOS PEDIDOS EN LA BASE DE DATOS ===');
    console.log(`Total de pedidos: ${allOrders.length}`);
    console.log(`Pedidos PENDING (pendientes de pago): ${pendingCount}`);
    console.log(`Pedidos PAID (pagados): ${paidCount}`);
    console.log(`Pedidos PREPARING (en preparación): ${preparingCount}`);
    console.log(`Pedidos READY (listos para entregar): ${readyCount}`);
    console.log(`Pedidos DELIVERED (entregados): ${deliveredCount}`);
    
    console.log('\n=== DETALLES DE LOS PEDIDOS ===');
    allOrders.forEach((order, index) => {
      console.log(`\nPedido #${index + 1}:`);
      console.log(`ID: ${order.id}`);
      console.log(`Estado: ${order.status}`);
      console.log(`Creado: ${order.createdAt}`);
      console.log(`Total: ${order.total}`);
      console.log('Items:');
      order.items.forEach(item => {
        console.log(`  - ${item.quantity}x ${item.product.name} ($${item.price})`);
      });
    });

  } catch (error) {
    console.error('Error al verificar los pedidos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
