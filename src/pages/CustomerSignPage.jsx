import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PenTool, CheckCircle2, ShieldCheck, Smartphone, User, FileText, Check, Download, MessageSquare } from 'lucide-react';
import { getOrderById, saveOrder } from '../services/orderService';
import { Button } from '../components/ui/Button';
import { formatDateBR } from '../utils/dateUtils';

/**
 * Página de assinatura digital do cliente.
 *
 * Funciona em 2 modos:
 * 1. LOCAL (mesmo dispositivo): acessa a OS pelo IndexedDB via orderId na URL.
 * 2. REMOTO (link enviado ao cliente via WhatsApp): os dados essenciais da OS
 *    são codificados na query string. O cliente assina no seu celular e
 *    baixa/envia a imagem da assinatura de volta pelo WhatsApp.
 */
export function CustomerSignPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [isRemoteMode, setIsRemoteMode] = useState(false);

  // Canvas
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const targetOrderId = orderId || searchParams.get('os');
    const remoteData = searchParams.get('d'); // dados codificados em base64 para modo remoto

    if (remoteData) {
      // MODO REMOTO: dados da OS chegam pela URL
      try {
        const decoded = JSON.parse(atob(remoteData));
        setOrder(decoded);
        setIsRemoteMode(true);
      } catch {
        setError("Link de assinatura inválido ou expirado.");
      }
      setLoading(false);
    } else if (targetOrderId) {
      // MODO LOCAL: busca no IndexedDB
      getOrderById(targetOrderId)
        .then(res => {
          if (res) {
            setOrder(res);
          } else {
            setError("Ordem de serviço não encontrada neste dispositivo.");
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setError("Código da Ordem de Serviço ausente.");
      setLoading(false);
    }
  }, [orderId, searchParams]);

  // --- Canvas handlers ---
  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // --- Confirmar Assinatura ---
  const handleConfirmSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const base64 = canvas.toDataURL('image/png');
    setSignatureDataUrl(base64);

    if (!isRemoteMode) {
      // Modo local: salva diretamente no IndexedDB
      try {
        setLoading(true);
        await saveOrder({ ...order, customerSignatureEntry: base64 });
        setSignedSuccess(true);
      } catch {
        alert("Erro ao salvar assinatura. Tente novamente.");
      } finally {
        setLoading(false);
      }
    } else {
      // Modo remoto: não temos acesso ao IndexedDB do dono — mostrar opções de envio
      setSignedSuccess(true);
    }
  };

  // --- Download da imagem da assinatura ---
  const handleDownloadSignature = () => {
    if (!signatureDataUrl) return;
    const a = document.createElement('a');
    a.href = signatureDataUrl;
    a.download = `assinatura_${order.orderId || 'os'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Enviar imagem via WhatsApp para o dono da loja ---
  const handleSendSignatureWhatsApp = () => {
    // Abre WhatsApp com mensagem pré-formatada (a imagem precisa ser anexada manualmente após download)
    const shopPhone = order.shopPhone || '';
    const cleanPhone = shopPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const message = encodeURIComponent(
      `Olá, segue minha assinatura digital referente à OS *${order.orderId}*.\nCliente: ${order.customerName}\nAparelho: ${order.brand} ${order.model}\n\n_Assinatura digital confirmada via MG SMART FIX._`
    );

    if (phoneWithCountry && phoneWithCountry.length > 4) {
      window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  // --- Rendering ---
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 text-white">
        <p className="animate-pulse text-brand-light">Carregando Ordem de Serviço...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <div className="bg-brand-gray border border-white/10 rounded-xl p-6 max-w-md w-full text-center space-y-3">
          <p className="text-red-400 font-bold text-lg">Atenção</p>
          <p className="text-brand-light/70 text-sm">{error || "Não foi possível carregar a OS."}</p>
        </div>
      </div>
    );
  }

  const parts = Number(order.partsCost) || 0;
  const labor = Number(order.laborCost) || 0;
  const discount = Number(order.discount) || 0;
  const total = parts + labor - discount;

  return (
    <div className="min-h-screen bg-brand-dark text-white p-4 sm:p-6 flex flex-col justify-center items-center">
      <div className="max-w-xl w-full bg-brand-gray border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl">

        {/* Header */}
        <div className="text-center border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">MG<span className="text-brand-blue"> SMART FIX</span></h1>
          <p className="text-xs text-brand-light/60 mt-0.5">
            {isRemoteMode ? 'Portal de Assinatura Digital Remota' : 'Portal de Assinatura Digital do Cliente'}
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-brand-blue/20 text-brand-blue font-mono font-bold rounded-full text-xs">
            OS: {order.orderId}
          </div>
        </div>

        {signedSuccess ? (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-xl font-bold text-white">Assinatura Confirmada!</h2>
            <p className="text-sm text-brand-light/70 max-w-sm mx-auto">
              Sua assinatura digital foi registrada com sucesso na Ordem de Serviço <strong className="text-white">{order.orderId}</strong>.
            </p>

            {isRemoteMode && signatureDataUrl && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <p className="text-xs text-brand-light/60">
                  Para finalizar, baixe a imagem da assinatura e envie no WhatsApp da loja:
                </p>

                {/* Preview da assinatura */}
                <div className="bg-white rounded-lg p-2 inline-block mx-auto">
                  <img src={signatureDataUrl} alt="Assinatura" className="h-20 object-contain" />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button type="button" onClick={handleDownloadSignature} variant="outline" size="sm">
                    <Download size={16} className="mr-1.5" /> Baixar Assinatura (PNG)
                  </Button>
                  <Button type="button" onClick={handleSendSignatureWhatsApp} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <MessageSquare size={16} className="mr-1.5" /> Enviar via WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {!isRemoteMode && (
              <p className="text-xs text-emerald-400 font-medium">
                Assinatura salva no sistema. A MG SMART FIX agradece!
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Resumo da OS */}
            <div className="space-y-3 bg-white/5 border border-white/5 rounded-xl p-4 text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-brand-light/60 flex items-center gap-1.5"><User size={14} /> Cliente:</span>
                <strong className="text-white text-sm">{order.customerName}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-brand-light/60 flex items-center gap-1.5"><Smartphone size={14} /> Aparelho:</span>
                <strong className="text-white">{order.brand} {order.model}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-brand-light/60 flex items-center gap-1.5"><FileText size={14} /> Data de Entrada:</span>
                <strong className="text-white">{formatDateBR(order.entryDate)}</strong>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-brand-light/60 block">Defeito Relatado:</span>
                <p className="text-white font-medium bg-brand-dark p-2 rounded border border-white/5 whitespace-pre-wrap">
                  {order.problem || 'Atendimento técnico de bancada.'}
                </p>
              </div>
              <div className="flex justify-between items-center pt-2 font-bold text-sm text-emerald-400 border-t border-white/10">
                <span>Valor Total:</span>
                <span className="text-base">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Termos */}
            <div className="p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-xl text-xs space-y-1 text-brand-light/80">
              <p className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-brand-blue" />
                Termos de Garantia ({order.warrantyDays || 90} Dias)
              </p>
              <p className="text-[11px] leading-relaxed">
                Ao assinar abaixo, declaro estar ciente dos serviços autorizados, valores e do prazo de garantia para peças e mão de obra.
              </p>
            </div>

            {/* Canvas de Assinatura */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white flex items-center gap-1.5">
                <PenTool size={14} className="text-brand-blue" />
                Assine com o dedo ou mouse na caixa abaixo:
              </label>
              <div className="border-2 border-dashed border-brand-blue/50 rounded-xl bg-white overflow-hidden touch-none">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={200}
                  className="w-full h-44 cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex justify-between items-center pt-1">
                <button type="button" onClick={clearCanvas} className="text-xs text-red-400 hover:text-red-300 underline">
                  Limpar Assinatura
                </button>
                <span className="text-[11px] text-brand-light/50">Desenhe acima</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleConfirmSignature}
              disabled={!hasSignature || loading}
              className="w-full py-3 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-sm rounded-xl disabled:opacity-50"
            >
              <Check size={18} className="mr-1.5" />
              {loading ? "Salvando..." : "Confirmar e Enviar Assinatura"}
            </Button>
          </>
        )}
      </div>

      <p className="text-center text-[10px] text-brand-light/30 mt-4">MG SMART FIX • Sistema de Assistência Técnica</p>
    </div>
  );
}
