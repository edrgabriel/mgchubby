import { db } from './db';

const CURRENT_SCHEMA_VERSION = 1;

/**
 * Exporta todos os dados do banco Dexie para um arquivo JSON baixável.
 * Grava a data da última exportação no banco.
 */
export const exportBackup = async () => {
  try {
    const orders = await db.orders.toArray();
    const customers = await db.customers.toArray();
    const devices = await db.devices.toArray();
    const settings = await db.settings.toArray();

    const exportDate = new Date().toISOString();

    const backupPayload = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      appName: "MG SMART FIX",
      exportDate,
      data: {
        orders,
        customers,
        devices,
        settings
      }
    };

    // Atualiza a data do último backup nas configurações
    await db.settings.put({ key: 'lastBackupDate', value: exportDate });

    // Dispara o download do arquivo JSON
    const jsonString = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const formattedDate = exportDate.slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mgsmartfix_backup_${formattedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      success: true,
      exportDate
    };
  } catch (error) {
    console.error("Erro ao exportar backup:", error);
    throw new Error(`Falha ao exportar backup: ${error.message}`);
  }
};

/**
 * Realiza o backup de segurança automático (snapshot pré-importação)
 */
const triggerPreImportAutoBackup = async () => {
  try {
    const orders = await db.orders.toArray();
    const customers = await db.customers.toArray();
    const devices = await db.devices.toArray();
    const settings = await db.settings.toArray();

    if (orders.length === 0 && customers.length === 0) return; // Nada a salvar

    const exportDate = new Date().toISOString();
    const backupPayload = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      appName: "MG SMART FIX (AUTO-BACKUP)",
      exportDate,
      note: "Backup automático gerado antes de uma importação de dados",
      data: { orders, customers, devices, settings }
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `auto_backup_pre_import_${exportDate.replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn("Aviso: Não foi possível gerar o pré-backup automático:", err);
  }
};

/**
 * Importa um arquivo JSON de backup utilizando transação atômica do Dexie (All-or-Nothing).
 * Valida schemaVersion e dispara auto-backup de segurança antes da restauração.
 */
export const importBackup = async (jsonText) => {
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(jsonText);
  } catch {
    throw new Error("Arquivo de backup inválido. O conteúdo não é um JSON válido.");
  }

  // Validação de Schema
  if (!parsedPayload.schemaVersion || parsedPayload.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Versão do arquivo de backup incompatível (recebido: ${parsedPayload.schemaVersion || 'desconhecido'}, esperado: ${CURRENT_SCHEMA_VERSION}).`
    );
  }

  const { data } = parsedPayload;
  if (!data) {
    throw new Error("Estrutura do backup corrompida: bloco 'data' ausente.");
  }

  // 1. Snapshot automático pré-importação (Rede de segurança)
  await triggerPreImportAutoBackup();

  // 2. Transação Atômica no Dexie (All-or-Nothing)
  try {
    await db.transaction('rw', [db.orders, db.customers, db.devices, db.settings], async () => {
      // Limpa todas as tabelas
      await db.orders.clear();
      await db.customers.clear();
      await db.devices.clear();
      await db.settings.clear();

      // Repopula se houver registros
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        await db.orders.bulkAdd(data.orders);
      }
      if (Array.isArray(data.customers) && data.customers.length > 0) {
        await db.customers.bulkAdd(data.customers);
      }
      if (Array.isArray(data.devices) && data.devices.length > 0) {
        await db.devices.bulkAdd(data.devices);
      }
      if (Array.isArray(data.settings) && data.settings.length > 0) {
        await db.settings.bulkAdd(data.settings);
      }

      // Atualiza o registro do último backup
      await db.settings.put({ key: 'lastBackupDate', value: new Date().toISOString() });
    });

    return {
      success: true,
      message: "Backup restaurado com sucesso! Todos os dados foram atualizados."
    };
  } catch (error) {
    console.error("Erro na transação atômica de importação:", error);
    throw new Error(`Falha ao restaurar banco. Nenhuma alteração foi realizada: ${error.message}`);
  }
};

/**
 * Obtém a data e hora do último backup realizado
 */
export const getLastBackupDate = async () => {
  try {
    const setting = await db.settings.get('lastBackupDate');
    return setting ? setting.value : null;
  } catch {
    return null;
  }
};
