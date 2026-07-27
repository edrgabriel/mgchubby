import React from 'react';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/Button';

export function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    let text = "*NOVO PEDIDO - MG SMART FIX*\n\n";
    cart.forEach(item => {
      text += `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    text += `\n*Total: R$ ${cartTotal.toFixed(2)}*`;
    
    const encoded = encodeURIComponent(text);
    // WhatsApp da loja
    window.open(`https://wa.me/557599177513?text=${encoded}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart size={48} className="text-brand-light/20 mb-4" />
        <h2 className="text-xl font-medium text-brand-light">Seu carrinho está vazio</h2>
        <p className="text-brand-light/60 mt-2 text-sm">Adicione produtos da loja para fazer um pedido.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 sm:pb-8 flex flex-col min-h-[calc(100vh-100px)]">
      <h2 className="text-2xl font-bold text-white mb-6">Meu Carrinho</h2>
      
      <div className="flex-1 flex flex-col gap-4">
        {cart.map(item => (
          <div key={item.id} className="flex items-center gap-4 bg-brand-gray p-3 rounded-xl border border-white/5">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
            
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white line-clamp-1">{item.name}</h3>
              <p className="text-xs text-brand-blue font-bold mt-1">R$ {item.price.toFixed(2)}</p>
              
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-brand-dark rounded-md text-brand-light hover:text-white">-</button>
                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-brand-dark rounded-md text-brand-light hover:text-white">+</button>
              </div>
            </div>
            
            <button 
              onClick={() => removeFromCart(item.id)}
              className="p-2 text-brand-light/40 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-brand-gray p-4 rounded-xl border border-white/5">
        <div className="flex justify-between items-center mb-4 text-lg">
          <span className="text-brand-light font-medium">Total do Pedido:</span>
          <span className="font-bold text-brand-blue">R$ {cartTotal.toFixed(2)}</span>
        </div>
        
        <Button className="w-full text-base font-semibold" onClick={handleCheckout}>
          Finalizar Pedido via WhatsApp
        </Button>
      </div>
    </div>
  );
}
