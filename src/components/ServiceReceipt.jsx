import React from 'react';

export const ServiceReceipt = React.forwardRef(({ orderData, orderId }, ref) => {
  if (!orderData) return null;

  return (
    <div ref={ref} className="hidden print:block print-area font-sans text-black bg-white p-8">
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black">MG CHUBBY</h1>
          <p className="text-sm text-gray-600 mt-1">Assistência Técnica</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-black">Ordem de Serviço</h2>
          <p className="font-mono text-lg font-bold mt-1 text-black">{orderId}</p>
          <p className="text-sm text-gray-600">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1 text-black">Dados do Cliente</h3>
          <p className="text-black"><strong>Nome:</strong> {orderData.customerName}</p>
          <p className="text-black"><strong>WhatsApp:</strong> {orderData.whatsapp}</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1 text-black">Aparelho</h3>
          <p className="text-black"><strong>Marca/Modelo:</strong> {orderData.brand} / {orderData.model}</p>
          <p className="text-black"><strong>IMEI/Senha:</strong> {orderData.imeiPassword || 'Não informado'}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1 text-black">Relato do Problema</h3>
        <p className="whitespace-pre-wrap min-h-[60px] text-black border border-gray-200 p-2 rounded">{orderData.problem}</p>
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1 text-black">Checklist de Entrada</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          {Object.entries(orderData.checklist).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 text-black">
              <div className={`w-4 h-4 border border-black flex items-center justify-center ${value ? 'bg-black' : 'bg-white'}`}>
                {value && <span className="text-white text-xs">✓</span>}
              </div>
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 w-1/2 ml-auto">
        <h3 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1 text-black">Resumo Financeiro</h3>
        <div className="flex justify-between mb-1 text-black">
          <span>Peças:</span>
          <span>R$ {Number(orderData.partsCost).toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-1 text-black">
          <span>Mão de Obra:</span>
          <span>R$ {Number(orderData.laborCost).toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-1 text-black">
          <span>Desconto:</span>
          <span>- R$ {Number(orderData.discount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-300 font-bold text-lg text-black">
          <span>TOTAL:</span>
          <span>
            R$ {(Number(orderData.partsCost) + Number(orderData.laborCost) - Number(orderData.discount)).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-black">
        <div className="w-64 border-t border-black mx-auto mb-2"></div>
        <p className="font-bold">Assinatura do Cliente</p>
        <p className="mt-8 text-gray-500 text-xs">Garantia de 90 dias para serviços realizados. A MG CHUBBY não se responsabiliza por dados não salvos (faça backup).<br/>Impresso pelo sistema.</p>
      </div>
    </div>
  );
});
ServiceReceipt.displayName = "ServiceReceipt";
