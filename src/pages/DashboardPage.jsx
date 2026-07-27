import React, { useState, useEffect } from 'react';
import { DollarSign, Wrench, TrendingUp, Database, Award, QrCode } from 'lucide-react';
import { getOrders } from '../services/orderService';
import { getCustomers } from '../services/customerService';
import { getLastBackupDate } from '../services/backupService';
import { BackupModal } from '../components/BackupModal';
import { PixSettingsModal } from '../components/PixSettingsModal';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/ui/Button';

export function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [lastBackup, setLastBackup] = useState(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [period, setPeriod] = useState('month'); // 'month' | 'all'

  const loadData = async () => {
    const fetchedOrders = await getOrders();
    const fetchedCustomers = await getCustomers();
    const backupDate = await getLastBackupDate();
    
    setOrders(fetchedOrders);
    setCustomers(fetchedCustomers);
    setLastBackup(backupDate);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtra por período
  const now = new Date();
  const currentMonthOrders = orders.filter(o => {
    if (period === 'all') return true;
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Métricas
  const totalOrdersCount = currentMonthOrders.length;
  
  const totalRevenue = currentMonthOrders.reduce((sum, o) => {
    const total = (Number(o.partsCost) || 0) + (Number(o.laborCost) || 0) - (Number(o.discount) || 0);
    return sum + total;
  }, 0);

  const totalPartsCost = currentMonthOrders.reduce((sum, o) => sum + (Number(o.partsCost) || 0), 0);
  const totalLaborCost = currentMonthOrders.reduce((sum, o) => sum + (Number(o.laborCost) || 0), 0);
  
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Breakdown por Status
  const statusCounts = currentMonthOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  // Clientes com LTV (Top Clientes)
  const customersWithStats = customers.map(c => {
    const clientOrders = orders.filter(o => o.customerId === c.id || o.customerName === c.name);
    const spent = clientOrders.reduce((sum, o) => {
      return sum + ((Number(o.partsCost) || 0) + (Number(o.laborCost) || 0) - (Number(o.discount) || 0));
    }, 0);
    return {
      ...c,
      totalSpent: spent,
      orderCount: clientOrders.length
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);

  const calculateDaysAgo = (dateStr) => {
    if (!dateStr) return null;
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    return `Há ${days} dia(s)`;
  };

  const lastBackupText = calculateDaysAgo(lastBackup);

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Header & Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard & Visão Geral</h2>
          <p className="text-sm text-brand-light/60">Indicadores financeiros e operacionais da assistência</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-brand-gray rounded-lg p-1 border border-white/5 text-xs">
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                period === 'month' ? 'bg-brand-blue text-white' : 'text-brand-light/60 hover:text-white'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                period === 'all' ? 'bg-brand-blue text-white' : 'text-brand-light/60 hover:text-white'
              }`}
            >
              Todo o Período
            </button>
          </div>

          <Button onClick={() => setIsPixModalOpen(true)} variant="outline" size="sm">
            <QrCode size={16} className="mr-1.5 text-brand-blue" /> Configurar Pix
          </Button>

          <Button onClick={() => setIsBackupModalOpen(true)} variant="outline" size="sm">
            <Database size={16} className="mr-1.5 text-brand-blue" /> Backup (.JSON)
          </Button>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-gray border border-white/10 rounded-xl p-5 space-y-2">
          <div className="flex justify-between items-center text-brand-light/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Total</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><DollarSign size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</p>
          <div className="flex justify-between text-xs text-brand-light/60 pt-1 border-t border-white/5">
            <span>Peças: R$ {totalPartsCost.toFixed(2)}</span>
            <span>Mão de Obra: R$ {totalLaborCost.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-brand-gray border border-white/10 rounded-xl p-5 space-y-2">
          <div className="flex justify-between items-center text-brand-light/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Serviços</span>
            <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg"><Wrench size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-white">{totalOrdersCount} OS</p>
          <p className="text-xs text-brand-light/60 pt-1 border-t border-white/5">
            {period === 'month' ? 'Realizados neste mês' : 'Todas as ordens cadastradas'}
          </p>
        </div>

        <div className="bg-brand-gray border border-white/10 rounded-xl p-5 space-y-2">
          <div className="flex justify-between items-center text-brand-light/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Ticket Médio</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><TrendingUp size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-white">R$ {averageTicket.toFixed(2)}</p>
          <p className="text-xs text-brand-light/60 pt-1 border-t border-white/5">Média por atendimento</p>
        </div>

        <div className="bg-brand-gray border border-white/10 rounded-xl p-5 space-y-2">
          <div className="flex justify-between items-center text-brand-light/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Segurança de Dados</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Database size={18} /></div>
          </div>
          <p className="text-sm font-bold text-white mt-1">
            {lastBackupText ? `Backup: ${lastBackupText}` : 'Nenhum backup realizado'}
          </p>
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="text-xs text-brand-blue hover:underline pt-1 border-t border-white/5 w-full text-left block"
          >
            Gerenciar cópia de segurança →
          </button>
        </div>
      </div>

      {/* Seção Central: Status Breakdown e Clientes Fiéis (LTV) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-brand-gray border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="text-brand-blue" size={20} /> Status das Ordens
          </h3>

          <div className="space-y-2">
            {[
              { id: 'recebido', label: 'Recebido' },
              { id: 'em_analise', label: 'Em Análise' },
              { id: 'aguardando_peca', label: 'Aguardando Peça' },
              { id: 'em_conserto', label: 'Em Conserto' },
              { id: 'pronto', label: 'Pronto para Retirada' },
              { id: 'entregue', label: 'Entregue' }
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                <StatusBadge status={item.id} />
                <span className="text-sm font-bold text-white">{statusCounts[item.id] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clientes / LTV */}
        <div className="lg:col-span-2 bg-brand-gray border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="text-amber-400" size={20} /> Clientes Principais (LTV)
            </h3>
            <span className="text-xs text-brand-light/60">Ordenados por total gasto</span>
          </div>

          {customersWithStats.length === 0 ? (
            <p className="text-sm text-brand-light/50 py-8 text-center">Nenhum cliente cadastrado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-brand-light/50 border-b border-white/10 pb-2">
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">WhatsApp</th>
                    <th className="pb-2 font-medium text-center">Serviços</th>
                    <th className="pb-2 font-medium text-right">Total Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customersWithStats.slice(0, 6).map(customer => (
                    <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-medium text-white">{customer.name}</td>
                      <td className="py-3 text-brand-light/70">{customer.whatsapp || '—'}</td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-brand-blue/20 text-brand-blue font-bold text-xs">
                          {customer.orderCount}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-400">
                        R$ {customer.totalSpent.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Configuração do Pix */}
      <PixSettingsModal
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
      />

      {/* Modal de Backup */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onImportSuccess={loadData}
      />
    </div>
  );
}
