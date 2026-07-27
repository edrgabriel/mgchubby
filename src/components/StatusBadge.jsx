import React from 'react';
import { cn } from '../utils/cn';

export const STATUS_CONFIG = {
  recebido: { label: 'Recebido', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  em_analise: { label: 'Em Análise', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  aguardando_peca: { label: 'Aguardando Peça', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  em_conserto: { label: 'Em Conserto', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  pronto: { label: 'Pronto para Retirada', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  entregue: { label: 'Entregue', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500/15 text-red-400 border-red-500/30' }
};

export const PAYMENT_STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  pago: { label: 'Pago', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  parcelado: { label: 'Parcelado', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' }
};

export function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", config.color, className)}>
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status, className }) {
  const config = PAYMENT_STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", config.color, className)}>
      {config.label}
    </span>
  );
}
