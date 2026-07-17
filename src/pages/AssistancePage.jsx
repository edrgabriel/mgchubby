import React, { useState, useRef, useEffect } from 'react';
import { Printer, Save, CheckCircle2, History, Plus } from 'lucide-react';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ServiceReceipt } from '../components/ServiceReceipt';
import { saveOrder, getOrders } from '../services/orderService';
import { cn } from '../utils/cn';

export function AssistancePage() {
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [ordersHistory, setOrdersHistory] = useState([]);
  
  const [formData, setFormData] = useState({
    customerName: '',
    whatsapp: '',
    brand: '',
    model: '',
    imeiPassword: '',
    problem: '',
    partsCost: 0,
    laborCost: 0,
    discount: 0,
    entryDate: new Date().toISOString().split('T')[0],
    deliveryDate: ''
  });

  const [checklist, setChecklist] = useState({
    touchscreen: false,
    bateria: false,
    conectorCarga: false,
    microfoneAudio: false,
    cameras: false,
    wifiRede: false
  });

  const receiptRef = useRef();

  useEffect(() => {
    if (activeTab === 'history') {
      setOrdersHistory(getOrders());
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleChecklist = (item) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const total = Number(formData.partsCost) + Number(formData.laborCost) - Number(formData.discount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    
    try {
      const response = await saveOrder({ ...formData, checklist });
      setCurrentOrderId(response.orderId);
      setSuccessMsg(response.message);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pb-24 sm:pb-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">
          {activeTab === 'new' ? 'Nova Ordem de Serviço' : 'Histórico de OS'}
        </h2>
        <div className="flex bg-brand-gray rounded-lg p-1 border border-white/5">
          <button
            onClick={() => setActiveTab('new')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === 'new' ? "bg-brand-blue text-white" : "text-brand-light/60 hover:text-white"
            )}
          >
            <Plus size={16} /> Nova OS
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === 'history' ? "bg-brand-blue text-white" : "text-brand-light/60 hover:text-white"
            )}
          >
            <History size={16} /> Histórico
          </button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <>
          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-[#00B37E]/20 border border-[#00B37E]/50 text-brand-light flex items-center gap-3">
              <CheckCircle2 className="text-brand-blue flex-shrink-0" />
              <div>
                <p className="font-medium text-white">{successMsg}</p>
                <p className="text-sm opacity-80">OS: {currentOrderId}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datas */}
            <section className="bg-brand-gray p-5 rounded-xl border border-white/5">
              <h3 className="text-lg font-medium text-brand-blue mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/20 text-xs">1</span>
                Datas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Data de Entrada" name="entryDate" type="date" value={formData.entryDate} onChange={handleInputChange} required />
                <Input label="Data de Entrega Prevista" name="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleInputChange} />
              </div>
            </section>

            {/* Dados do Cliente */}
            <section className="bg-brand-gray p-5 rounded-xl border border-white/5">
              <h3 className="text-lg font-medium text-brand-blue mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/20 text-xs">2</span>
                Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome Completo" name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                <Input label="WhatsApp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} required placeholder="(11) 99999-9999" />
              </div>
            </section>

            {/* Dados do Aparelho */}
            <section className="bg-brand-gray p-5 rounded-xl border border-white/5">
              <h3 className="text-lg font-medium text-brand-blue mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/20 text-xs">3</span>
                Dados do Aparelho
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input label="Marca" name="brand" value={formData.brand} onChange={handleInputChange} required placeholder="Ex: Apple, Samsung" />
                <Input label="Modelo" name="model" value={formData.model} onChange={handleInputChange} required placeholder="Ex: iPhone 11, S21" />
                <Input label="IMEI ou Senha (Opcional)" name="imeiPassword" value={formData.imeiPassword} onChange={handleInputChange} className="md:col-span-2" />
              </div>
              <Textarea label="Relato do Problema" name="problem" value={formData.problem} onChange={handleInputChange} required placeholder="Descreva o problema relatado pelo cliente..." />
            </section>

            {/* Checklist */}
            <section className="bg-brand-gray p-5 rounded-xl border border-white/5">
              <h3 className="text-lg font-medium text-brand-blue mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/20 text-xs">4</span>
                Checklist de Entrada
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(checklist).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleChecklist(item)}
                    className={cn(
                      "px-3 py-3 rounded-lg text-sm font-medium transition-all border text-left flex justify-between items-center",
                      checklist[item] 
                        ? "bg-brand-blue/10 border-brand-blue text-brand-blue" 
                        : "bg-brand-dark border-white/5 text-brand-light/60 hover:text-white"
                    )}
                  >
                    <span>{item.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())}</span>
                    {checklist[item] && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </section>

            {/* Resumo e Valores */}
            <section className="bg-brand-gray p-5 rounded-xl border border-white/5">
              <h3 className="text-lg font-medium text-brand-blue mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/20 text-xs">5</span>
                Valores
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Input label="Peças (R$)" name="partsCost" type="number" min="0" step="0.01" value={formData.partsCost} onChange={handleInputChange} />
                <Input label="Mão de Obra (R$)" name="laborCost" type="number" min="0" step="0.01" value={formData.laborCost} onChange={handleInputChange} />
                <Input label="Desconto (R$)" name="discount" type="number" min="0" step="0.01" value={formData.discount} onChange={handleInputChange} />
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-lg bg-brand-dark border border-white/5">
                <span className="text-lg font-medium text-brand-light">Total Estimado</span>
                <span className="text-2xl font-bold text-brand-blue">
                  R$ {total > 0 ? total.toFixed(2) : "0.00"}
                </span>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 print-hidden">
              <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                {loading ? "Salvando..." : <><Save className="mr-2" size={20} /> Salvar Ordem de Serviço</>}
              </Button>
              
              <Button 
                type="button" 
                variant="secondary" 
                size="lg" 
                onClick={handlePrint}
                disabled={!currentOrderId}
                className="sm:w-auto w-full"
              >
                <Printer className="mr-2" size={20} /> Imprimir Recibo
              </Button>
            </div>
          </form>

          {/* Componente Invisível que será impresso */}
          <ServiceReceipt ref={receiptRef} orderData={{...formData, checklist}} orderId={currentOrderId || 'OS-RASCUNHO'} />
        </>
      ) : (
        <div className="space-y-4">
          {ordersHistory.length === 0 ? (
            <div className="bg-brand-gray p-8 rounded-xl border border-white/5 text-center">
              <p className="text-brand-light/60">Nenhuma ordem de serviço encontrada.</p>
            </div>
          ) : (
            ordersHistory.map(order => (
              <div key={order.orderId} className="bg-brand-gray p-5 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono font-bold text-brand-blue">{order.orderId}</span>
                    <span className="text-xs px-2 py-1 bg-white/5 rounded text-white/60">
                      Entrada: {new Date(order.entryDate).toLocaleDateString('pt-BR')}
                    </span>
                    {order.deliveryDate && (
                      <span className="text-xs px-2 py-1 bg-brand-blue/10 text-brand-blue rounded">
                        Entrega: {new Date(order.deliveryDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-lg">{order.customerName}</h4>
                  <p className="text-sm text-brand-light/70">{order.brand} {order.model}</p>
                </div>
                <div className="flex flex-col items-start md:items-end justify-center">
                  <span className="text-sm text-brand-light/60 mb-1">Total Estimado</span>
                  <span className="text-xl font-bold text-white">
                    R$ {(Number(order.partsCost) + Number(order.laborCost) - Number(order.discount)).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
