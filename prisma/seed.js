const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Limpiar la base de datos
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('Base de datos limpiada')

  // BASES DE TOTOPOS
  const totoposMaiz = await prisma.product.create({
    data: {
      name: 'Totopos de Maíz',
      description: 'Tradicionales de maíz amarillo',
      price: 45.00,
      category: 'TORTILLA_CHIPS',
    },
  })

  const totoposAzules = await prisma.product.create({
    data: {
      name: 'Totopos de Maíz Azul',
      description: 'Artesanales de maíz azul',
      price: 55.00,
      category: 'TORTILLA_CHIPS',
    },
  })

  const totoposChipotle = await prisma.product.create({
    data: {
      name: 'Totopos con Chipotle',
      description: 'Totopos con sabor a chile chipotle',
      price: 50.00,
      category: 'TORTILLA_CHIPS',
    },
  })

  // SALSAS
  const salsaVerde = await prisma.product.create({
    data: {
      name: 'Salsa Verde',
      description: 'Tomate verde con chile serrano',
      price: 15.00,
      category: 'SAUCE',
    },
  })

  const salsaRoja = await prisma.product.create({
    data: {
      name: 'Salsa Roja',
      description: 'Chile guajillo y tomate',
      price: 15.00,
      category: 'SAUCE',
    },
  })

  const salsaNegra = await prisma.product.create({
    data: {
      name: 'Salsa Negra',
      description: 'Chiles tatemados y especias',
      price: 20.00,
      category: 'SAUCE',
    },
  })

  const salsaMorita = await prisma.product.create({
    data: {
      name: 'Salsa Morita',
      description: 'Chile morita ahumado',
      price: 18.00,
      category: 'SAUCE',
    },
  })

  const salsaHabanero = await prisma.product.create({
    data: {
      name: 'Salsa Habanero',
      description: 'Cremosa de chile habanero',
      price: 22.00,
      category: 'SAUCE',
    },
  })

  // PROTEÍNAS
  const huevoRevuelto = await prisma.product.create({
    data: {
      name: 'Huevo Revuelto',
      description: 'Huevos revueltos al gusto',
      price: 20.00,
      category: 'PROTEIN',
    },
  })

  const huevoEstrellado = await prisma.product.create({
    data: {
      name: 'Huevo Estrellado',
      description: 'Huevo frito con yema suave',
      price: 20.00,
      category: 'PROTEIN',
    },
  })

  const polloDeshebrado = await prisma.product.create({
    data: {
      name: 'Pollo Deshebrado',
      description: 'Pollo deshebrado sazonado',
      price: 30.00,
      category: 'PROTEIN',
    },
  })

  const polloEmpanizado = await prisma.product.create({
    data: {
      name: 'Pollo Empanizado',
      description: 'Trozos de pollo empanizado',
      price: 35.00,
      category: 'PROTEIN',
    },
  })

  const resDeshebrada = await prisma.product.create({
    data: {
      name: 'Carne de Res Deshebrada',
      description: 'Res deshebrada con especias',
      price: 40.00,
      category: 'PROTEIN',
    },
  })

  const bistec = await prisma.product.create({
    data: {
      name: 'Bistec de Res',
      description: 'Bistec de res a la plancha',
      price: 45.00,
      category: 'PROTEIN',
    },
  })

  // COMPLEMENTOS
  const crema = await prisma.product.create({
    data: {
      name: 'Crema Ácida',
      description: 'Crema ácida de vaca',
      price: 10.00,
      category: 'EXTRAS',
    },
  })

  const quesoFresco = await prisma.product.create({
    data: {
      name: 'Queso Fresco',
      description: 'Queso fresco desmoronado',
      price: 15.00,
      category: 'EXTRAS',
    },
  })

  const cebolla = await prisma.product.create({
    data: {
      name: 'Cebolla Blanca',
      description: 'Cebolla blanca picada',
      price: 5.00,
      category: 'EXTRAS',
    },
  })

  const aguacate = await prisma.product.create({
    data: {
      name: 'Aguacate',
      description: 'Aguacate en rodajas',
      price: 15.00,
      category: 'EXTRAS',
    },
  })

  const cilantro = await prisma.product.create({
    data: {
      name: 'Cilantro',
      description: 'Cilantro fresco picado',
      price: 5.00,
      category: 'EXTRAS',
    },
  })

  const chorizo = await prisma.product.create({
    data: {
      name: 'Chorizo',
      description: 'Chorizo frito desmoronado (premium)',
      price: 25.00,
      category: 'EXTRAS',
    },
  })

  const chicharron = await prisma.product.create({
    data: {
      name: 'Chicharrón',
      description: 'Chicharrón de cerdo desmoronado (premium)',
      price: 25.00,
      category: 'EXTRAS',
    },
  })

  // BEBIDAS
  const jugoNaranja = await prisma.product.create({
    data: {
      name: 'Jugo de Naranja',
      description: 'Jugo natural de naranja',
      price: 30.00,
      category: 'DRINK',
    },
  })

  const jugoVerde = await prisma.product.create({
    data: {
      name: 'Jugo Verde',
      description: 'Piña, apio, nopal, perejil y naranja',
      price: 35.00,
      category: 'DRINK',
    },
  })

  const cafeAmericano = await prisma.product.create({
    data: {
      name: 'Café Americano',
      description: 'Café de grano recién molido',
      price: 25.00,
      category: 'DRINK',
    },
  })

  const capuchino = await prisma.product.create({
    data: {
      name: 'Capuchino',
      description: 'Café con espuma de leche',
      price: 35.00,
      category: 'DRINK',
    },
  })

  const refresco = await prisma.product.create({
    data: {
      name: 'Refresco',
      description: 'Variedad disponible (consultar)',
      price: 20.00,
      category: 'DRINK',
    },
  })

  // Crear usuario de prueba
  const usuario = await prisma.user.create({
    data: {
      email: 'cliente@ejemplo.com',
      name: 'Cliente Prueba',
    },
  })

  // Crear una orden de prueba
  await prisma.order.create({
    data: {
      userId: usuario.id,
      total: 155.00,
      items: {
        create: [
          {
            productId: totoposMaiz.id,
            quantity: 1,
            price: totoposMaiz.price,
          },
          {
            productId: salsaVerde.id,
            quantity: 1,
            price: salsaVerde.price,
          },
          {
            productId: polloDeshebrado.id,
            quantity: 1,
            price: polloDeshebrado.price,
          },
          {
            productId: quesoFresco.id,
            quantity: 1,
            price: quesoFresco.price,
          },
          {
            productId: aguacate.id,
            quantity: 1,
            price: aguacate.price,
          },
          {
            productId: jugoNaranja.id,
            quantity: 1,
            price: jugoNaranja.price,
          },
        ],
      },
    },
  })

  console.log('Datos de prueba creados exitosamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
