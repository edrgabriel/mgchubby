import React, { useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';

export function PhotoUploader({ photos = [], onChange, label = "Fotos e Evidências do Aparelho" }) {
  const [photoType, setPhotoType] = useState('entrada'); // 'entrada' | 'saida'

  /**
   * Redimensiona e comprime uma imagem para Base64 compacto (max 800px)
   */
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Comprime para JPEG com qualidade 0.75 (leve e nítido)
          const base64 = canvas.toDataURL('image/jpeg', 0.75);
          resolve(base64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const newPhotos = [];
      for (const file of files) {
        const compressedBase64 = await compressImage(file);
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          url: compressedBase64,
          type: photoType,
          createdAt: new Date().toISOString()
        });
      }

      onChange([...photos, ...newPhotos]);
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
      alert("Não foi possível carregar a imagem. Tente outro arquivo.");
    }
  };

  const removePhoto = (photoId) => {
    onChange(photos.filter(p => p.id !== photoId));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-sm font-medium text-brand-light/90">{label}</label>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-light/60">Etiqueta:</span>
          <select
            value={photoType}
            onChange={(e) => setPhotoType(e.target.value)}
            className="bg-brand-gray border border-white/10 text-xs rounded px-2 py-1 text-white focus:outline-none focus:border-brand-blue"
          >
            <option value="entrada">Entrada (Avarias/Riscos)</option>
            <option value="saida">Saída (Concluído)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group border border-white/10 rounded-lg overflow-hidden bg-brand-gray/50 aspect-video">
            <img src={photo.url} alt="Evidência" className="w-full h-full object-cover" />
            
            <div className="absolute top-1 left-1">
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                photo.type === 'entrada' ? 'bg-amber-500/80 text-black' : 'bg-emerald-500/80 text-black'
              }`}>
                {photo.type === 'entrada' ? 'Entrada' : 'Saída'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => removePhoto(photo.id)}
              className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded opacity-90 group-hover:opacity-100 transition-opacity"
              title="Remover foto"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        <label className="border-2 border-dashed border-white/15 hover:border-brand-blue rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors aspect-video bg-white/5 hover:bg-white/10">
          <Camera size={22} className="text-brand-blue mb-1" />
          <span className="text-xs font-medium text-brand-light/80 text-center">Adicionar Foto</span>
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
