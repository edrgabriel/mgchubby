import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { AssistancePage } from './pages/AssistancePage';
import { DashboardPage } from './pages/DashboardPage';
import { StorePage } from './pages/StorePage';
import { CartPage } from './pages/CartPage';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-brand-dark flex flex-col font-sans text-brand-light print:bg-white print:text-black">
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 print:p-0 print:m-0">
            <Routes>
              <Route path="/" element={<AssistancePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
