import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wrench, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../utils/cn';

export function BottomNav() {
  const { itemsCount } = useCart();
  
  const navItems = [
    { to: "/", icon: Wrench, label: "Assistência" },
    { to: "/store", icon: ShoppingBag, label: "Loja" },
    { to: "/cart", icon: ShoppingCart, label: "Carrinho", badge: itemsCount > 0 ? itemsCount : null },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-brand-gray/90 backdrop-blur-md border-t border-white/5 sm:hidden print-hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "relative flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors",
              isActive ? "text-brand-blue" : "text-brand-light/60 hover:text-brand-light"
            )}
          >
            <div className="relative">
              <item.icon size={24} />
              {item.badge && (
                <span className="absolute -top-1.5 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </div>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
