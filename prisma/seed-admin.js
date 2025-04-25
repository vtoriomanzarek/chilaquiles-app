const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  // Verificar si ya existe un usuario administrador
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: 'admin@chilaquiles.com',
    },
  })

  if (!existingAdmin) {
    // Crear usuario administrador
    await prisma.user.create({
      data: {
        email: 'admin@chilaquiles.com',
        name: 'Administrador',
        role: 'ADMIN',
        // En un sistema real, la contraseña debería estar hasheada
        // password: await bcrypt.hash('admin123', 10),
      },
    })
    console.log('Usuario administrador creado exitosamente')
  } else {
    console.log('El usuario administrador ya existe')
  }

  // Crear usuario de cocina
  const existingKitchen = await prisma.user.findUnique({
    where: {
      email: 'cocina@chilaquiles.com',
    },
  })

  if (!existingKitchen) {
    await prisma.user.create({
      data: {
        email: 'cocina@chilaquiles.com',
        name: 'Cocina',
        role: 'KITCHEN',
      },
    })
    console.log('Usuario de cocina creado exitosamente')
  }

  // Crear usuario mesero
  const existingWaiter = await prisma.user.findUnique({
    where: {
      email: 'mesero@chilaquiles.com',
    },
  })

  if (!existingWaiter) {
    await prisma.user.create({
      data: {
        email: 'mesero@chilaquiles.com',
        name: 'Mesero',
        role: 'WAITER',
      },
    })
    console.log('Usuario mesero creado exitosamente')
  }

  // Crear usuario de caja
  const existingCashier = await prisma.user.findUnique({
    where: {
      email: 'caja@chilaquiles.com',
    },
  })

  if (!existingCashier) {
    await prisma.user.create({
      data: {
        email: 'caja@chilaquiles.com',
        name: 'Cajero',
        role: 'STAFF',
      },
    })
    console.log('Usuario de caja creado exitosamente')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
