import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';
import { Button } from './ui/Button';

export function SignatureCanvas({ value, onChange, label = "Assinatura Digital do Cliente" }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setHasSignature(!!value);
  }, [value]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#1e293b'; // Escuro para contraste
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange("");
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-brand-light/90">{label}</label>
      
      {value ? (
        <div className="relative border border-white/10 rounded-lg p-3 bg-white/5 flex flex-col items-center justify-center">
          <img src={value} alt="Assinatura" className="max-h-24 object-contain bg-white rounded p-1" />
          <div className="flex gap-2 mt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
              <PenTool size={14} className="mr-1" /> Alterar Assinatura
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="text-red-400 hover:text-red-300">
              <Eraser size={14} className="mr-1" /> Remover
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className="w-full py-6 border-dashed border-white/20 hover:border-brand-blue flex items-center justify-center gap-2 text-brand-light/70"
        >
          <PenTool size={18} className="text-brand-blue" />
          Coletar Assinatura Digital do Cliente
        </Button>
      )}

      {/* Modal de Desenho */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-brand-gray border border-white/10 rounded-xl p-5 max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PenTool className="text-brand-blue" size={20} />
              Assinatura Digital
            </h3>
            <p className="text-xs text-brand-light/60">
              Desenhe a assinatura do cliente abaixo utilizando o touch screen ou mouse.
            </p>

            <div className="border-2 border-dashed border-brand-blue/40 rounded-lg bg-white overflow-hidden touch-none">
              <canvas
                ref={canvasRef}
                width={450}
                height={180}
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

            <div className="flex justify-between items-center pt-2">
              <Button type="button" variant="ghost" onClick={clearCanvas} className="text-red-400 hover:text-red-300">
                <Eraser size={16} className="mr-1" /> Limpar
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={saveSignature} disabled={!hasSignature}>
                  <Check size={16} className="mr-1" /> Confirmar Assinatura
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
