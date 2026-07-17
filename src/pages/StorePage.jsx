import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import { ProductCard } from '../components/ProductCard';

export function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  
  const categories = ['Todos', 'Acessórios', 'Peças', 'Aparelhos'];

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'Todos' ? products : products.filter(p => p.category === filter);

  return (
    <div className="pb-24 sm:pb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Catálogo de Produtos</h2>
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === cat 
                  ? 'bg-brand-blue text-white' 
                  : 'bg-brand-gray text-brand-light/70 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
