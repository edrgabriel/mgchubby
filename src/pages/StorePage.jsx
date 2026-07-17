import React, { useEffect, useState } from 'react';
import { Shield, Plus } from 'lucide-react';
import { getProducts, addProduct, updateProduct } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Button } from '../components/ui/Button';

export function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const categories = ['Todos', 'Acessórios', 'Peças', 'Aparelhos'];

  const fetchProducts = () => {
    setLoading(true);
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Ocorreu um erro ao salvar. Tente novamente.");
    }
  };

  const filtered = filter === 'Todos' ? products : products.filter(p => p.category === filter);

  return (
    <div className="pb-24 sm:pb-8">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Catálogo de Produtos</h2>
          <Button 
            variant={isAdminMode ? "default" : "outline"} 
            size="sm"
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="gap-2"
          >
            <Shield size={16} />
            <span className="hidden sm:inline">{isAdminMode ? 'Sair do Modo Admin' : 'Modo Admin'}</span>
          </Button>
        </div>

        {isAdminMode && (
          <div className="flex justify-end">
            <Button onClick={handleOpenAddModal} className="gap-2">
              <Plus size={16} />
              Adicionar Produto
            </Button>
          </div>
        )}

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
            <ProductCard 
              key={product.id} 
              product={product} 
              isAdminMode={isAdminMode}
              onEdit={() => handleOpenEditModal(product)}
            />
          ))}
        </div>
      )}

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  );
}
