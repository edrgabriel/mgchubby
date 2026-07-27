import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * Calcula os dias de garantia restantes a partir da data inicial e quantidade de dias.
 */
export function calculateWarrantyInfo(startDateStr, days = 90) {
  if (!startDateStr) return { status: 'sem_garantia', remainingDays: 0, endDateFormatted: '' };

  const startDate = new Date(startDateStr);
  if (isNaN(startDate.getTime())) return { status: 'sem_garantia', remainingDays: 0, endDateFormatted: '' };

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number(days));

  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const endDateFormatted = endDate.toLocaleDateString('pt-BR');

  if (remainingDays > 7) {
    return { status: 'ativa', remainingDays, endDateFormatted };
  } else if (remainingDays >= 0) {
    return { status: 'expirando', remainingDays, endDateFormatted };
  } else {
    return { status: 'expirada', remainingDays, endDateFormatted };
  }
}

export function WarrantyBadge({ startDate, days = 90, className }) {
  const info = calculateWarrantyInfo(startDate, days);

  if (info.status === 'ativa') {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", className)}>
        <ShieldCheck size={14} />
        Garantia Ativa (até {info.endDateFormatted})
      </span>
    );
  }

  if (info.status === 'expirando') {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30", className)}>
        <ShieldAlert size={14} />
        Garantia expira em {info.remainingDays} dia(s) ({info.endDateFormatted})
      </span>
    );
  }

  if (info.status === 'expirada') {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30", className)}>
        <ShieldX size={14} />
        Garantia Expirada ({info.endDateFormatted})
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-brand-light/50 border border-white/10", className)}>
      Sem Garantia
    </span>
  );
}
