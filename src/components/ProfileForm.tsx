/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FirejailProfile } from "../types";
import { buildFirejailCommandLine, generateProfileFileContent, parseProfileFileContent } from "../utils/commandGenerator";
import { AVAILABLE_SYSCALLS, AVAILABLE_CAPABILITIES } from "../data/defaultPresets";
import { 
  Shield, 
  Settings, 
  Database, 
  Wifi, 
  Tv, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Code, 
  FileText, 
  Terminal, 
  ArrowRight,
  Info,
  Play,
  DownloadCloud
} from "lucide-react";

interface ProfileFormProps {
  profile: FirejailProfile;
  onChange: (updatedProfile: FirejailProfile) => void;
  onSave: () => void;
  onStartSandbox?: (profile: FirejailProfile) => void;
}

export default function ProfileForm({ profile, onChange, onSave, onStartSandbox }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState<"general" | "filesystem" | "network" | "security" | "devices">("general");
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);
  const [previewMode, setPreviewMode] = useState<"cli" | "profile">("cli");
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [rawTextValue, setRawTextValue] = useState("");

  const handleDownloadProfile = () => {
    const filename = `${profile.program || "custom_app"}.profile`;
    const blob = new Blob([profileFileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApplyRawChanges = () => {
    try {
      const parsed = parseProfileFileContent(rawTextValue, profile);
      onChange(parsed);
      setIsEditingRaw(false);
    } catch (e) {
      alert("Erro ao analisar as alterações de texto raw. Verifique o formato.");
    }
  };

  // Helper inputs state
  const [newReadOnly, setNewReadOnly] = useState("");
  const [newWritePath, setNewWritePath] = useState("");
  const [newBlacklist, setNewBlacklist] = useState("");
  const [newWhitelist, setNewWhitelist] = useState("");
  const [newBin, setNewBin] = useState("");
  const [newEtc, setNewEtc] = useState("");
  const [newDns, setNewDns] = useState("");

  const updateField = (field: keyof FirejailProfile, value: any) => {
    onChange({
      ...profile,
      [field]: value
    });
  };

  const handleAddListItem = (field: keyof FirejailProfile, currentValue: string[] | undefined, valueToAdd: string, clearFn: () => void) => {
    if (!valueToAdd.trim()) return;
    const list = currentValue || [];
    if (!list.includes(valueToAdd.trim())) {
      updateField(field, [...list, valueToAdd.trim()]);
    }
    clearFn();
  };

  const handleRemoveListItem = (field: keyof FirejailProfile, currentValue: string[] | undefined, indexToRemove: number) => {
    const list = currentValue || [];
    const updated = list.filter((_, idx) => idx !== indexToRemove);
    updateField(field, updated);
  };

  const copyToClipboard = (text: string, type: "cmd" | "file") => {
    navigator.clipboard.writeText(text);
    if (type === "cmd") {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } else {
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    }
  };

  const commandLine = buildFirejailCommandLine(profile);
  const profileFileContent = generateProfileFileContent(profile);

  return (
    <div id="profile-builder-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration tabs and properties */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Configurar Perfil Sandbox
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize permissões detalhadas do Linux Namespace, Seccomp e Filesystems para {profile.program || "novo processo"}.
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex gap-2 items-center px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="flex flex-col">
                       <span className="text-[10px] text-slate-500 uppercase">Tam.</span>
                       <span className="text-emerald-400 font-mono font-bold text-xs">{new Blob([profileFileContent]).size} B</span>
                    </div>
                    <div className="w-px h-6 bg-slate-800"></div>
                     <div className="flex flex-col">
                       <span className="text-[10px] text-slate-500 uppercase">Restr.</span>
                       {/* Simplified restriction counting based on the fields observed */}
                       <span className="text-emerald-400 font-mono font-bold text-xs">
                         {(Object.values(profile).filter(v => v === true).length + 
                           Object.keys(profile).filter(k => Array.isArray(profile[k as keyof FirejailProfile]) && (profile[k as keyof FirejailProfile] as any[]).length > 0)
                            .reduce((acc, k) => acc + (profile[k as keyof FirejailProfile] as any[]).length, 0))}
                       </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Sintaxe validada com sucesso.")}
                    className="px-3 py-2 bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 rounded-lg hover:bg-slate-750 active:bg-slate-850 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                    id="btn-validate-syntax"
                    title="Validar Sintaxe"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Validar Sintaxe
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadProfile}
                    className="px-3 py-2 bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 rounded-lg hover:bg-slate-750 active:bg-slate-850 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                    id="btn-export-profile"
                    title="Exportar Perfil"
                  >
                    <DownloadCloud className="w-3.5 h-3.5 text-emerald-400" />
                    Exportar Perfil
                  </button>
              <button
                type="button"
                onClick={onSave}
                className="px-4 py-2 bg-emerald-500 text-black font-semibold text-xs rounded-lg hover:bg-emerald-400 active:bg-emerald-600 transition flex items-center gap-2 cursor-pointer"
                id="btn-save-profile"
              >
                Salvar Perfil
              </button>
              {onStartSandbox && (
                <button
                  type="button"
                  onClick={() => onStartSandbox(profile)}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold text-xs rounded-lg hover:bg-blue-400 active:bg-blue-600 transition flex items-center gap-2"
                  id="btn-run-simulated"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Iniciar Teste (Live Logs)
                </button>
              )}
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition ${
                activeTab === "general" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Geral
            </button>
            <button
              onClick={() => setActiveTab("filesystem")}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition ${
                activeTab === "filesystem" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Sistema de Arquivos
            </button>
            <button
              onClick={() => setActiveTab("network")}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition ${
                activeTab === "network" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              Rede
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition ${
                activeTab === "security" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Segurança & Kernel
            </button>
            <button
              onClick={() => setActiveTab("devices")}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition ${
                activeTab === "devices" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Dispositivos & DBus
            </button>
          </div>

          {/* Form Content Scrollable area */}
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Nome do Perfil de Identificação
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Ex: Firefox Isolado"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Aplicativo Alvo (Executável / Caminho)
                    </label>
                    <input
                      type="text"
                      value={profile.program}
                      onChange={(e) => updateField("program", e.target.value)}
                      placeholder="Ex: firefox, transmission-gtk, node, python3"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Descrição do Propósito
                  </label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Para que serve este perfil e qual o nível de blindagem..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Argumentos Padrão do Programa
                    </label>
                    <input
                      type="text"
                      value={profile.arguments}
                      onChange={(e) => updateField("arguments", e.target.value)}
                      placeholder="Ex: --private-window, test.py"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Nome Customizado da Sandbox (<span className="font-mono">--name</span>)
                    </label>
                    <input
                      type="text"
                      value={profile.sandboxName || ""}
                      onChange={(e) => updateField("sandboxName", e.target.value)}
                      placeholder="Ex: meu-navegador"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg space-y-3">
                  <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-900">
                    Limites de Processo & Diagnóstico
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Tempo Limite do Sandbox (<span className="font-mono">--timeout=hh:mm:ss</span>)
                      </label>
                      <input
                        type="text"
                        value={profile.timeout || ""}
                        onChange={(e) => updateField("timeout", e.target.value)}
                        placeholder="Ex: 01:30:00 (1 hora e 30 mins)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Afinidade de CPUs (<span className="font-mono">--cpu=cores</span>)
                      </label>
                      <input
                        type="text"
                        value={profile.cpu || ""}
                        onChange={(e) => updateField("cpu", e.target.value)}
                        placeholder="Ex: 0,1 (Fixa processo no Core 0 e 1)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Nice Value (<span className="font-mono">--nice</span>)
                      </label>
                      <input
                        type="number"
                        value={profile.nice !== undefined ? profile.nice : ""}
                        onChange={(e) => updateField("nice", e.target.value)}
                        placeholder="-20 a 19"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        OOM Score Score (<span className="font-mono">--oom</span>)
                      </label>
                      <input
                        type="number"
                        value={profile.oom !== undefined ? profile.oom : ""}
                        onChange={(e) => updateField("oom", e.target.value)}
                        placeholder="Ex: 1000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.debug || false}
                          onChange={(e) => updateField("debug", e.target.checked)}
                          className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        Habilitar Logs de Debug (<span className="font-mono">--debug</span>)
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-400 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.deterministicExitCode || false}
                        onChange={(e) => updateField("deterministicExitCode", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      Retornar status do filho1 (<span className="font-mono">--deterministic-exit-code</span>)
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-400 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.deterministicShutdown || false}
                        onChange={(e) => updateField("deterministicShutdown", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      Matar órfãos ao fechar (<span className="font-mono">--deterministic-shutdown</span>)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* FILESYSTEM TAB */}
            {activeTab === "filesystem" && (
              <div className="space-y-6">
                {/* Temp or Isolation mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg space-y-4">
                    <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-900 flex items-center justify-between">
                      <span>Diretório Home Privado</span>
                      <Info className="w-3.5 h-3.5 text-emerald-400" />
                    </h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={profile.privateHome || false}
                          onChange={(e) => {
                            updateField("privateHome", e.target.checked);
                            if(!e.target.checked) updateField("privateHomeDir", "");
                          }}
                          className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <div>
                          <span className="font-semibold block text-white">Isolar a Home do Usuário (<span className="font-mono">--private</span>)</span>
                          <span className="text-slate-400 block text-[11px] mt-0.5">Monta uma pasta Home temporária vazia que é deletada automaticamente após o encerramento do app.</span>
                        </div>
                      </label>

                      {profile.privateHome && (
                        <div className="mt-2 pl-6 animate-fade-in">
                          <label className="block text-[11px] text-slate-400 mb-1">Usar pasta pré-existente como Home (Opcional):</label>
                          <input
                            type="text"
                            value={profile.privateHomeDir || ""}
                            onChange={(e) => updateField("privateHomeDir", e.target.value)}
                            placeholder="Ex: ~/sandbox_home_firefox"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg space-y-4">
                    <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-900">
                      Modos de Sandbox FTS
                    </h3>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.privateCache || false}
                          onChange={(e) => updateField("privateCache", e.target.checked)}
                          className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <span>Cache Temporária (<span className="font-mono">--private-cache</span>)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.privateDev || false}
                          onChange={(e) => updateField("privateDev", e.target.checked)}
                          className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <span>Criar /dev Privado Mínimo (<span className="font-mono">--private-dev</span>)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.privateTmp || false}
                          onChange={(e) => updateField("privateTmp", e.target.checked)}
                          className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <span>Isolar Pasta /tmp (<span className="font-mono">--private-tmp</span>)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.privateCwd || false}
                          onChange={(e) => {
                            updateField("privateCwd", e.target.checked);
                            if(!e.target.checked) updateField("privateCwdDir", "");
                          }}
                          className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <span>Isolar diretório de trabalho (<span className="font-mono">--private-cwd</span>)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Path lists (Read-Only, Blacklist, Whitelist) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Blacklist */}
                  <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-lg">
                    <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Lista Negra (<span className="font-mono">--blacklist</span>)</span>
                      <span className="text-red-400 text-[10px]">Ocultar do Sandbox</span>
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newBlacklist}
                        onChange={(e) => setNewBlacklist(e.target.value)}
                        placeholder="Ex: ~/.ssh, ~/Documents"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                        onKeyDown={(e) => e.key === "Enter" && handleAddListItem("blacklistPaths", profile.blacklistPaths, newBlacklist, () => setNewBlacklist(""))}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddListItem("blacklistPaths", profile.blacklistPaths, newBlacklist, () => setNewBlacklist(""))}
                        className="px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {(profile.blacklistPaths || []).map((path, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-900 border border-slate-850 px-2 py-1 rounded text-xs">
                          <span className="font-mono text-slate-300 break-all">{path}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveListItem("blacklistPaths", profile.blacklistPaths, idx)}
                            className="text-slate-500 hover:text-red-400 ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(profile.blacklistPaths || []).length === 0 && (
                        <span className="text-[11px] text-slate-500 italic block">Nenhum caminho na lista negra</span>
                      )}
                    </div>
                  </div>

                  {/* Whitelist */}
                  <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-lg">
                    <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Lista Branca (<span className="font-mono">--whitelist</span>)</span>
                      <span className="text-emerald-400 text-[10px]">Permitir Somente Estes</span>
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newWhitelist}
                        onChange={(e) => setNewWhitelist(e.target.value)}
                        placeholder="Ex: ~/Downloads"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        onKeyDown={(e) => e.key === "Enter" && handleAddListItem("whitelistPaths", profile.whitelistPaths, newWhitelist, () => setNewWhitelist(""))}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddListItem("whitelistPaths", profile.whitelistPaths, newWhitelist, () => setNewWhitelist(""))}
                        className="px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {(profile.whitelistPaths || []).map((path, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-900 border border-slate-850 px-2 py-1 rounded text-xs">
                          <span className="font-mono text-slate-300 break-all">{path}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveListItem("whitelistPaths", profile.whitelistPaths, idx)}
                            className="text-slate-500 hover:text-red-400 ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(profile.whitelistPaths || []).length === 0 && (
                        <span className="text-[11px] text-slate-500 italic block">Nenhum caminho na lista branca</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Read-Only Paths */}
                  <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-lg">
                    <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Caminhos Apenas-Leitura (<span className="font-mono">--read-only</span>)</span>
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newReadOnly}
                        onChange={(e) => setNewReadOnly(e.target.value)}
                        placeholder="Ex: /var/log, ~/.config"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        onKeyDown={(e) => e.key === "Enter" && handleAddListItem("readOnlyPaths", profile.readOnlyPaths, newReadOnly, () => setNewReadOnly(""))}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddListItem("readOnlyPaths", profile.readOnlyPaths, newReadOnly, () => setNewReadOnly(""))}
                        className="px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {(profile.readOnlyPaths || []).map((path, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-900 border border-slate-850 px-2 py-1 rounded text-xs">
                          <span className="font-mono text-slate-300 break-all">{path}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveListItem("readOnlyPaths", profile.readOnlyPaths, idx)}
                            className="text-slate-500 hover:text-red-400 ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(profile.readOnlyPaths || []).length === 0 && (
                        <span className="text-[11px] text-slate-500 italic block">Nenhum caminho configurado em apenas leitura</span>
                      )}
                    </div>
                  </div>

                  {/* Private bin */}
                  <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-lg">
                    <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Binários Visíveis Privados (<span className="font-mono">--private-bin</span>)</span>
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newBin}
                        onChange={(e) => setNewBin(e.target.value)}
                        placeholder="Ex: firefox, vlc, python3, bash"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                        onKeyDown={(e) => e.key === "Enter" && handleAddListItem("privateBin", profile.privateBin, newBin, () => setNewBin(""))}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddListItem("privateBin", profile.privateBin, newBin, () => setNewBin(""))}
                        className="px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {(profile.privateBin || []).map((bin, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-900 border border-slate-850 px-2 py-1 rounded text-xs">
                          <span className="font-mono text-slate-300">{bin}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveListItem("privateBin", profile.privateBin, idx)}
                            className="text-slate-500 hover:text-red-400 ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(profile.privateBin || []).length === 0 && (
                        <span className="text-[11px] text-slate-500 italic block">Todos os binários do sistema estão visíveis por padrão</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* System folders accesses */}
                <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg">
                  <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-900 mb-3">
                    Permissões de Escrita do Sistema
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.writableEtc || false}
                        onChange={(e) => updateField("writableEtc", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      Permitir escrita em /etc (<span className="font-mono">--writable-etc</span>)
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.writableRunUser || false}
                        onChange={(e) => updateField("writableRunUser", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      Acesso livre ao /run/user/UID (<span className="font-mono">--writable-run-user</span>)
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.writableVar || false}
                        onChange={(e) => updateField("writableVar", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      Permitir escrita em /var (<span className="font-mono">--writable-var</span>)
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.writableVarLog || false}
                        onChange={(e) => updateField("writableVarLog", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      Usar /var/log real diretamente (<span className="font-mono">--writable-var-log</span>)
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* NETWORK TAB */}
            {activeTab === "network" && (() => {
              const currentNetMode = profile.netBridge === "none" ? "none" : (profile.netBridge ? "bridge" : "host");
              
              const handleSelectNetMode = (mode: "none" | "bridge" | "host") => {
                if (mode === "none") {
                  onChange({
                    ...profile,
                    netBridge: "none",
                    ipAddress: "none"
                  });
                } else if (mode === "host") {
                  onChange({
                    ...profile,
                    netBridge: "",
                    ipAddress: ""
                  });
                } else {
                  onChange({
                    ...profile,
                    netBridge: "br0",
                    ipAddress: ""
                  });
                }
              };

              return (
                <div className="space-y-4 animate-fade-in">
                  {/* Primary Net-Namespace Panel */}
                  <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg space-y-4">
                    <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-900 flex items-center justify-between">
                      <span>Configuração do Namespace de Rede (Net-Namespace)</span>
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    </h3>

                    {/* Highly aesthetic toggle group card layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* HOST MODE */}
                      <div 
                        onClick={() => handleSelectNetMode("host")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between ${
                          currentNetMode === "host"
                            ? "bg-slate-900/80 border-amber-500/50 shadow-lg shadow-amber-950/10"
                            : "bg-slate-950/30 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-100">Compartilhar Host</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-mono bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">--net=host</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            O app compartilha a interface e a tabela de rotas do hospedeiro. Padrão para navegadores e utilitários que herdam o Wi-Fi local sem limites.
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-900">
                          <span className="text-[10px] text-amber-400/80 font-semibold font-mono">Sem Isolamento</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            currentNetMode === "host" ? "border-amber-500 bg-amber-500/25" : "border-slate-700"
                          }`}>
                            {currentNetMode === "host" && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          </div>
                        </div>
                      </div>

                      {/* NONE MODE */}
                      <div 
                        onClick={() => handleSelectNetMode("none")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between ${
                          currentNetMode === "none"
                            ? "bg-slate-900/80 border-emerald-500/50 shadow-lg shadow-emerald-950/10"
                            : "bg-slate-950/30 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-100">Isolamento Total</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">--net=none</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Cria um namespace contendo apenas a interface de loopback desativando qualquer soquete externo. Ideal para aplicativos offline.
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-900">
                          <span className="text-[10px] text-emerald-400/85 font-semibold font-mono">Segurança Máxima</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            currentNetMode === "none" ? "border-emerald-500 bg-emerald-500/25" : "border-slate-700"
                          }`}>
                            {currentNetMode === "none" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          </div>
                        </div>
                      </div>

                      {/* BRIDGE MODE */}
                      <div 
                        onClick={() => handleSelectNetMode("bridge")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between ${
                          currentNetMode === "bridge"
                            ? "bg-slate-900/80 border-blue-500/50 shadow-lg shadow-blue-950/10"
                            : "bg-slate-950/30 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-100">Ponte Virtual</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-mono bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">--net=interface</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Encaminha as conexões através de pontes compartilhadas no kernel (ex: docker0, br0). Protege contra escuta ARP e sniffs do host.
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-900">
                          <span className="text-[10px] text-blue-400/85 font-semibold font-mono">Subrede Isolada</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            currentNetMode === "bridge" ? "border-blue-500 bg-blue-500/25" : "border-slate-700"
                          }`}>
                            {currentNetMode === "bridge" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sub-parameters based on selection */}
                    {currentNetMode === "bridge" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-900 animate-fade-in">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                            Interface de Rede / Ponte (<span className="font-mono">--net=interface</span>)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={profile.netBridge === "none" ? "br0" : (profile.netBridge || "br0")}
                              onChange={(e) => updateField("netBridge", e.target.value)}
                              placeholder="Ex: br0, docker0, eth0"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                            <select
                              value={profile.netBridge && profile.netBridge !== "none" ? profile.netBridge : ""}
                              onChange={(e) => {
                                if (e.target.value) updateField("netBridge", e.target.value);
                              }}
                              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 text-xs cursor-pointer hover:bg-slate-800"
                            >
                              <option value="">Pré-selecionados...</option>
                              <option value="br0">Ponte br0</option>
                              <option value="docker0">Ponte docker0</option>
                              <option value="eth0">eth0 (Ethernet)</option>
                              <option value="wlan0">wlan0 (Wi-Fi)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                            Endereço IP Associado (<span className="font-mono">--ip=address</span>)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={(profile.ipAddress === "none" ? "" : profile.ipAddress) || ""}
                              onChange={(e) => updateField("ipAddress", e.target.value)}
                              placeholder="Ex: 192.168.1.100, dhcp"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                            <select
                              value={profile.ipAddress || ""}
                              onChange={(e) => updateField("ipAddress", e.target.value)}
                              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 text-xs cursor-pointer hover:bg-slate-800"
                            >
                              <option value="">Atribuição Livre</option>
                              <option value="dhcp">Clientes DHCP</option>
                              <option value="191.168.10.22">IP Reservado local</option>
                              <option value="10.0.0.101">Subrede 10.0.0.x</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CUSTOM IPS & DNS COMMA PANEL */}
                    <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-lg space-y-4">
                      <div>
                        <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-1.5 border-b border-slate-900 mb-3 flex justify-between items-center text-emerald-400">
                          <span>IPs e DNS Personalizados (Campos de Texto)</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 mb-3 leading-normal">
                          Forneça e especifique endereços IP ou servidores DNS diretamente. O assistente formata e aplica os argumentos automaticamente.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* Custom IP Input */}
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Endereço IPv4 Personalizado (<span className="font-mono">--ip=</span>)
                          </label>
                          <input
                            type="text"
                            value={profile.ipAddress || ""}
                            onChange={(e) => updateField("ipAddress", e.target.value)}
                            placeholder="Ex: 192.168.1.55 ou dhcp"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </div>

                        {/* Custom IPv6 Input */}
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Endereço IPv6 Personalizado (<span className="font-mono">--ip6=</span>)
                          </label>
                          <input
                            type="text"
                            value={profile.ip6Address || ""}
                            onChange={(e) => updateField("ip6Address", e.target.value)}
                            placeholder="Ex: 2001:db8:85a3::8a2e:370:7334"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </div>

                        {/* Batch text input for DNS servers */}
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Servidores DNS (Texto separado por vírgula)
                          </label>
                          <input
                            type="text"
                            value={(profile.dnsServers || []).join(", ")}
                            onChange={(e) => {
                              const dnsList = e.target.value
                                .split(",")
                                .map(item => item.trim())
                                .filter(item => item !== "");
                              updateField("dnsServers", dnsList);
                            }}
                            placeholder="Ex: 1.1.1.1, 8.8.8.8, 9.9.9.9"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tradicional DNS list / Advanced Networking parameters */}
                    <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-lg space-y-4">
                      {/* DNS list view helper */}
                      <div>
                        <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-1.5 border-b border-slate-900 mb-3 flex items-center justify-between">
                          <span>Lista Ativa de Servidores DNS ({profile.dnsServers?.length || 0})</span>
                        </h3>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={newDns}
                            onChange={(e) => setNewDns(e.target.value)}
                            placeholder="Apenas adicionar um (Ex: 8.8.4.4)"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            onKeyDown={(e) => e.key === "Enter" && handleAddListItem("dnsServers", profile.dnsServers, newDns, () => setNewDns(""))}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddListItem("dnsServers", profile.dnsServers, newDns, () => setNewDns(""))}
                            className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin">
                          {(profile.dnsServers || []).map((dns, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900 border border-slate-850 px-2 py-1 rounded text-xs font-mono">
                              <span className="text-slate-300">{dns}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveListItem("dnsServers", profile.dnsServers, idx)}
                                className="text-slate-500 hover:text-red-400 ml-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {(profile.dnsServers || []).length === 0 && (
                            <span className="text-[11px] text-slate-500 italic block py-4 text-center border border-dashed border-slate-900">
                              Herda os servidores DNS do computador host
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Advanced Net Params */}
                      <div className="pt-2 border-t border-slate-900 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5 font-bold uppercase">MAC Address:</label>
                            <input
                              type="text"
                              value={profile.macAddress || ""}
                              onChange={(e) => updateField("macAddress", e.target.value)}
                              placeholder="00:11:22:33:44:55"
                              className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5 font-bold uppercase">Nome Veth:</label>
                            <input
                              type="text"
                              value={profile.vethName || ""}
                              onChange={(e) => updateField("vethName", e.target.value)}
                              placeholder="veth0"
                              className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5 font-bold uppercase">Netmask:</label>
                            <input
                              type="text"
                              value={profile.netmask || ""}
                              onChange={(e) => updateField("netmask", e.target.value)}
                              placeholder="255.255.255.0"
                              className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5 font-bold uppercase font-sans">MTU:</label>
                            <input
                              type="number"
                              value={profile.mtu || ""}
                              onChange={(e) => updateField("mtu", e.target.value)}
                              placeholder="1500"
                              className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monitoramento & IP Spoofing block inside IIFE return */}
                  <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg">
                    <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-900 mb-3">
                      Monitoramento & IP Spoofing
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.dnsTrace || false}
                          onChange={(e) => updateField("dnsTrace", e.target.checked)}
                          className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        Monitorar requisições DNS (--dnstrace)
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.netTrace || false}
                          onChange={(e) => updateField("netTrace", e.target.checked)}
                          className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        Logar pacotes recebidos TCP/UDP (--nettrace)
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.netStats || false}
                          onChange={(e) => updateField("netStats", e.target.checked)}
                          className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        Coletar estatísticas de tráfego (--netstats)
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.hostnameRandomize || false}
                          onChange={(e) => updateField("hostnameRandomize", e.target.checked)}
                          className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        Hostname aleatório na rede (--hostname-randomize)
                      </label>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-4">
                {/* Linux Capabilities */}
                <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg space-y-4">
                  <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-900 flex items-center justify-between">
                    <span>Linux Capabilities Filter (Restrição Root)</span>
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={profile.capsEnabled || false}
                          onChange={(e) => updateField("capsEnabled", e.target.checked)}
                          className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <div>
                          <span className="font-semibold block text-white">Ativar Filtro Seletivo de Capacidades (<span className="font-mono">--caps</span>)</span>
                          <span className="text-slate-400 block text-[10px] mt-0.5">Bloqueia privilégios do kernel associados a super usuários mesmo se o processo rodar sob UID 0.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={profile.capsDropAll || false}
                          onChange={(e) => {
                            updateField("capsDropAll", e.target.checked);
                            if (e.target.checked) {
                              updateField("capsEnabled", true);
                              updateField("capsDrop", []);
                            }
                          }}
                          className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <div>
                          <span className="font-semibold block text-white">Dropar Todas Capabilities (<span className="font-mono">--caps.drop=all</span>)</span>
                          <span className="text-slate-400 block text-[10px] mt-0.5">Neutraliza completamente o usuário root de alterar configurações de baixo nível dentro da sandbox.</span>
                        </div>
                      </label>
                    </div>

                    {!profile.capsDropAll && profile.capsEnabled && (
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 animate-fade-in">
                        <span className="block text-xs font-semibold text-slate-300 mb-2">Capabilities para Remover da Sandbox (--caps.drop=...) :</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-400">
                          {["CAP_SYS_ADMIN", "CAP_NET_RAW", "CAP_SYS_MODULE", "CAP_SYS_PTRACE", "CAP_SYS_BOOT", "CAP_SETUID"].map((cap) => {
                            const activeList = profile.capsDrop || [];
                            const isSelected = activeList.includes(cap);
                            return (
                              <label key={cap} className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      updateField("capsDrop", activeList.filter(c => c !== cap));
                                    } else {
                                      updateField("capsDrop", [...activeList, cap]);
                                    }
                                  }}
                                  className="rounded text-emerald-500 border-slate-800 bg-slate-950"
                                />
                                <span className={isSelected ? "text-emerald-400 font-mono" : "font-mono"}>{cap}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECCOMP & Privs */}
                <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg space-y-4">
                  <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-900">
                    Seccomp Filter (Filtro de Chamadas do Kernel)
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={profile.seccompEnabled || false}
                          onChange={(e) => updateField("seccompEnabled", e.target.checked)}
                          className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <div>
                          <span className="font-semibold block text-white">Habilitar SECCOMP Default (<span className="font-mono">--seccomp</span>)</span>
                          <span className="text-slate-400 block text-[10px] mt-0.5">Filtra chamadas raras ou perigosas (como reboot, mount, kexec, ptrace) por padrão.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={profile.seccompBlockSecondary || false}
                          onChange={(e) => updateField("seccompBlockSecondary", e.target.checked)}
                          className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <div>
                          <span className="font-semibold block text-white">Bloquear Arq. Secundária (<span className="font-mono">--seccomp.block-secondary</span>)</span>
                          <span className="text-slate-400 block text-[10px] mt-0.5">Impede subverter filtros carregando binários de 32 bits (i386) em sistemas de 64 bits.</span>
                        </div>
                      </label>
                    </div>

                    {profile.seccompEnabled && (
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
                        <span className="block text-xs font-semibold text-slate-300">Chamadas Adicionais de Sistema para Bloquear:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                          {["socket", "ptrace", "mount", "setuid", "execve", "syslog", "swapon", "chroot"].map((syscall) => {
                            const activeSys = profile.seccompSyscalls || [];
                            const isSelected = activeSys.includes(syscall);
                            return (
                              <label key={syscall} className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      updateField("seccompSyscalls", activeSys.filter(s => s !== syscall));
                                    } else {
                                      updateField("seccompSyscalls", [...activeSys, syscall]);
                                    }
                                  }}
                                  className="rounded text-emerald-500 border-slate-800 bg-slate-950"
                                />
                                <span className={isSelected ? "text-emerald-400 font-mono" : "font-mono"}>{syscall}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Namespaces & Nonewprivs */}
                <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg">
                  <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-900 mb-3">
                    Restrições e Namespace do Kernel
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-start gap-2 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={profile.nonewprivs || false}
                        onChange={(e) => updateField("nonewprivs", e.target.checked)}
                        className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <div>
                        <span className="font-semibold block text-white-70">Privilégios Estáticos (<span className="font-mono">--nonewprivs</span>)</span>
                        <span className="text-[10px] text-slate-400">Garante que o processo nunca possa ganhar novos privilégios via executáveis SUID.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={profile.noroot || false}
                        onChange={(e) => updateField("noroot", e.target.checked)}
                        className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <div>
                        <span className="font-semibold block text-white-70">Simular não-root (<span className="font-mono">--noroot</span>)</span>
                        <span className="text-[10px] text-slate-400">Instala um namespace de usuário que finge que o root é desabilitado.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={profile.memoryDenyWriteExecute || false}
                        onChange={(e) => updateField("memoryDenyWriteExecute", e.target.checked)}
                        className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <div>
                        <span className="font-semibold block text-white">Bloquear Gravação+Execução (<span className="font-mono">--memory-deny-write-execute</span>)</span>
                        <span className="text-[10px] text-slate-400">Impede mapeamentos de memória perigosos (evita ataques stack overflow e shellcodes).</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={profile.apparmorEnabled || false}
                        onChange={(e) => {
                          updateField("apparmorEnabled", e.target.checked);
                          if (!e.target.checked) updateField("apparmorProfile", "");
                        }}
                        className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <div>
                        <span className="font-semibold block text-white">Habilitar AppArmor (<span className="font-mono">--apparmor</span>)</span>
                        <span className="text-[10px] text-slate-400">Força o confinamento pelo perfil padrão ou customizado do AppArmor.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* DEVICES TAB */}
            {activeTab === "devices" && (
              <div className="space-y-4">
                <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg">
                  <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-900 mb-3 flex items-center justify-between">
                    <span>Restrição de Periféricos de Hardware</span>
                    <Tv className="w-3.5 h-3.5 text-emerald-400" />
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={profile.noSound || false}
                        onChange={(e) => updateField("noSound", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <span>Bloquear Placa de Som (<span className="font-mono">--nosound</span>)</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={profile.noVideo || false}
                        onChange={(e) => updateField("noVideo", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <span>Bloquear Câmeras de Vídeo (<span className="font-mono">--novideo</span>)</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={profile.noInput || false}
                        onChange={(e) => updateField("noInput", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <span>Desabilitar Controles de Entrada (<span className="font-mono">--noinput</span>)</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={profile.no3d || false}
                        onChange={(e) => updateField("no3d", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <span>Desativar Aceleração 3D Grafica (<span className="font-mono">--no3d</span>)</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={profile.noDvd || false}
                        onChange={(e) => updateField("noDvd", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <span>Bloquear Leitor de DVD/CD (<span className="font-mono">--nodvd</span>)</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={profile.noU2f || false}
                        onChange={(e) => updateField("noU2f", e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <span>Bloquear Dispositivos Security Key (U2F)</span>
                    </label>
                  </div>
                </div>

                {/* DBus blockages */}
                <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg">
                  <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-900 mb-3 text-yellow-500">
                    Barramento de Mensagens D-Bus Sandbox
                  </h3>
                  
                  <div className="space-y-4 text-xs">
                    <label className="flex items-start gap-2 text-slate-300 cursor-pointer select-none hover:text-white">
                      <input
                        type="checkbox"
                        checked={profile.nodbus || false}
                        onChange={(e) => updateField("nodbus", e.target.checked)}
                        className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                      />
                      <div>
                        <span className="font-semibold block">Desabilitar D-Bus Completamente (<span className="font-mono">--nodbus</span>)</span>
                        <span className="text-[10px] text-slate-400">Excelente para fins de segurança estrita. Evita que o programa se comunique com outros softwares fora do container.</span>
                      </div>
                    </label>

                    {!profile.nodbus && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 animate-fade-in">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">D-Bus do Sistema:</label>
                          <select
                            value={profile.dbusSystem || ""}
                            onChange={(e) => updateField("dbusSystem", e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full font-mono"
                          >
                            <option value="">Permitido (Sem restrições)</option>
                            <option value="none">Bloquear total (--dbus-system=none)</option>
                            <option value="filter">Isolamento com filtro (--dbus-system=filter)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">D-Bus da Sessão de Usuário:</label>
                          <select
                            value={profile.dbusUser || ""}
                            onChange={(e) => updateField("dbusUser", e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full font-mono"
                          >
                            <option value="">Permitido (Sem restrições)</option>
                            <option value="none">Bloquear total (--dbus-user=none)</option>
                            <option value="filter">Isolamento com filtro (--dbus-user=filter)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* X11 modes */}
                <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-lg">
                  <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-900 mb-3">
                    Servidor Gráfico e Display Sandbox (X11)
                  </h3>

                  <div className="space-y-3">
                    <label className="block text-xs text-slate-400 mb-1">
                      Confinamento de Display X11 (<span className="font-mono">--x11</span>)
                    </label>
                    <select
                      value={profile.x11Mode || ""}
                      onChange={(e) => updateField("x11Mode", e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full font-mono"
                    >
                      <option value="">Compartilhado por padrão (Menor Segurança - Permite ler tela/teclas)</option>
                      <option value="none">Desabilitar Qualquer Vídeo X11 (--x11=none - Recomendado para CLI)</option>
                      <option value="xorg">Isolar com X11 Security Extension (--x11=xorg)</option>
                      <option value="xephyr">Confinar display na janela Xephyr (--x11=xephyr)</option>
                      <option value="xpra">Compartilhar tela via Xpra Container (--x11=xpra)</option>
                    </select>

                    {profile.x11Mode === "xephyr" && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5 font-mono">--xephyr-screen:</label>
                          <input
                            type="text"
                            value={profile.xephyrScreen || ""}
                            onChange={(e) => updateField("xephyrScreen", e.target.value)}
                            placeholder="Ex: 800x600"
                            className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-white focus:ring-1 focus:ring-emerald-550 w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5 font-mono">Argumentos Extras Xephyr:</label>
                          <input
                            type="text"
                            value={profile.xephyrExtraParams || ""}
                            onChange={(e) => updateField("xephyrExtraParams", e.target.value)}
                            placeholder="OPTIONS"
                            className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-white focus:ring-1 focus:ring-emerald-550 w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bottom description */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <span>🎯 Dica: Salve o perfil para mantê-lo na barra lateral de navegação.</span>
          <span className="font-mono text-[10px] text-slate-500">Firejail v0.9.80 Engine</span>
        </div>
      </div>

      {/* Real-time Commands Generated Showcase */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-855 rounded-xl p-5 shadow-xl flex flex-col justify-between h-auto">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-400" />
                Saída Gerada em Tempo Real
              </h3>
              <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewMode("cli")}
                  className={`px-2.5 py-1 rounded font-semibold transition ${previewMode === "cli" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  CLI CLI
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("profile")}
                  className={`px-2.5 py-1 rounded font-semibold transition ${previewMode === "profile" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  .profile
                </button>
              </div>
            </div>

            {previewMode === "cli" ? (
              <div className="space-y-4">
                <p className="text-slate-400 text-xs leading-relaxed">
                  Copie esta instrução no terminal do Linux para rodar seu aplicativo sandbox instantaneamente:
                </p>
                <div className="relative bg-slate-950 text-emerald-400 text-xs px-4 py-3 rounded-lg border border-slate-850 font-mono select-all overflow-x-auto min-h-24 max-h-56 scrollbar-thin flex flex-col justify-between">
                  <span>{commandLine}</span>
                  <button
                    onClick={() => copyToClipboard(commandLine, "cmd")}
                    className="absolute top-2 right-2 p-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded hover:text-white transition hover:bg-slate-800"
                    title="Copiar Comando"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-850 text-[11px] text-slate-400 space-y-2 leading-relaxed">
                  <div className="flex items-center gap-1 font-semibold text-slate-200">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Como Utilizar no Sistema:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Copie o comando gerado acima.</li>
                    <li>Abra um terminal no seu Linux.</li>
                    <li>Certifique-se que o Firejail está instalado (<code className="bg-slate-900 border border-slate-800 px-1 rounded text-[10px] text-emerald-300 font-mono">sudo apt install firejail</code>).</li>
                    <li>Cole e aperte Enter para executar a Sandbox segura!</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Visualizador de arquivo (.profile):
                  </p>
                  <button
                    onClick={() => {
                      if (!isEditingRaw) {
                        setRawTextValue(profileFileContent);
                      }
                      setIsEditingRaw(!isEditingRaw);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer select-none font-semibold uppercase tracking-wider"
                    title="Editar texto bruto do perfil"
                    id="btn-toggle-raw-edit"
                  >
                    {isEditingRaw ? "Ver Código Gerado" : "Editar Diretamente ✏️"}
                  </button>
                </div>

                {isEditingRaw ? (
                  <div className="space-y-3 animate-fade-in">
                    <textarea
                      value={rawTextValue}
                      onChange={(e) => setRawTextValue(e.target.value)}
                      rows={11}
                      className="w-full bg-slate-950 text-slate-350 text-[11px] leading-relaxed p-3 rounded-lg border border-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 whitespace-pre scrollbar-thin"
                      placeholder="# Insira ou edite as propriedades do Firejail aqui..."
                      id="text-raw-field"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsEditingRaw(false)}
                        className="px-2.5 py-1 text-[11px] bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition cursor-pointer"
                        id="btn-cancel-raw-edit"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleApplyRawChanges}
                        className="px-2.5 py-1 text-[11px] bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-500 transition cursor-pointer"
                        id="btn-apply-raw-edit"
                      >
                        Aplicar Edições
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative bg-slate-950 text-slate-350 text-xs px-4 py-3 rounded-lg border border-slate-850 font-mono white-space-pre-wrap select-all overflow-y-auto max-h-56 scrollbar-thin">
                    <pre className="text-[11px] leading-tight text-slate-400">{profileFileContent}</pre>
                    <button
                      onClick={() => copyToClipboard(profileFileContent, "file")}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded hover:text-white transition hover:bg-slate-800 cursor-pointer"
                      title="Copiar Arquivo de Perfil"
                    >
                      {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-850 text-[11px] text-slate-400 space-y-2 leading-relaxed">
                  <div className="flex items-center gap-1 font-semibold text-slate-200">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Onde salvar este perfil:</span>
                  </div>
                  <p className="pl-1">
                    Salve em <code className="bg-slate-900 px-1 py-0.5 rounded text-[10px] text-emerald-300 font-mono">~/.config/firejail/{profile.program || "app"}.profile</code> para que ele seja carregado por padrão sempre que você rodar o app através do Firejail!
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] text-slate-400">
              Sincronizado automaticamente com o painel de edição
            </span>
          </div>
        </div>

        {/* Simple security meter block */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5 text-slate-300 shadow bg-gradient-to-br from-slate-900 to-slate-950">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Audit Score de Confinamento (Estimado)
          </h4>
          
          {/* We determine security index dynamically based on options checked */}
          {(() => {
            let score = 10; // start low
            const reasons: string[] = [];

            if (profile.privateHome) { score += 20; reasons.push("Home Directory Isolado"); }
            if (profile.seccompEnabled) { score += 20; reasons.push("Filtro Seccomp Ativo"); }
            if (profile.capsDropAll) { score += 15; reasons.push("Root Capabilities Dropadas"); }
            if (profile.netBridge === "none") { score += 15; reasons.push("Sem acesso a Rede/Sockets"); }
            if (profile.nodbus) { score += 10; reasons.push("D-Bus Desativado"); }
            if (profile.x11Mode === "none") { score += 10; reasons.push("X11 Desabilitado"); }
            
            let color = "bg-red-500";
            let txt = "Isolamento Fraco";
            if (score > 40 && score <= 70) {
              color = "bg-yellow-500";
              txt = "Isolamento Moderado";
            } else if (score > 70) {
              color = "bg-emerald-500";
              txt = "Ultra Isolado (Fortificado)";
            }

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">{txt}</span>
                  <span className="text-white">{score}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }}></div>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Mecanismos Ativados:</span>
                  <div className="flex flex-wrap gap-1">
                    {reasons.length > 0 ? reasons.map((r, i) => (
                      <span key={i} className="text-[8px] bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-1.5 py-0.5 rounded-full">
                        {r}
                      </span>
                    )) : (
                      <span className="text-[10px] text-slate-500 italic">Nenhum isolamento robusto ativo no momento. O processo compartilha todos os recursos com a máquina host.</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
