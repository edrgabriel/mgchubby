import React, { useState, useRef, useEffect } from 'react';
import { Printer, Save, CheckCircle2, History, Plus, Search, MessageSquare, Calendar, ShieldCheck, PenTool, Camera, User, Smartphone, QrCode, Link } from 'lucide-react';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ServiceReceipt } from '../components/ServiceReceipt';
import { StatusBadge, PaymentStatusBadge } from '../components/StatusBadge';
import { WarrantyBadge } from '../components/WarrantyBadge';
import { SignatureCanvas } from '../components/SignatureCanvas';
import { PhotoUploader } from '../components/PhotoUploader';
import { PixSettingsModal } from '../components/PixSettingsModal';
import { saveOrder, getOrders, updateOrderStatus } from '../services/orderService';
import { getShopSettings } from '../services/settingsService';
import { findCustomerByPhoneOrName, getCustomerProfile } from '../services/customerService';
import { formatDateBR } from '../utils/dateUtils';
import { cn } from '../utils/cn';

export function AssistancePage() {
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

  // Estados para busca & filtros no histórico
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Autocomplete de Cliente
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState(null);

  const initialFormState = {
    customerName: '',
    whatsapp: '',
    brand: '',
    model: '',
    imeiPassword: '',
    problem: '',
    partsCost: 0,
    laborCost: 0,
    discount: 0,
    status: 'recebido',
    paymentStatus: 'pendente',
    paymentMethod: 'pix',
    warrantyDays: 90,
    warrantyStartDate: new Date().toISOString().split('T')[0],
    entryDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    photos: [],
    customerSignatureEntry: '',
    customerSignatureExit: ''
  };

  const initialChecklistState = {
    touchscreen: false,
    bateria: false,
    conectorCarga: false,
    microfoneAudio: false,
    cameras: false,
    wifiRede: false
  };

  const [formData, setFormData] = useState(initialFormState);
  const [checklist, setChecklist] = useState(initialChecklistState);

  const receiptRef = useRef();

  const loadHistory = async () => {
    const orders = await getOrders();
    setOrdersHistory(orders);
  };

  useEffect(() => {
    loadHistory();
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Autocomplete ao digitar nome ou whatsapp
    if (name === 'customerName' || name === 'whatsapp') {
      if (value.trim().length >= 2) {
        findCustomerByPhoneOrName(value).then(res => setCustomerSuggestions(res));
      } else {
        setCustomerSuggestions([]);
      }
    }
  };

  const handleSelectCustomer = async (cust) => {
    setFormData(prev => ({
      ...prev,
      customerId: cust.id,
      customerName: cust.name,
      whatsapp: cust.whatsapp
    }));
    setCustomerSuggestions([]);

    // Busca histórico completo e aparelhos do cliente
    const profile = await getCustomerProfile(cust.id);
    setSelectedCustomerProfile(profile);

    // Se o cliente tiver aparelhos cadastrados, pré-preenche com o mais recente
    if (profile && profile.devices && profile.devices.length > 0) {
      const dev = profile.devices[0];
      setFormData(prev => ({
        ...prev,
        deviceId: dev.id,
        brand: dev.brand,
        model: dev.model,
        imeiPassword: dev.imei || ''
      }));
    }
  };

  const toggleChecklist = (item) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleOpenOrder = (order) => {
    setFormData({
      id: order.id,
      orderId: order.orderId,
      customerId: order.customerId,
      deviceId: order.deviceId,
      customerName: order.customerName || '',
      whatsapp: order.whatsapp || '',
      brand: order.brand || '',
      model: order.model || '',
      imeiPassword: order.imeiPassword || '',
      problem: order.problem || '',
      partsCost: order.partsCost || 0,
      laborCost: order.laborCost || 0,
      discount: order.discount || 0,
      status: order.status || 'recebido',
      paymentStatus: order.paymentStatus || 'pendente',
      paymentMethod: order.paymentMethod || 'pix',
      warrantyDays: order.warrantyDays || 90,
      warrantyStartDate: order.warrantyStartDate || order.entryDate || '',
      entryDate: order.entryDate || '',
      deliveryDate: order.deliveryDate || '',
      photos: order.photos || [],
      customerSignatureEntry: order.customerSignatureEntry || '',
      customerSignatureExit: order.customerSignatureExit || ''
    });
    setChecklist(order.checklist || initialChecklistState);
    setCurrentOrderId(order.orderId);
    setSuccessMsg("");
    setActiveTab('new');

    if (order.customerId) {
      getCustomerProfile(order.customerId).then(res => setSelectedCustomerProfile(res));
    }
  };

  const handleNewOrder = () => {
    setFormData(initialFormState);
    setChecklist(initialChecklistState);
    setCurrentOrderId("");
    setSuccessMsg("");
    setSelectedCustomerProfile(null);
    setActiveTab('new');
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
      await loadHistory();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendWhatsApp = (order) => {
    if (!order.whatsapp) {
      alert("WhatsApp não informado para este cliente.");
      return;
    }
    const cleanPhone = order.whatsapp.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    let statusText = "recebido em nossa assistência";
    if (order.status === 'em_analise') statusText = "está em análise técnica";
    if (order.status === 'aguardando_peca') statusText = "está aguardando chegada de peças";
    if (order.status === 'em_conserto') statusText = "está em processo de bancada/conserto";
    if (order.status === 'pronto') statusText = "está PRONTO para retirada!";
    if (order.status === 'entregue') statusText = "foi entregue com sucesso.";

    const message = encodeURIComponent(
      `Olá ${order.customerName}! 📱\nReferente à Ordem de Serviço *${order.orderId}* (${order.brand} ${order.model}):\nSeu aparelho ${statusText}.\n\nAtenciosamente,\n*MG SMART FIX*`
    );

    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  /**
   * Gera um link de assinatura remota para enviar ao cliente via WhatsApp.
   * Os dados essenciais da OS são codificados em base64 na URL.
   * O cliente abre no celular, assina, e envia a imagem de volta pelo WhatsApp.
   */
  const handleSendSignatureLink = async (order) => {
    if (!order.whatsapp) {
      alert("WhatsApp não informado para este cliente.");
      return;
    }

    const shopSettings = await getShopSettings();

    // Dados mínimos da OS codificados para o link remoto
    const osData = {
      orderId: order.orderId,
      customerName: order.customerName,
      brand: order.brand,
      model: order.model,
      problem: (order.problem || '').substring(0, 200),
      entryDate: order.entryDate,
      partsCost: order.partsCost,
      laborCost: order.laborCost,
      discount: order.discount,
      warrantyDays: order.warrantyDays || 90,
      shopPhone: shopSettings.shopPhone || ''
    };

    const encoded = btoa(JSON.stringify(osData));
    const baseUrl = window.location.origin;
    const signatureLink = `${baseUrl}/assinar?d=${encoded}`;

    const cleanPhone = order.whatsapp.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const message = encodeURIComponent(
      `Olá ${order.customerName}! 📝\n\nSegue o link para assinar digitalmente a Ordem de Serviço *${order.orderId}* (${order.brand} ${order.model}):\n\n${signatureLink}\n\n✅ Clique no link, revise os dados do serviço e assine com o dedo na tela.\n\nAtenciosamente,\n*MG SMART FIX*`
    );

    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  // Filtra histórico
  const filteredOrders = ordersHistory.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const term = searchQuery.toLowerCase().trim();
    if (!term) return matchesStatus;

    const matchesQuery = 
      (order.customerName && order.customerName.toLowerCase().includes(term)) ||
      (order.whatsapp && order.whatsapp.includes(term)) ||
      (order.orderId && order.orderId.toLowerCase().includes(term)) ||
      (order.brand && order.brand.toLowerCase().includes(term)) ||
      (order.model && order.model.toLowerCase().includes(term)) ||
      (order.imeiPassword && order.imeiPassword.toLowerCase().includes(term));

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="pb-24 sm:pb-8 relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {activeTab === 'new' ? (currentOrderId ? `Editar OS: ${currentOrderId}` : 'Nova Ordem de Serviço') : 'Histórico de Atendimentos'}
          </h2>
          <p className="text-sm text-brand-light/60">Gestão operacional de reparos e garantias</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsPixModalOpen(true)}>
            <QrCode size={16} className="mr-1 text-brand-blue" /> Configurar Pix
          </Button>

          <div className="flex bg-brand-gray rounded-lg p-1 border border-white/5">
            <button
              onClick={handleNewOrder}
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
              <History size={16} /> Histórico ({ordersHistory.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'new' ? (
        <>
          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-brand-blue/20 border border-brand-blue/50 text-brand-light flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-brand-blue flex-shrink-0" size={24} />
                <div>
                  <p className="font-medium text-white">{successMsg}</p>
                  <p className="text-xs opacity-80">Código da OS: <strong>{currentOrderId}</strong></p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={handlePrint}>
                  <Printer size={16} className="mr-1" /> Imprimir Recibo
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bloco 1: Cliente & Histórico Recorrente */}
            <div className="bg-brand-gray border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="text-brand-blue" size={20} /> 1. Cadastro do Cliente
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                <div className="relative">
                  <Input
                    label="Nome do Cliente *"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Digite o nome..."
                    required
                  />

                  {/* Autocomplete de Clientes */}
                  {customerSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-brand-dark border border-white/15 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                      <div className="px-3 py-1 text-[11px] font-semibold text-brand-light/50 uppercase bg-white/5">
                        Clientes Encontrados (Clique para Vincular):
                      </div>
                      {customerSuggestions.map(cust => (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => handleSelectCustomer(cust)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-brand-blue/20 flex justify-between items-center transition-colors border-b border-white/5 last:border-0"
                        >
                          <div>
                            <p className="font-medium">{cust.name}</p>
                            <p className="text-xs text-brand-light/60">{cust.whatsapp || 'Sem telefone'}</p>
                          </div>
                          <span className="text-xs text-brand-blue font-semibold">Vincular →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Input
                  label="WhatsApp / Telefone *"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              {/* Indicador de Cliente Recorrente */}
              {selectedCustomerProfile && (
                <div className="p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-brand-blue" />
                    Cliente Recorrente Identificado! (Total gasto acumulado: R$ {selectedCustomerProfile.totalSpent.toFixed(2)})
                  </p>
                  <p className="text-brand-light/80">
                    Histórico: {selectedCustomerProfile.totalOrders} atendimento(s) anterior(es).
                  </p>
                </div>
              )}
            </div>

            {/* Bloco 2: Aparelho & Garantia */}
            <div className="bg-brand-gray border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="text-brand-blue" size={20} /> 2. Objeto / Aparelho & Garantia
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Marca *"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Ex: Apple, Samsung, Motorola"
                  required
                />
                <Input
                  label="Modelo *"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="Ex: iPhone 11, Moto G8"
                  required
                />
                <Input
                  label="IMEI / Número de Série / Senha"
                  name="imeiPassword"
                  value={formData.imeiPassword}
                  onChange={handleInputChange}
                  placeholder="IMEI ou Senha de desbloqueio"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-brand-light/90 mb-1">Prazo de Garantia</label>
                  <select
                    name="warrantyDays"
                    value={formData.warrantyDays}
                    onChange={handleInputChange}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-blue text-sm"
                  >
                    <option value={0}>Sem Garantia</option>
                    <option value={30}>30 Dias</option>
                    <option value={60}>60 Dias</option>
                    <option value={90}>90 Dias (Padrão Legal)</option>
                    <option value={180}>180 Dias (6 Meses)</option>
                  </select>
                </div>

                <Input
                  label="Data de Entrada"
                  type="date"
                  name="entryDate"
                  value={formData.entryDate}
                  onChange={handleInputChange}
                />
                <Input
                  label="Previsão de Entrega"
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                />
              </div>

              <Textarea
                label="Defeito Relatado / Observações *"
                name="problem"
                value={formData.problem}
                onChange={handleInputChange}
                placeholder="Descreva o problema do aparelho com detalhes..."
                required
                rows={3}
              />
            </div>

            {/* Bloco 3: Checklist & Evidências em Foto */}
            <div className="bg-brand-gray border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="text-brand-blue" size={20} /> 3. Checklist & Evidências em Foto
              </h3>

              <div>
                <label className="block text-sm font-medium text-brand-light/90 mb-2">Checklist de Entrada</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'touchscreen', label: 'Touch / Tela' },
                    { id: 'bateria', label: 'Bateria / Carga' },
                    { id: 'conectorCarga', label: 'Conector Conector' },
                    { id: 'microfoneAudio', label: 'Áudio / Microfone' },
                    { id: 'cameras', label: 'Câmeras F/T' },
                    { id: 'wifiRede', label: 'Wi-Fi / Sinal Chip' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleChecklist(item.id)}
                      className={cn(
                        "p-3 rounded-lg border text-xs font-semibold text-left flex items-center justify-between transition-colors",
                        checklist[item.id]
                          ? "bg-brand-blue/20 border-brand-blue text-white"
                          : "bg-white/5 border-white/10 text-brand-light/60 hover:text-white"
                      )}
                    >
                      <span>{item.label}</span>
                      <span>{checklist[item.id] ? '✓ Ok' : '✗ Ruim'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <PhotoUploader
                photos={formData.photos}
                onChange={(newPhotos) => setFormData(prev => ({ ...prev, photos: newPhotos }))}
              />
            </div>

            {/* Bloco 4: Financeiro & Status */}
            <div className="bg-brand-gray border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-brand-blue" size={20} /> 4. Valores & Status Operacional
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPixModalOpen(true)}
                  className="text-xs text-brand-blue hover:underline flex items-center gap-1"
                >
                  <QrCode size={14} /> Configurar Pix da Loja
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Valor Peça / Material (R$)"
                  type="number"
                  step="0.01"
                  name="partsCost"
                  value={formData.partsCost}
                  onChange={handleInputChange}
                />
                <Input
                  label="Mão de Obra (R$)"
                  type="number"
                  step="0.01"
                  name="laborCost"
                  value={formData.laborCost}
                  onChange={handleInputChange}
                />
                <Input
                  label="Desconto (R$)"
                  type="number"
                  step="0.01"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-brand-light/90 mb-1">Status da OS</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-blue text-sm font-semibold"
                  >
                    <option value="recebido">🔵 Recebido</option>
                    <option value="em_analise">🟡 Em Análise</option>
                    <option value="aguardando_peca">🟠 Aguardando Peça</option>
                    <option value="em_conserto">🟣 Em Conserto</option>
                    <option value="pronto">🟢 Pronto para Retirada</option>
                    <option value="entregue">⚪ Entregue</option>
                    <option value="cancelado">🔴 Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-light/90 mb-1">Status do Pagamento</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-blue text-sm font-semibold"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="parcelado">Parcelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-light/90 mb-1">Forma de Pagamento</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-blue text-sm"
                  >
                    <option value="pix">Pix</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center">
                <span className="text-sm font-bold text-white uppercase tracking-wider">TOTAL DO SERVIÇO:</span>
                <span className="text-2xl font-black text-emerald-400">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Bloco 5: Assinatura Digital */}
            <div className="bg-brand-gray border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PenTool className="text-brand-blue" size={20} /> 5. Assinatura Digital do Cliente
              </h3>

              <SignatureCanvas
                value={formData.customerSignatureEntry}
                onChange={(sig) => setFormData(prev => ({ ...prev, customerSignatureEntry: sig }))}
                label="Assinatura de Entrada (Ciência dos Termos)"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleNewOrder}>
                Limpar / Nova
              </Button>
              <Button type="submit" disabled={loading} size="lg" className="min-w-[180px]">
                <Save size={18} className="mr-2" />
                {loading ? "Gravando OS..." : (formData.orderId ? "Atualizar OS" : "Gerar Ordem de Serviço")}
              </Button>
            </div>
          </form>

          {/* Área oculta de Impressão */}
          <ServiceReceipt ref={receiptRef} orderData={{ ...formData, checklist }} orderId={currentOrderId} />
        </>
      ) : (
        /* Aba de Histórico com Busca & Filtros */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3 bg-brand-gray border border-white/10 rounded-xl p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-brand-light/40" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por Cliente, Telefone, IMEI, Marca, Modelo ou OS..."
                className="w-full bg-brand-dark border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-light/60">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue font-medium"
              >
                <option value="all">Todos os Status</option>
                <option value="recebido">Recebido</option>
                <option value="em_analise">Em Análise</option>
                <option value="aguardando_peca">Aguardando Peça</option>
                <option value="em_conserto">Em Conserto</option>
                <option value="pronto">Pronto</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-brand-gray border border-white/10 rounded-xl p-12 text-center text-brand-light/60">
              <History size={36} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium">Nenhuma ordem de serviço encontrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => {
                const totalOS = (Number(order.partsCost) || 0) + (Number(order.laborCost) || 0) - (Number(order.discount) || 0);

                return (
                  <div key={order.id || order.orderId} className="bg-brand-gray border border-white/10 hover:border-white/20 rounded-xl p-5 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white text-base">{order.orderId}</span>
                        <StatusBadge status={order.status} />
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-brand-light/60">
                        <Calendar size={14} />
                        <span>Entrada: {order.entryDate ? formatDateBR(order.entryDate) : '—'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-brand-light/50 font-medium uppercase">Cliente</p>
                        <p className="font-bold text-white">{order.customerName}</p>
                        <p className="text-xs text-brand-light/70">{order.whatsapp}</p>
                      </div>

                      <div>
                        <p className="text-xs text-brand-light/50 font-medium uppercase">Aparelho</p>
                        <p className="font-medium text-white">{order.brand} {order.model}</p>
                        <p className="text-xs text-brand-light/70">{order.imeiPassword || 'Sem IMEI/Senha'}</p>
                      </div>

                      <div>
                        <p className="text-xs text-brand-light/50 font-medium uppercase">Total & Garantia</p>
                        <p className="font-bold text-emerald-400">R$ {totalOS.toFixed(2)}</p>
                        <WarrantyBadge startDate={order.warrantyStartDate || order.entryDate} days={order.warrantyDays} className="mt-1" />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-light/60">Mudar Status Rápido:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleQuickStatusChange(order.orderId, e.target.value)}
                          className="bg-brand-dark border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        >
                          <option value="recebido">Recebido</option>
                          <option value="em_analise">Em Análise</option>
                          <option value="aguardando_peca">Aguardando Peça</option>
                          <option value="em_conserto">Em Conserto</option>
                          <option value="pronto">Pronto</option>
                          <option value="entregue">Entregue</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleSendWhatsApp(order)} className="text-emerald-400 hover:text-emerald-300">
                          <MessageSquare size={14} className="mr-1" /> WhatsApp
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleSendSignatureLink(order)} className="text-purple-400 hover:text-purple-300">
                          <PenTool size={14} className="mr-1" /> Assinar
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleOpenOrder(order)}>
                          Editar OS
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Configuração do Pix */}
      <PixSettingsModal
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
      />
    </div>
  );
}
