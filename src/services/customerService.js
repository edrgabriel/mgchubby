import { db } from './db';

/**
 * Retorna a lista de todos os clientes cadastrados.
 */
export const getCustomers = async () => {
  return await db.customers.orderBy('name').toArray();
};

/**
 * Salva ou atualiza os dados de um cliente.
 */
export const saveCustomer = async (customerData) => {
  const now = new Date().toISOString();
  if (customerData.id) {
    await db.customers.update(customerData.id, {
      ...customerData,
      updatedAt: now
    });
    return customerData.id;
  } else {
    const id = await db.customers.add({
      name: customerData.name || '',
      whatsapp: customerData.whatsapp || '',
      cpf: customerData.cpf || '',
      notes: customerData.notes || '',
      createdAt: now,
      updatedAt: now
    });
    return id;
  }
};

/**
 * Busca um cliente por WhatsApp ou Nome (autocomplete/vínculo)
 */
export const findCustomerByPhoneOrName = async (query) => {
  if (!query || query.trim().length < 2) return [];
  const term = query.toLowerCase().trim();
  const all = await db.customers.toArray();
  return all.filter(c => 
    c.name.toLowerCase().includes(term) || 
    (c.whatsapp && c.whatsapp.includes(term))
  );
};

/**
 * Retorna os aparelhos/equipamentos cadastrados para um determinado cliente.
 */
export const getDevicesByCustomerId = async (customerId) => {
  if (!customerId) return [];
  return await db.devices.where('customerId').equals(customerId).toArray();
};

/**
 * Cadastra ou atualiza um aparelho de um cliente.
 */
export const saveDevice = async (deviceData) => {
  const now = new Date().toISOString();
  if (deviceData.id) {
    await db.devices.update(deviceData.id, {
      ...deviceData,
      updatedAt: now
    });
    return deviceData.id;
  } else {
    // Verifica se já existe o mesmo IMEI para o cliente
    if (deviceData.imei) {
      const existing = await db.devices
        .where({ customerId: deviceData.customerId, imei: deviceData.imei })
        .first();
      if (existing) return existing.id;
    }

    const id = await db.devices.add({
      customerId: deviceData.customerId,
      brand: deviceData.brand || '',
      model: deviceData.model || '',
      imei: deviceData.imei || '',
      color: deviceData.color || '',
      createdAt: now,
      updatedAt: now
    });
    return id;
  }
};

/**
 * Obtém o perfil completo do cliente com LTV (Total gasto) e histórico de ordens
 */
export const getCustomerProfile = async (customerId) => {
  const customer = await db.customers.get(customerId);
  if (!customer) return null;

  const devices = await db.devices.where('customerId').equals(customerId).toArray();
  const orders = await db.orders.where('customerId').equals(customerId).toArray();

  // Cálculo de LTV (Lifetime Value) - Soma de serviços pagos/concluídos
  const totalSpent = orders.reduce((sum, order) => {
    const total = (Number(order.partsCost) || 0) + (Number(order.laborCost) || 0) - (Number(order.discount) || 0);
    return sum + total;
  }, 0);

  return {
    ...customer,
    devices,
    orders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    totalOrders: orders.length,
    totalSpent
  };
};
