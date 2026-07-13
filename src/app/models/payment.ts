// ==================== ENUMS ====================

export type PaymentStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'PARTIALLY_PAID' 
  | 'FAILED' 
  | 'REFUNDED' 
  | 'CANCELLED' 
  | 'DELETED';

export type PaymentMethod = 
  | 'CASH' 
  | 'CREDIT_CARD' 
  | 'DEBIT_CARD' 
  | 'BANK_TRANSFER' 
  | 'YAPE' 
  | 'PLIN' 
  | 'DIGITAL_WALLET' 
  | 'OTHER';

// ==================== DTOs ====================

/**
 * DTO para crear un pago
 */
export interface PaymentCreateDTO {
  companyId: number;
  bookingId: number;
  amount: number; // BigDecimal en backend, number en frontend
  method: PaymentMethod;
}

/**
 * DTO para respuesta del pago (GET)
 */
export interface PaymentDTO {
  id: number;
  companyId: number;
  bookingId: number;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: string; // LocalDateTime
}

/**
 * DTO para actualizar un pago (PATCH)
 */
export interface PaymentPatchDTO {
  amount?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Obtiene el color según el estado del pago
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colorMap: Record<PaymentStatus, string> = {
    'PENDING': 'bg-yellow-500/10 text-yellow-400',
    'PAID': 'bg-emerald-500/10 text-emerald-400',
    'PARTIALLY_PAID': 'bg-blue-500/10 text-blue-400',
    'FAILED': 'bg-red-500/10 text-red-400',
    'REFUNDED': 'bg-purple-500/10 text-purple-400',
    'CANCELLED': 'bg-gray-500/10 text-gray-400',
    'DELETED': 'bg-gray-500/10 text-gray-400'
  };
  return colorMap[status] || 'bg-gray-500/10 text-gray-400';
}

/**
 * Obtiene el label legible para el estado
 */
export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labelMap: Record<PaymentStatus, string> = {
    'PENDING': 'Pendiente',
    'PAID': 'Pagado',
    'PARTIALLY_PAID': 'Parcial',
    'FAILED': 'Fallido',
    'REFUNDED': 'Reembolsado',
    'CANCELLED': 'Cancelado',
    'DELETED': 'Eliminado'
  };
  return labelMap[status] || status;
}

/**
 * Obtiene el label legible para el método de pago
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labelMap: Record<PaymentMethod, string> = {
    'CASH': 'Efectivo',
    'CREDIT_CARD': 'Tarjeta Crédito',
    'DEBIT_CARD': 'Tarjeta Débito',
    'BANK_TRANSFER': 'Transferencia',
    'YAPE': 'Yape',
    'PLIN': 'Plin',
    'DIGITAL_WALLET': 'Billetera Digital',
    'OTHER': 'Otro'
  };
  return labelMap[method] || method;
}

/**
 * Obtiene un icono sugerido para el método de pago (nombres de iconos Lucide)
 */
export function getPaymentMethodIcon(method: PaymentMethod): string {
  const iconMap: Record<PaymentMethod, string> = {
    'CASH': 'Coins',
    'CREDIT_CARD': 'CreditCard',
    'DEBIT_CARD': 'CreditCard',
    'BANK_TRANSFER': 'Building2',
    'YAPE': 'Smartphone',
    'PLIN': 'Smartphone',
    'DIGITAL_WALLET': 'Wallet',
    'OTHER': 'MoreHorizontal'
  };
  return iconMap[method] || 'CircleDollarSign';
}

/**
 * Formatea el monto en soles
 */
export function formatPaymentAmount(amount: number): string {
  return `S/. ${amount.toFixed(2)}`;
}

/**
 * Verifica si un pago está completado (PAID)
 */
export function isPaymentCompleted(payment: PaymentDTO): boolean {
  return payment.status === 'PAID';
}

/**
 * Verifica si un pago está pendiente
 */
export function isPaymentPending(payment: PaymentDTO): boolean {
  return payment.status === 'PENDING' || payment.status === 'PARTIALLY_PAID';
}

/**
 * Verifica si un pago puede ser editado
 */
export function isPaymentEditable(payment: PaymentDTO): boolean {
  return !['PAID', 'REFUNDED', 'CANCELLED', 'DELETED'].includes(payment.status);
}

/**
 * Obtiene el monto total pagado de una lista de pagos
 */
export function getTotalPaid(payments: PaymentDTO[]): number {
  return payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);
}

/**
 * Obtiene el monto pendiente de una lista de pagos
 * (asumiendo que el total esperado es la suma de todos los pagos)
 */
export function getTotalPending(payments: PaymentDTO[]): number {
  return payments
    .filter(p => p.status === 'PENDING' || p.status === 'PARTIALLY_PAID')
    .reduce((sum, p) => sum + p.amount, 0);
}