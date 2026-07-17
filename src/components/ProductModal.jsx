import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';

export function ProductModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Acessórios',
    price: '',
    stock: '',
    image: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        price: initialData.price.toString(),
        stock: initialData.stock.toString()
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'Acessórios',
        price: '',
        stock: '',
        image: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-brand-gray w-full max-w-md rounded-2xl border border-white/10 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">
            {initialData ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button onClick={onClose} className="p-2 text-brand-light/60 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-light/80">Imagem do Produto</label>
              <div className="flex items-center gap-4">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                ) : (
                  <div className="w-16 h-16 bg-brand-dark rounded-lg border border-white/10 flex items-center justify-center text-brand-light/40">
                    <Upload size={24} />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="text-sm text-brand-light/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-blue/80 cursor-pointer"
                />
              </div>
            </div>

            <Input 
              label="Nome" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="Ex: Capinha iPhone 13" 
            />
            
            <Textarea 
              label="Descrição" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              placeholder="Descrição do produto..." 
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-light/80">Categoria</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="flex h-12 w-full rounded-lg border border-white/10 bg-brand-dark px-3 py-2 text-sm text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:border-transparent"
              >
                <option value="Acessórios">Acessórios</option>
                <option value="Peças">Peças</option>
                <option value="Aparelhos">Aparelhos</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Preço (R$)" 
                type="number" 
                step="0.01"
                min="0"
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                placeholder="0.00" 
              />
              <Input 
                label="Estoque" 
                type="number" 
                min="0"
                name="stock" 
                value={formData.stock} 
                onChange={handleChange} 
                required 
                placeholder="0" 
              />
            </div>
            
          </form>
        </div>
        
        <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-brand-dark/30">
          <Button variant="outline" type="button" onClick={onClose} className="border-white/10 text-white hover:bg-white/5">
            Cancelar
          </Button>
          <Button form="product-form" type="submit">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
