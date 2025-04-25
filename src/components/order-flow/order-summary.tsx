import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrderConfirmation } from './order-confirmation';

interface OrderSummaryProps {
  products: {
    tortillaChips?: Product;
    sauce?: Product;
    protein?: Product;
    extras?: Product[];
    drink?: Product;
  };
  total: number;
  onBack: () => void;
}

export function OrderSummary({ products, total, onBack }: OrderSummaryProps) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('efectivo');
  const [tableNumber, setTableNumber] = useState<string>('0'); // 0 significa para llevar
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Lista de mesas disponibles
  const availableTables = [
    { number: '1', status: 'occupied' },
    { number: '2', status: 'available' },
    { number: '3', status: 'occupied' },
    { number: '4', status: 'available' },
    { number: '5', status: 'occupied' },
    { number: '6', status: 'available' },
  ];
  
  useEffect(() => {
    // Generar un número de orden aleatorio
    const randomNum = Math.floor(100 + Math.random() * 900); // Número de 3 dígitos (100-999)
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // Formato: MMDD-XXX (donde XXX es un número aleatorio de 3 dígitos)
    const orderNum = `${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}-${randomNum}`;
    setOrderNumber(orderNum);
  }, []);
  
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };
  
  const handleTableChange = (table: string) => {
    setTableNumber(table);
  };
  
  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Enviar los datos del pedido al API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products,
          total,
          orderNumber,
          paymentMethod,
          tableNumber
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Error al guardar el pedido:', result.error);
      } else {
        console.log('Pedido guardado exitosamente:', result);
      }
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
    }
    
    // Simular procesamiento de pago
    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmed(true);
      // Desplazar al inicio de la página
      window.scrollTo(0, 0);
    }, 1500);
  };
  if (isConfirmed) {
    return <OrderConfirmation orderNumber={orderNumber} tableNumber={tableNumber} />;
  }
  
  return (
    <div className="py-5 fade-in">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-success mb-3">
            Resumen de tu pedido
          </h2>
          <p className="lead text-muted mb-2">
            Revisa tu orden antes de confirmar
          </p>
          <div className="badge bg-success p-2 fs-6">
            <i className="bi bi-receipt me-1"></i>
            Número de Orden: <strong>{orderNumber}</strong>
          </div>
        </div>

        <div className="card mb-4" style={{ backgroundColor: '#fffbf0' }}>
          <div className="card-body">
            <h5 className="card-title mb-4">Productos seleccionados</h5>
            
            {Object.entries(products).map(([category, product]) => {
              if (!product) return null;
              
              if (category === 'extras' && Array.isArray(product) && product.length > 0) {
                return (
                  <div key={category} className="mb-3 pb-3 border-bottom">
                    <h6 className="mb-2">Complementos:</h6>
                    {product.map(item => (
                      <div key={item.id} className="d-flex align-items-center mb-2 ps-3">
                        <div className="position-relative" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                          <Image
                            src="/images/placeholder.svg"
                            alt={item.name}
                            fill
                            className="rounded"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="ms-3 flex-grow-1">
                          <h6 className="mb-0 small">{item.name}</h6>
                        </div>
                        <div className="ms-auto text-end">
                          <span className="small">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              
              // Si no es un array, podemos asegurar que es un producto individual
              // TypeScript necesita esta verificación para estar seguro
              if (!Array.isArray(product) && product) {
                return (
                  <div key={category} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <div className="position-relative" style={{ width: '60px', height: '60px', minWidth: '60px' }}>
                      <Image
                        src="/images/placeholder.svg"
                        alt={product.name}
                        fill
                        className="rounded"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="ms-3 flex-grow-1">
                      <h6 className="mb-0">{product.name}</h6>
                      <p className="text-muted small mb-0">{product.description}</p>
                    </div>
                    <div className="ms-auto text-end">
                      <span className="fw-bold text-success">${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                );
              }
              
              // Si llegamos aquí, es porque product es undefined o null
              return null;
            })}
            
            <div className="d-flex justify-content-between mt-4 pt-3 border-top">
              <h5>Total</h5>
              <h5 className="text-success">${total.toFixed(2)}</h5>
            </div>
          </div>
        </div>

        <div className="card mb-4" style={{ backgroundColor: '#fffbf0' }}>
          <div className="card-body">
            <h5 className="card-title mb-3">Información de entrega</h5>
            <p className="card-text text-muted">
              Tu orden estará lista en aproximadamente 15 minutos.
            </p>
            <div className="alert alert-success p-3 mb-0">
              <h6 className="mb-2"><i className="bi bi-info-circle me-2"></i>Cómo funciona:</h6>
              <p className="card-text mb-2">
                Al confirmar tu pedido, recibirás un <strong>número de orden</strong> que aparecerá en pantalla.
              </p>
              <p className="card-text mb-0">
                Por favor, tóma asiento en el restaurante y el mesero entregará tu pedido directamente a tu mesa cuando esté listo.
              </p>
            </div>
          </div>
        </div>

        <div className="card mb-4" style={{ backgroundColor: '#fffbf0' }}>
          {/* Selector de mesa */}
          <div className="card-body">
            <h5 className="card-title mb-3">Selecciona una mesa</h5>
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="tableOption"
                  id="takeout"
                  value="0"
                  checked={tableNumber === '0'}
                  onChange={() => handleTableChange('0')}
                />
                <label className="form-check-label" htmlFor="takeout">
                  <i className="bi bi-bag me-2 text-secondary"></i>
                  Para llevar
                </label>
              </div>
              
              <div className="mt-3">
                <label className="form-label">O selecciona una mesa:</label>
                <div className="row row-cols-3 g-2 mt-1">
                  {availableTables.map(table => (
                    <div className="col" key={table.number}>
                      <div 
                        className={`card text-center p-2 ${table.status === 'available' ? 'border-success' : 'border-danger'} ${tableNumber === table.number ? 'bg-light' : ''}`}
                        style={{ cursor: table.status === 'available' ? 'pointer' : 'not-allowed', opacity: table.status === 'available' ? 1 : 0.6 }}
                        onClick={() => table.status === 'available' && handleTableChange(table.number)}
                      >
                        <div className="d-flex justify-content-center align-items-center">
                          <i className={`bi ${table.status === 'available' ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-2`}></i>
                          <span>Mesa {table.number}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4" style={{ backgroundColor: '#fffbf0' }}>
          <div className="card-body">
            <h5 className="card-title mb-3">Método de pago</h5>
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="efectivo"
                  value="efectivo"
                  checked={paymentMethod === 'efectivo'}
                  onChange={() => handlePaymentMethodChange('efectivo')}
                />
                <label className="form-check-label" htmlFor="efectivo">
                  <i className="bi bi-cash-coin me-2 text-success"></i>
                  Efectivo (pago en restaurante)
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="tarjeta"
                  value="tarjeta"
                  checked={paymentMethod === 'tarjeta'}
                  onChange={() => handlePaymentMethodChange('tarjeta')}
                />
                <label className="form-check-label" htmlFor="tarjeta">
                  <i className="bi bi-credit-card me-2 text-primary"></i>
                  Tarjeta de crédito/débito
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="transferencia"
                  value="transferencia"
                  checked={paymentMethod === 'transferencia'}
                  onChange={() => handlePaymentMethodChange('transferencia')}
                />
                <label className="form-check-label" htmlFor="transferencia">
                  <i className="bi bi-bank me-2 text-info"></i>
                  Transferencia bancaria
                </label>
              </div>
            </div>
            
            {paymentMethod === 'tarjeta' && (
              <div className="border rounded p-3 bg-white">
                <div className="mb-3">
                  <label htmlFor="cardNumber" className="form-label">Número de tarjeta</label>
                  <input type="text" className="form-control" id="cardNumber" placeholder="XXXX XXXX XXXX XXXX" />
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label htmlFor="expiryDate" className="form-label">Fecha de expiración</label>
                    <input type="text" className="form-control" id="expiryDate" placeholder="MM/AA" />
                  </div>
                  <div className="col-6">
                    <label htmlFor="cvv" className="form-label">CVV</label>
                    <input type="text" className="form-control" id="cvv" placeholder="123" />
                  </div>
                </div>
                <div className="mb-0">
                  <label htmlFor="cardName" className="form-label">Nombre en la tarjeta</label>
                  <input type="text" className="form-control" id="cardName" placeholder="Como aparece en la tarjeta" />
                </div>
              </div>
            )}
            
            {paymentMethod === 'transferencia' && (
              <div className="alert alert-info">
                <p className="mb-2"><strong>Datos para transferencia:</strong></p>
                <p className="mb-1">Banco: Banco Nacional de México</p>
                <p className="mb-1">Cuenta: 1234 5678 9012 3456</p>
                <p className="mb-1">CLABE: 0001 2345 6789 0123 4567</p>
                <p className="mb-0">Referencia: {orderNumber}</p>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-between">
          <button 
            className="btn btn-outline-secondary" 
            onClick={onBack}
            disabled={isProcessing}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Modificar pedido
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleConfirmOrder}
            disabled={isProcessing || (paymentMethod === 'tarjeta' && true)} // Deshabilitado para tarjeta hasta que se implementen validaciones
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              </>
            ) : (
              <>
                Confirmar pedido
                <i className="bi bi-check2-circle ms-1"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
