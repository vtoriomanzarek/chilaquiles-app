import { PrismaClient } from '@prisma/client'

type ProductCategory = 'TORTILLA_CHIPS' | 'SAUCE' | 'TOPPING' | 'DRINK'

const prisma = new PrismaClient()

async function main() {
  // Crear productos
  const totoposBasicos = await prisma.product.create({
    data: {
      name: 'Totopos Tradicionales',
      description: 'Totopos de maíz crujientes',
      price: 45.00,
      category: 'TORTILLA_CHIPS',
    },
  })

  const totoposAzules = await prisma.product.create({
    data: {
      name: 'Totopos de Maíz Azul',
      description: 'Totopos artesanales de maíz azul',
      price: 55.00,
      category: 'TORTILLA_CHIPS',
    },
  })

  const salsaVerde = await prisma.product.create({
    data: {
      name: 'Salsa Verde',
      description: 'Salsa de chile serrano y tomatillo',
      price: 15.00,
      category: 'SAUCE',
    },
  })

  const salsaRoja = await prisma.product.create({
    data: {
      name: 'Salsa Roja',
      description: 'Salsa de chile guajillo y jitomate',
      price: 15.00,
      category: 'SAUCE',
    },
  })

  const pollo = await prisma.product.create({
    data: {
      name: 'Pollo Deshebrado',
      description: 'Pollo deshebrado sazonado',
      price: 25.00,
      category: 'TOPPING',
    },
  })

  const huevo = await prisma.product.create({
    data: {
      name: 'Huevo Estrellado',
      description: 'Huevo frito',
      price: 20.00,
      category: 'TOPPING',
    },
  })

  const cafe = await prisma.product.create({
    data: {
      name: 'Café de Olla',
      description: 'Café tradicional mexicano con canela',
      price: 35.00,
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
      total: 135.00,
      items: {
        create: [
          {
            productId: totoposBasicos.id,
            quantity: 1,
            price: totoposBasicos.price,
          },
          {
            productId: salsaVerde.id,
            quantity: 1,
            price: salsaVerde.price,
          },
          {
            productId: pollo.id,
            quantity: 1,
            price: pollo.price,
          },
          {
            productId: cafe.id,
            quantity: 1,
            price: cafe.price,
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
