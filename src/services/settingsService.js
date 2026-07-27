import { db } from './db';

/**
 * Obtém as configurações da loja (Chave Pix, QR Code Pix, etc.)
 */
export const getShopSettings = async () => {
  try {
    const allSettings = await db.settings.toArray();
    const settingsObj = {};
    allSettings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    return {
      pixKey: settingsObj.pixKey || '',
      pixQrCode: settingsObj.pixQrCode || '',
      shopName: settingsObj.shopName || 'MG SMART FIX',
      shopPhone: settingsObj.shopPhone || ''
    };
  } catch (err) {
    console.error("Erro ao carregar configurações da loja:", err);
    return { pixKey: '', pixQrCode: '', shopName: 'MG SMART FIX', shopPhone: '' };
  }
};

/**
 * Salva as configurações da loja no banco Dexie
 */
export const saveShopSettings = async (settingsData) => {
  try {
    if (settingsData.pixKey !== undefined) {
      await db.settings.put({ key: 'pixKey', value: settingsData.pixKey });
    }
    if (settingsData.pixQrCode !== undefined) {
      await db.settings.put({ key: 'pixQrCode', value: settingsData.pixQrCode });
    }
    if (settingsData.shopName !== undefined) {
      await db.settings.put({ key: 'shopName', value: settingsData.shopName });
    }
    if (settingsData.shopPhone !== undefined) {
      await db.settings.put({ key: 'shopPhone', value: settingsData.shopPhone });
    }
    return { success: true };
  } catch (err) {
    console.error("Erro ao salvar configurações:", err);
    throw err;
  }
};
