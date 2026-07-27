import Dexie from 'dexie';

export const db = new Dexie('MgSmartFixDB');

db.version(1).stores({
  orders: '++id, orderId, customerId, deviceId, customerName, whatsapp, brand, model, status, paymentStatus, createdAt, updatedAt',
  customers: '++id, name, whatsapp, cpf, createdAt',
  devices: '++id, customerId, brand, model, imei, serial',
  settings: 'key'
});
