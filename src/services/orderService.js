export const saveOrder = async (orderData) => {
  console.log("Ordem salva localmente:", orderData);
  
  // Simulando requisição
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    message: "Ordem de serviço gerada com sucesso!",
    orderId: `OS-${Math.floor(Math.random() * 10000)}`
  };
};
