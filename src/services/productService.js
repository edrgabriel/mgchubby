import peliculaImg from '../assets/products/pelicula.png';
import capaImg from '../assets/products/capa.png';
import carregadorImg from '../assets/products/carregador.png';
import bateriaImg from '../assets/products/bateria.png';
import telaImg from '../assets/products/tela.png';
import iphoneImg from '../assets/products/iphone.png';

const STORAGE_KEY = '@MgSmartFix:products';
const OLD_STORAGE_KEY = '@MgChubby:products';

const defaultProducts = [
  { id: 1, name: "Película de Vidro 3D", description: "Proteção máxima contra riscos e quedas.", category: "Acessórios", price: 25.0, image: peliculaImg, stock: 10 },
  { id: 2, name: "Capa Anti-Impacto Transparente", description: "Capa reforçada nas bordas, não amarela.", category: "Acessórios", price: 35.0, image: capaImg, stock: 15 },
  { id: 3, name: "Carregador Turbo 20W PD", description: "Carga rápida para dispositivos modernos.", category: "Acessórios", price: 60.0, image: carregadorImg, stock: 5 },
  { id: 4, name: "Bateria iPhone 11 (Premium)", description: "Bateria de reposição 100% saúde.", category: "Peças", price: 150.0, image: bateriaImg, stock: 4 },
  { id: 5, name: "Tela Display Frontal Moto G20", description: "Display LCD com touch screen.", category: "Peças", price: 210.0, image: telaImg, stock: 2 },
  { id: 6, name: "iPhone 11 128GB Semi-Novo", description: "Aparelho revisado, 90% bateria.", category: "Aparelhos", price: 1500.0, image: iphoneImg, stock: 1 }
];

const initializeProducts = () => {
  const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  return JSON.parse(stored);
};

export const getProducts = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return initializeProducts();
};

export const addProduct = async (productData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const products = initializeProducts();
  const newProduct = {
    ...productData,
    id: Date.now() // Gera um ID único
  };
  products.push(newProduct);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return newProduct;
};

export const updateProduct = async (id, productData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const products = initializeProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...productData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products[index];
  }
  throw new Error("Produto não encontrado");
};

export const deleteProduct = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let products = initializeProducts();
  products = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};
