export const getOrders = () => {
  const orders = localStorage.getItem('mgchubby_orders');
  return orders ? JSON.parse(orders) : [];
};

export const saveOrder = async (orderData) => {
  // Simulando requisição
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newOrder = {
    ...orderData,
    orderId: `OS-${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString()
  };

  const existingOrders = getOrders();
  const updatedOrders = [newOrder, ...existingOrders];
  localStorage.setItem('mgchubby_orders', JSON.stringify(updatedOrders));
  
  return {
    success: true,
    message: "Ordem de serviço gerada com sucesso!",
    orderId: newOrder.orderId
  };
};
