import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface OrderConfirmationProps {
  orderNumber: string;
  tableNumber?: string; // Número de mesa, opcional porque puede ser para llevar
}

export function OrderConfirmation({ orderNumber, tableNumber }: OrderConfirmationProps) {
  useEffect(() => {
    // Lanzar confeti cuando se muestra la pantalla de confirmación
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };
    
    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(confettiInterval);
      }
      
      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { y: 0.6 },
        colors: ['#22c55e', '#f59e0b', '#ef4444'],
      });
    }, 250);
    
    return () => clearInterval(confettiInterval);
  }, []);

  return (
    <div className="py-5 fade-in">
      <div className="container text-center">
        <div className="mb-4">
          <div className="display-1 text-success mb-3">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h1 className="display-4 fw-bold text-success mb-3">
            ¡Gracias por tu pedido!
          </h1>
          <div className="badge bg-success p-2 fs-6 mb-4">
            <i className="bi bi-receipt me-1"></i>
            Número de Orden: <strong>{orderNumber}</strong>
          </div>
          
          {/* Mostrar información de la mesa */}
          <div className="badge bg-primary p-2 fs-6 mb-4 ms-2">
            <i className={`bi bi-${tableNumber === '0' ? 'bag' : 'table'} me-1`}></i>
            {tableNumber === '0' ? 'Para llevar' : `Mesa: ${tableNumber}`}
          </div>
          <p className="lead mb-4">
            Tu orden de chilaquiles está siendo preparada con los mejores ingredientes.
            <br />Por favor, toma asiento y disfruta de la experiencia.
          </p>
          
          <div className="card mx-auto mb-5" style={{ maxWidth: '500px', backgroundColor: '#fffbf0' }}>
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-clock me-2"></i>
                Tiempo estimado
              </h5>
              <div className="d-flex justify-content-center align-items-center">
                <div className="display-4 fw-bold text-success">
                  15
                </div>
                <div className="ms-2 text-muted">
                  minutos
                </div>
              </div>
              <p className="card-text mt-3">
                {tableNumber === '0' ? (
                  <>Te avisaremos cuando tu pedido para llevar esté listo.<br />Puedes esperar en nuestra área de clientes.</>
                ) : (
                  <>Un mesero traerá tu pedido a la mesa {tableNumber} cuando esté listo.<br />Mientras tanto, ¡disfruta de la compañía y el ambiente!</>
                )}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <Link href="/" className="btn btn-success btn-lg px-4">
              <i className="bi bi-house-door me-2"></i>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
