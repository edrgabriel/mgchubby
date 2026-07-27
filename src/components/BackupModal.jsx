import React, { useState, useEffect } from 'react';
import { Download, Upload, ShieldAlert, CheckCircle2, Database } from 'lucide-react';
import { Button } from './ui/Button';
import { exportBackup, importBackup, getLastBackupDate } from '../services/backupService';

export function BackupModal({ isOpen, onClose, onImportSuccess }) {
  const [lastBackup, setLastBackup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Estado para o fluxo de importação com confirmação dupla
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [confirmInput, setConfirmInput] = useState("");

  const refreshLastBackupDate = async () => {
    const date = await getLastBackupDate();
    setLastBackup(date);
  };

  useEffect(() => {
    if (isOpen) {
      refreshLastBackupDate();
      setErrorMsg("");
      setSuccessMsg("");
      setSelectedFileContent(null);
      setConfirmInput("");
    }
  }, [isOpen]);

  const handleExport = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await exportBackup();
      setLastBackup(res.exportDate);
      setSuccessMsg("Backup exportado com sucesso! Arquivo JSON salvo em seus downloads.");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setErrorMsg("");
    setSuccessMsg("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFileContent(event.target.result);
    };
    reader.onerror = () => {
      setErrorMsg("Erro ao ler o arquivo selecionado.");
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (confirmInput.trim() !== "CONFIRMAR") return;
    if (!selectedFileContent) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await importBackup(selectedFileContent);
      setSuccessMsg(result.message);
      setSelectedFileContent(null);
      setConfirmInput("");
      await refreshLastBackupDate();
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const calculateDaysAgo = (dateStr) => {
    if (!dateStr) return null;
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "hoje";
    if (days === 1) return "ontem";
    return `há ${days} dias`;
  };

  const daysAgoText = calculateDaysAgo(lastBackup);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-brand-gray border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="text-brand-blue" size={24} />
            Gerenciador de Backup (JSON)
          </h3>
          <button onClick={onClose} className="text-brand-light/60 hover:text-white text-lg">✕</button>
        </div>

        {/* Indicador do Último Backup */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-light/60 uppercase font-medium">Status da Cópia de Segurança</p>
            <p className="text-sm font-semibold text-white mt-0.5">
              {lastBackup ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  Último backup exportado: <strong className="text-brand-blue">{daysAgoText}</strong> ({new Date(lastBackup).toLocaleDateString('pt-BR')})
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert size={16} /> Nenhum backup gerado ainda neste dispositivo!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Mensagens de Sucesso / Erro */}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Seção de Exportar */}
        <div className="space-y-2 border-b border-white/10 pb-5">
          <h4 className="text-sm font-semibold text-white">1. Exportar Cópia de Segurança</h4>
          <p className="text-xs text-brand-light/60">
            Gera um arquivo <strong className="text-white">.json</strong> baixável contendo todas as OSs, clientes, aparelhos, assinaturas e fotos em Base64.
          </p>
          <Button onClick={handleExport} disabled={loading} className="w-full mt-2">
            <Download size={16} className="mr-2" />
            {loading ? "Exportando dados..." : "Baixar Backup em JSON"}
          </Button>
        </div>

        {/* Seção de Importar */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">2. Restaurar Dados a Partir de Backup</h4>
          <p className="text-xs text-brand-light/60">
            Carregue um arquivo .json exportado previamente para restaurar seu histórico.
          </p>

          {!selectedFileContent ? (
            <label className="border border-dashed border-white/20 hover:border-brand-blue rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
              <Upload size={18} className="text-brand-blue" />
              <span className="text-xs font-medium text-brand-light">Selecionar Arquivo .JSON de Backup</span>
              <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
            </label>
          ) : (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-3 text-xs">
              <div className="flex items-center justify-between text-amber-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert size={16} /> Arquivo Selecionado: {selectedFileName}
                </span>
                <button
                  onClick={() => setSelectedFileContent(null)}
                  className="text-brand-light/60 hover:text-white underline"
                >
                  Trocar Arquivo
                </button>
              </div>

              <p className="text-brand-light/80">
                ⚠️ <strong className="text-white">ATENÇÃO:</strong> Esta ação substituirá todas as informações locais. Um <strong className="text-emerald-400">auto-backup do estado atual será baixado automaticamente</strong> antes da atualização.
              </p>

              <div className="space-y-1.5 pt-1">
                <label className="block text-brand-light font-medium">
                  Para confirmar, digite <strong className="text-white">CONFIRMAR</strong> no campo abaixo:
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Digite CONFIRMAR"
                  className="w-full bg-brand-dark border border-amber-500/40 rounded px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                />
              </div>

              <Button
                type="button"
                onClick={handleExecuteImport}
                disabled={confirmInput.trim() !== "CONFIRMAR" || loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {loading ? "Restaurando..." : "Confirmar e Restaurar Banco de Dados"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
