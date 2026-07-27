import React from 'react';
import { Smartphone, Wrench, ShoppingBag, ShoppingCart } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../utils/cn';

export function Header() {
  const { itemsCount } = useCart();
  
  return (
    <header className="sticky top-0 z-40 bg-brand-gray/90 backdrop-blur-md border-b border-white/5 print:hidden">
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-brand-blue">
          <Smartphone size={28} />
          <h1 className="text-xl font-bold text-white tracking-tight">MG<span className="text-brand-blue"> SMART FIX</span></h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          <NavLink to="/" className={({ isActive }) => cn("flex items-center gap-2 text-sm font-medium transition-colors", isActive ? "text-brand-blue" : "text-brand-light/70 hover:text-white")}>
            <Wrench size={18} /> Assistência
          </NavLink>
          <NavLink to="/store" className={({ isActive }) => cn("flex items-center gap-2 text-sm font-medium transition-colors", isActive ? "text-brand-blue" : "text-brand-light/70 hover:text-white")}>
            <ShoppingBag size={18} /> Loja
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => cn("flex items-center gap-2 text-sm font-medium transition-colors relative", isActive ? "text-brand-blue" : "text-brand-light/70 hover:text-white")}>
            <div className="relative">
              <ShoppingCart size={18} />
              {itemsCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[9px] font-bold text-white">
                  {itemsCount}
                </span>
              )}
            </div>
            Carrinho
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
