const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Crear usuario administrador personalizado
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'victorsm2893@gmail.com',
      },
    })

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: 'victorsm2893@gmail.com',
          name: 'Victor',
          role: 'ADMIN',
        },
      })
      console.log('Usuario administrador personalizado creado exitosamente')
    } else {
      // Si el usuario ya existe pero no es admin, actualizar su rol
      if (existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: 'victorsm2893@gmail.com' },
          data: { role: 'ADMIN' }
        })
        console.log('Usuario existente actualizado a rol ADMIN')
      } else {
        console.log('El usuario ya existe con rol ADMIN')
      }
    }
  } catch (error) {
    console.error('Error al crear/actualizar usuario:', error)
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
