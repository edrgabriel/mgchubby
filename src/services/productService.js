import peliculaImg from '../assets/products/pelicula.png';
import capaImg from '../assets/products/capa.png';
import carregadorImg from '../assets/products/carregador.png';
import bateriaImg from '../assets/products/bateria.png';
import telaImg from '../assets/products/tela.png';
import iphoneImg from '../assets/products/iphone.png';

export const getProducts = async () => {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    { id: 1, name: "Película de Vidro 3D", description: "Proteção máxima contra riscos e quedas.", category: "Acessórios", price: 25.0, image: peliculaImg, stock: 10 },
    { id: 2, name: "Capa Anti-Impacto Transparente", description: "Capa reforçada nas bordas, não amarela.", category: "Acessórios", price: 35.0, image: capaImg, stock: 15 },
    { id: 3, name: "Carregador Turbo 20W PD", description: "Carga rápida para dispositivos modernos.", category: "Acessórios", price: 60.0, image: carregadorImg, stock: 5 },
    { id: 4, name: "Bateria iPhone 11 (Premium)", description: "Bateria de reposição 100% saúde.", category: "Peças", price: 150.0, image: bateriaImg, stock: 4 },
    { id: 5, name: "Tela Display Frontal Moto G20", description: "Display LCD com touch screen.", category: "Peças", price: 210.0, image: telaImg, stock: 2 },
    { id: 6, name: "iPhone 11 128GB Semi-Novo", description: "Aparelho revisado, 90% bateria.", category: "Aparelhos", price: 1500.0, image: iphoneImg, stock: 1 }
  ];
};
