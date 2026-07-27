import React, { useState, useEffect } from 'react';
import { QrCode, Save, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { getShopSettings, saveShopSettings } from '../services/settingsService';

export function PixSettingsModal({ isOpen, onClose, onSaveSuccess }) {
  const [pixKey, setPixKey] = useState('');
  const [pixQrCode, setPixQrCode] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      getShopSettings().then(res => {
        setPixKey(res.pixKey || '');
        setPixQrCode(res.pixQrCode || '');
        setShopName(res.shopName || 'MG SMART FIX');
        setShopPhone(res.shopPhone || '');
      });
      setSuccessMsg('');
    }
  }, [isOpen]);

  const compressQrCodeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/png');
          resolve(base64);
        };
        img.onerror = err => reject(err);
      };
      reader.onerror = err => reject(err);
    });
  };

  const handleQrCodeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await compressQrCodeImage(file);
      setPixQrCode(base64);
    } catch (err) {
      console.error("Erro ao carregar imagem QR Code:", err);
      alert("Não foi possível carregar o QR Code. Tente outra imagem.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      await saveShopSettings({ pixKey, pixQrCode, shopName, shopPhone });
      setSuccessMsg('Configurações de Pix salvas com sucesso!');
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-brand-gray border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="text-brand-blue" size={24} />
            Configurar Pix da Loja
          </h3>
          <button onClick={onClose} className="text-brand-light/60 hover:text-white text-lg">✕</button>
        </div>

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Chave Pix (CPF, CNPJ, E-mail, Telefone ou Aleatória)"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="Ex: 12.345.678/0001-90 ou financeiro@mgsmartfix.com"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-brand-light/90">QR Code Pix (Imagem)</label>
            
            {pixQrCode ? (
              <div className="relative border border-white/10 rounded-lg p-3 bg-white/5 flex flex-col items-center justify-center">
                <img src={pixQrCode} alt="QR Code Pix" className="w-40 h-40 object-contain bg-white rounded p-2" />
                <div className="flex gap-2 mt-3">
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asSpan>
                      <ImageIcon size={14} className="mr-1" /> Alterar Imagem
                    </Button>
                    <input type="file" accept="image/*" onChange={handleQrCodeUpload} className="hidden" />
                  </label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPixQrCode('')} className="text-red-400 hover:text-red-300">
                    <Trash2 size={14} className="mr-1" /> Remover
                  </Button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-white/15 hover:border-brand-blue rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/5 hover:bg-white/10">
                <QrCode size={32} className="text-brand-blue mb-2" />
                <span className="text-xs font-medium text-brand-light/80 text-center">Clique para enviar a foto do QR Code Pix</span>
                <span className="text-[11px] text-brand-light/50 text-center mt-0.5">Formatos suportados: PNG, JPG</span>
                <input type="file" accept="image/*" onChange={handleQrCodeUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save size={16} className="mr-1.5" />
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
