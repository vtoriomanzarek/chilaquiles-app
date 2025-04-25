import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    // Consultar la base de datos para obtener los productos
    const products = await prisma.product.findMany({
      where: category ? {
        category: category as any,
        available: true,
      } : {
        available: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    )
  }
}
