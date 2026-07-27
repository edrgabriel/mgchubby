export const getOrders = () => {
  const orders = localStorage.getItem('mgsmartfix_orders') || localStorage.getItem('mgchubby_orders');
  return orders ? JSON.parse(orders) : [];
};

export const saveOrder = async (orderData) => {
  // Simulando requisição
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const existingOrders = getOrders();
  let updatedOrders;
  let savedOrderId;
  
  if (orderData.orderId) {
    // Atualiza OS existente
    updatedOrders = existingOrders.map(order => 
      order.orderId === orderData.orderId ? { ...order, ...orderData, updatedAt: new Date().toISOString() } : order
    );
    savedOrderId = orderData.orderId;
  } else {
    // Nova OS
    const newOrder = {
      ...orderData,
      orderId: `OS-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString()
    };
    updatedOrders = [newOrder, ...existingOrders];
    savedOrderId = newOrder.orderId;
  }

  localStorage.setItem('mgsmartfix_orders', JSON.stringify(updatedOrders));
  
  return {
    success: true,
    message: orderData.orderId ? "Ordem de serviço atualizada com sucesso!" : "Ordem de serviço gerada com sucesso!",
    orderId: savedOrderId
  };
};
