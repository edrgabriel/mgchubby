import React, { useState, useEffect } from 'react';
import { getShopSettings } from '../services/settingsService';
import { formatDateBR } from '../utils/dateUtils';

export const ServiceReceipt = React.forwardRef(({ orderData, orderId }, ref) => {
  const [shopSettings, setShopSettings] = useState({ pixKey: '', pixQrCode: '' });

  useEffect(() => {
    getShopSettings().then(res => setShopSettings(res));
  }, []);

  if (!orderData) return null;

  const parts = Number(orderData.partsCost) || 0;
  const labor = Number(orderData.laborCost) || 0;
  const discount = Number(orderData.discount) || 0;
  const total = parts + labor - discount;

  const currentOrderId = orderId || orderData.orderId || 'OS-0000';

  return (
    <div ref={ref} className="hidden print:block print-area font-sans text-black bg-white p-8">
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">MG SMART FIX</h1>
          <p className="text-sm text-gray-700 mt-0.5">Assistência Técnica Especializada</p>
          {orderData.whatsapp && (
            <p className="text-xs text-gray-600">WhatsApp: {orderData.whatsapp}</p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-black uppercase tracking-wider">Ordem de Serviço</h2>
          <p className="font-mono text-2xl font-black mt-1 text-black">{currentOrderId}</p>
          <p className="text-xs text-gray-600">Emissão: {formatDateBR(new Date().toISOString())}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-gray-300 rounded p-3">
          <h3 className="font-bold text-sm mb-2 border-b border-gray-300 pb-1 text-black uppercase tracking-wider">Dados do Cliente</h3>
          <p className="text-sm text-black"><strong>Nome:</strong> {orderData.customerName || 'Não informado'}</p>
          <p className="text-sm text-black"><strong>WhatsApp:</strong> {orderData.whatsapp || 'Não informado'}</p>
        </div>

        <div className="border border-gray-300 rounded p-3">
          <h3 className="font-bold text-sm mb-2 border-b border-gray-300 pb-1 text-black uppercase tracking-wider">Aparelho & Prazos</h3>
          <p className="text-sm text-black"><strong>Marca / Modelo:</strong> {orderData.brand} {orderData.model}</p>
          <p className="text-sm text-black"><strong>IMEI / Senha:</strong> {orderData.imeiPassword || 'Não informado'}</p>
          <p className="text-sm text-black"><strong>Data Entrada:</strong> {orderData.entryDate ? formatDateBR(orderData.entryDate) : formatDateBR(new Date().toISOString())}</p>
          <p className="text-sm text-black"><strong>Prazo de Entrega:</strong> {orderData.deliveryDate ? formatDateBR(orderData.deliveryDate) : 'A combinar'}</p>
        </div>
      </div>

      <div className="mb-6 border border-gray-300 rounded p-3">
        <h3 className="font-bold text-sm mb-1 text-black uppercase tracking-wider">Defeito Declarado / Relato do Cliente</h3>
        <p className="whitespace-pre-wrap text-sm text-black min-h-[45px]">{orderData.problem || 'Nenhum relato registrado.'}</p>
      </div>

      {orderData.checklist && (
        <div className="mb-6 border border-gray-300 rounded p-3">
          <h3 className="font-bold text-sm mb-2 border-b border-gray-300 pb-1 text-black uppercase tracking-wider">Checklist de Entrada</h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(orderData.checklist).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-black">
                <div className={`w-3.5 h-3.5 border border-black flex items-center justify-center ${value ? 'bg-black text-white' : 'bg-white'}`}>
                  {value && <span className="text-[10px] font-bold">✓</span>}
                </div>
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-6 gap-6">
        <div className="w-1/2 border border-gray-300 rounded p-3 text-xs space-y-1">
          <h3 className="font-bold text-sm mb-1 text-black uppercase tracking-wider">Termo de Garantia</h3>
          <p className="text-gray-800 leading-tight">
            Garantia legal de <strong className="text-black">{orderData.warrantyDays || 90} dias</strong> para os serviços realizados e peças substituídas a partir da data de entrega.
          </p>
          <p className="text-gray-600 text-[11px] leading-tight">
            * A garantia não cobre danos por quedas, contato com líquidos ou intervenção de terceiros.
          </p>

          {/* Dados de Pagamento Pix no Recibo */}
          {(shopSettings.pixKey || shopSettings.pixQrCode) && (
            <div className="mt-3 pt-2 border-t border-gray-300 flex items-center gap-3">
              {shopSettings.pixQrCode && (
                <img src={shopSettings.pixQrCode} alt="QR Code Pix" className="w-16 h-16 object-contain border border-black p-0.5 rounded" />
              )}
              <div>
                <p className="font-bold text-xs text-black uppercase">Pagamento via Pix</p>
                {shopSettings.pixKey && (
                  <p className="text-[11px] text-gray-800 font-mono select-all">Chave: <strong>{shopSettings.pixKey}</strong></p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-1/2 border border-gray-300 rounded p-3">
          <h3 className="font-bold text-sm mb-2 border-b border-gray-300 pb-1 text-black uppercase tracking-wider">Resumo Financeiro</h3>
          <div className="flex justify-between text-xs mb-1 text-black">
            <span>Valor Peças / Material:</span>
            <span>R$ {parts.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1 text-black">
            <span>Mão de Obra:</span>
            <span>R$ {labor.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs mb-1 text-red-600 font-medium">
              <span>Desconto:</span>
              <span>- R$ {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between mt-2 pt-2 border-t border-black font-bold text-base text-black">
            <span>TOTAL:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <div className="mt-2 text-right text-xs">
            <span className="font-semibold text-black">Pagamento: </span>
            <span className="uppercase text-gray-800">{orderData.paymentStatus || 'Pendente'} ({orderData.paymentMethod || 'Pix'})</span>
          </div>

          {/* Detalhamento do Parcelamento */}
          {orderData.paymentStatus === 'parcelado' && Number(orderData.installments) > 1 && (() => {
            const numInstallments = Number(orderData.installments);
            const installmentValue = total / numInstallments;
            return (
              <div className="mt-3 pt-2 border-t border-gray-300">
                <p className="font-bold text-xs text-black uppercase mb-1">Parcelamento: {numInstallments}x de R$ {installmentValue.toFixed(2)}</p>
                <table className="w-full text-[11px] text-black">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-0.5 font-semibold">Parcela</th>
                      <th className="text-center py-0.5 font-semibold">Vencimento</th>
                      <th className="text-right py-0.5 font-semibold">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: numInstallments }, (_, i) => {
                      let dueDate = '—';
                      if (orderData.installmentFirstDue) {
                        const base = new Date(orderData.installmentFirstDue + 'T12:00:00');
                        base.setMonth(base.getMonth() + i);
                        dueDate = formatDateBR(base.toISOString());
                      }
                      return (
                        <tr key={i} className="border-b border-gray-200 last:border-0">
                          <td className="py-0.5">{i + 1}/{numInstallments}</td>
                          <td className="py-0.5 text-center">{dueDate}</td>
                          <td className="py-0.5 text-right font-medium">R$ {installmentValue.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Assinatura do Cliente */}
      <div className="mt-12 text-center text-xs text-black flex flex-col items-center justify-center">
        {orderData.customerSignatureEntry ? (
          <div className="mb-2">
            <img src={orderData.customerSignatureEntry} alt="Assinatura Cliente" className="h-16 object-contain mx-auto" />
            <div className="w-64 border-t border-black mx-auto mt-1"></div>
          </div>
        ) : (
          <div className="w-64 border-t border-black mx-auto mb-2 pt-8"></div>
        )}
        <p className="font-bold uppercase tracking-wider text-sm">{orderData.customerName || 'Cliente'}</p>
        <p className="text-gray-500 text-[10px] mt-1">Assinatura Digital / Declaração de ciência dos termos de serviço</p>
      </div>
    </div>
  );
});

ServiceReceipt.displayName = "ServiceReceipt";
