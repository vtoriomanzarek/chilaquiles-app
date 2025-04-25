import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-vh-100">
      <div className="container py-5">
        <div className="text-center">
          <h1 className="display-4 fw-bold mb-4">
            <span className="d-block">Los mejores</span>
            <span className="d-block text-success">Chilaquiles de la Ciudad</span>
          </h1>
          <p className="lead mb-5 mx-auto" style={{ maxWidth: '800px' }}>
            Descubre el auténtico sabor de México con nuestros chilaquiles artesanales.
            Elige entre diferentes tipos de totopos, salsas y complementos.
          </p>
          <Link
            href="/order"
            className="btn btn-success btn-lg px-4 py-2"
          >
            Ordenar Ahora
          </Link>
        </div>
      </div>
    </main>
  )
}
