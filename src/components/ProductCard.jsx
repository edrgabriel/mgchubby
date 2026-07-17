import React from 'react';
import { Plus, Pencil, Package } from 'lucide-react';
import { Button } from './ui/Button';
import { useCart } from '../contexts/CartContext';

export function ProductCard({ product, isAdminMode, onEdit }) {
  const { addToCart } = useCart();
  
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-brand-gray border border-white/5 shadow-lg transition-transform hover:-translate-y-1 relative group">
      
      {isAdminMode && (
        <button 
          onClick={onEdit}
          className="absolute top-2 right-2 z-10 bg-brand-blue text-white p-2 rounded-full shadow-lg opacity-90 hover:opacity-100 transition-opacity"
        >
          <Pencil size={14} />
        </button>
      )}

      <div className="relative">
        <img src={product.image} alt={product.name} className="h-40 w-full object-cover" />
        {isAdminMode && (
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-md text-xs font-medium text-white flex items-center gap-1 backdrop-blur-sm">
            <Package size={12} />
            Estoque: {product.stock}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-white line-clamp-1 text-sm">{product.name}</h3>
        <p className="text-xs text-brand-light/60 mt-1 line-clamp-2 flex-1">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-brand-blue">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </span>
          <Button size="icon" onClick={() => addToCart(product)} className="h-8 w-8 rounded-full shadow-md">
            <Plus size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
