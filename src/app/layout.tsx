import './globals.css'
import { Inter } from 'next/font/google'
import 'bootstrap-icons/font/bootstrap-icons.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Chilaquiles App',
  description: 'La mejor manera de ordenar tus chilaquiles favoritos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
