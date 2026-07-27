import { db } from './db';
import { saveCustomer, saveDevice } from './customerService';

/**
 * Migra dados antigos do localStorage para o Dexie (IndexedDB) de forma transparente
 */

export const migrateFromLocalStorage = async () => {
  try {
    const existingCount = await db.orders.count();
    if (existingCount > 0) return; // Já possui dados no Dexie

    const rawOrders = localStorage.getItem('mgsmartfix_orders') || localStorage.getItem('mgchubby_orders');
    if (!rawOrders) return;

    const parsedOrders = JSON.parse(rawOrders);
    if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
      await db.transaction('rw', [db.orders, db.customers, db.devices], async () => {
        for (const order of parsedOrders) {
          // Cria cliente se houver nome
          let customerId = null;
          if (order.customerName) {
            customerId = await saveCustomer({
              name: order.customerName,
              whatsapp: order.whatsapp || ''
            });
          }

          // Cria aparelho se houver marca/modelo
          let deviceId = null;
          if (customerId && (order.brand || order.model)) {
            deviceId = await saveDevice({
              customerId,
              brand: order.brand || '',
              model: order.model || '',
              imei: order.imeiPassword || ''
            });
          }

          await db.orders.add({
            ...order,
            customerId,
            deviceId,
            status: order.status || 'recebido',
            paymentStatus: order.paymentStatus || 'pendente',
            warrantyDays: order.warrantyDays || 90,
            photos: order.photos || [],
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || new Date().toISOString()
          });
        }
      });
      console.log(`Migradas ${parsedOrders.length} ordens de serviço do localStorage para o IndexedDB.`);
    }
  } catch (err) {
    console.error("Erro na migração transparente do localStorage:", err);
  }
};

/**
 * Retorna todas as ordens de serviço do banco Dexie
 */
export const getOrders = async () => {
  await migrateFromLocalStorage();
  const orders = await db.orders.toArray();
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Busca uma OS pelo orderId amigável (ex: OS-1234) ou ID interno
 */
export const getOrderById = async (orderId) => {
  if (!orderId) return null;
  const order = await db.orders.where('orderId').equals(orderId).first();
  if (order) return order;
  
  // Tenta por id interno numérico
  if (!isNaN(orderId)) {
    return await db.orders.get(Number(orderId));
  }
  return null;
};

/**
 * Salva ou atualiza uma Ordem de Serviço
 */
export const saveOrder = async (orderData) => {
  const now = new Date().toISOString();

  // 1. Vincula ou cria Cliente
  let customerId = orderData.customerId;
  if (!customerId && orderData.customerName) {
    customerId = await saveCustomer({
      name: orderData.customerName,
      whatsapp: orderData.whatsapp || ''
    });
  }

  // 2. Vincula ou cria Aparelho
  let deviceId = orderData.deviceId;
  if (customerId && (orderData.brand || orderData.model)) {
    deviceId = await saveDevice({
      customerId,
      brand: orderData.brand || '',
      model: orderData.model || '',
      imei: orderData.imeiPassword || ''
    });
  }

  let savedOrderId;

  if (orderData.orderId) {
    // Atualização de OS existente
    const existing = await db.orders.where('orderId').equals(orderData.orderId).first();
    if (existing) {
      await db.orders.update(existing.id, {
        ...orderData,
        customerId,
        deviceId,
        updatedAt: now
      });
      savedOrderId = orderData.orderId;
    } else if (orderData.id) {
      await db.orders.update(orderData.id, {
        ...orderData,
        customerId,
        deviceId,
        updatedAt: now
      });
      savedOrderId = orderData.orderId;
    }
  } else {
    // Nova OS - gera número sequencial amigável OS-XXXX
    const count = await db.orders.count();
    const nextNum = String(count + 1).padStart(4, '0');
    savedOrderId = `OS-${nextNum}`;

    await db.orders.add({
      ...orderData,
      orderId: savedOrderId,
      customerId,
      deviceId,
      status: orderData.status || 'recebido',
      paymentStatus: orderData.paymentStatus || 'pendente',
      paymentMethod: orderData.paymentMethod || 'pix',
      warrantyDays: Number(orderData.warrantyDays) || 90,
      warrantyStartDate: orderData.warrantyStartDate || orderData.entryDate || now.split('T')[0],
      photos: orderData.photos || [],
      customerSignatureEntry: orderData.customerSignatureEntry || null,
      customerSignatureExit: orderData.customerSignatureExit || null,
      createdAt: now,
      updatedAt: now
    });
  }

  return {
    success: true,
    message: orderData.orderId ? "Ordem de serviço atualizada com sucesso!" : "Ordem de serviço gerada com sucesso!",
    orderId: savedOrderId
  };
};

/**
 * Atualiza rapidamente apenas o status de uma OS
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Ordem de serviço não encontrada.");

  const updates = {
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  // Se mudar para entregue/pronto, define data de início da garantia se ainda não definida
  if ((newStatus === 'pronto' || newStatus === 'entregue') && !order.warrantyStartDate) {
    updates.warrantyStartDate = new Date().toISOString().split('T')[0];
  }

  await db.orders.update(order.id, updates);
  return { success: true, newStatus };
};
