/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { FirejailProfile } from "../types";
import { 
  Globe, 
  Video, 
  DownloadCloud, 
  Terminal, 
  MessageSquare, 
  FileText, 
  Plus, 
  Trash2, 
  Layers,
  Sparkles,
  Upload,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface ProfileFileListProps {
  customProfiles: FirejailProfile[];
  presetProfiles: FirejailProfile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onAddNewProfile: () => void;
  onClonePreset: (preset: FirejailProfile) => void;
  onImportProfile: (fileName: string, content: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const getIconByName = (name?: string) => {
  switch (name) {
    case "Globe": return <Globe className="w-4 h-4 text-emerald-400 font-bold" />;
    case "Video": return <Video className="w-4 h-4 text-emerald-400 font-bold" />;
    case "DownloadCloud": return <DownloadCloud className="w-4 h-4 text-emerald-400" />;
    case "Terminal": return <Terminal className="w-4 h-4 text-emerald-400 font-mono" />;
    case "MessageSquare": return <MessageSquare className="w-4 h-4 text-emerald-400" />;
    default: return <FileText className="w-4 h-4 text-emerald-400" />;
  }
};

export default function ProfileFileList({
  customProfiles,
  presetProfiles,
  selectedProfileId,
  onSelectProfile,
  onDeleteProfile,
  onAddNewProfile,
  onClonePreset,
  onImportProfile,
  isCollapsed,
  onToggleCollapse
}: ProfileFileListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onImportProfile(file.name, text);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isCollapsed) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 shadow-xl flex flex-col items-center gap-4 h-full min-h-[400px]" id="profile-manager-pane-collapsed">
        {/* Toggle trigger to expand */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 bg-slate-950 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded border border-slate-800 transition shadow cursor-pointer"
          title="Expandir barra lateral"
          id="btn-expand-sidebar"
        >
          <ChevronRight className="w-4 h-4 font-bold" />
        </button>

        <div className="w-full h-px bg-slate-800" />

        {/* Plus quick shortcut */}
        <button
          type="button"
          onClick={onAddNewProfile}
          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center transition cursor-pointer shadow hover:scale-105"
          title="Novo Perfil"
          id="btn-quick-new-profile"
        >
          <Plus className="w-3.5 h-3.5 font-bold" />
        </button>

        <div className="flex-1 w-full space-y-3 overflow-y-auto pr-0.5 scrollbar-none flex flex-col items-center">
          <span className="text-[7.5px] uppercase font-bold text-slate-500 tracking-wider text-center block">Perfis</span>
          {customProfiles.map((p) => {
            const isActive = p.id === selectedProfileId;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProfile(p.id)}
                className={`p-2 rounded border transition-all hover:scale-105 flex items-center justify-center cursor-pointer ${
                  isActive 
                    ? "bg-slate-850 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/20" 
                    : "bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
                title={`${p.name} (app: ${p.program || "não definido"})`}
                id={`profile-card-collapsed-${p.id}`}
              >
                {getIconByName(p.icon)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl flex flex-col h-full" id="profile-manager-pane">
      {/* Upper header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded transition cursor-pointer shrink-0"
            title="Recolher Painel Lateral"
            id="btn-collapse-sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide animate-fade-in truncate">
              <Layers className="w-3.5 h-3.5 text-emerald-400 font-bold shrink-0" />
              Perfis
            </h2>
            <p className="text-[10px] text-slate-450 mt-0.5 truncate">Permissões de sandbox.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-755 font-medium text-[11px] text-slate-200 rounded flex items-center gap-1 transition-colors cursor-pointer"
            title="Importar Arquivo .profile"
            id="btn-import-profile"
          >
            <Upload className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline lg:inline xl:inline">Importar</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".profile,text/plain"
            className="hidden"
          />
          <button
            type="button"
            onClick={onAddNewProfile}
            className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 font-medium text-[11px] text-white rounded flex items-center gap-1 transition-colors cursor-pointer text-center"
            title="Nova Configuração"
            id="btn-new-profile"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo</span>
          </button>
        </div>
      </div>

      {/* Custom Profiles list */}
      <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin">
        <div>
          <h3 className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2">Meus Perfis</h3>
          
          <div className="space-y-1.5">
            {customProfiles.map((p) => {
              const isActive = p.id === selectedProfileId;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProfile(p.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded border cursor-pointer transition-all ${
                    isActive 
                      ? "bg-slate-800 border-l-2 border-l-emerald-500 border-slate-750 text-white" 
                      : "bg-slate-950/40 border-slate-850/60 text-slate-300 hover:bg-slate-800/40 hover:text-white"
                  }`}
                  id={`profile-card-${p.id}`}
                >
                  <div className="flex items-center gap-2.5 pr-8 min-w-0">
                    <span className="p-1 rounded bg-slate-900 border border-slate-800 shrink-0">
                      {getIconByName(p.icon)}
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs block truncate">{p.name}</span>
                      <span className="font-mono text-[9px] text-slate-500 block truncate">app: {p.program || "não definido"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProfile(p.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-900 border border-transparent hover:border-slate-850 text-slate-500 hover:text-rose-400 rounded transition absolute right-2 top-2"
                    title="Excluir Perfil"
                    id={`btn-delete-profile-${p.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {customProfiles.length === 0 && (
              <div className="border border-dashed border-slate-800 bg-slate-950/20 p-5 rounded text-center">
                <span className="text-slate-500 text-xs italic block mb-2">Sem perfis customizados</span>
                <button
                  type="button"
                  onClick={onAddNewProfile}
                  className="mx-auto text-[10px] text-emerald-400 font-semibold hover:underline flex items-center gap-1 justify-center"
                >
                  <Plus className="w-3 h-3" /> Criar perfil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* System presets builder */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Presets Disponíveis</h3>
            <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Auto Clone
            </span>
          </div>

          <div className="space-y-1.5">
            {presetProfiles.map((p) => {
              return (
                <div
                  key={p.id}
                  onClick={() => onClonePreset(p)}
                  className="group flex flex-col p-2.5 rounded border bg-slate-950/60 border-slate-850/80 hover:bg-slate-800/35 hover:border-slate-700 cursor-pointer transition text-slate-300"
                  id={`preset-card-${p.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="p-1 bg-slate-900 border border-slate-800 rounded shrink-0">
                        {getIconByName(p.icon)}
                      </span>
                      <span className="font-semibold text-xs group-hover:text-emerald-400 transition truncate">{p.name}</span>
                    </div>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-medium uppercase font-mono shrink-0">
                      Pronto
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 leading-relaxed">
                    {p.description}
                  </p>
                  
                  <div className="mt-2 pt-1 border-t border-slate-900/50 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span className="truncate">bin: {p.program}</span>
                    <span className="text-emerald-500 group-hover:translate-x-0.5 transition-transform shrink-0">Clonar &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2">
        <div className="p-2.5 bg-slate-950 text-[10px] text-slate-450 rounded border border-slate-850/65">
          <span className="font-bold text-slate-300 block mb-0.5">💡 Ambiente Isolado:</span>
          Perfis restringem o escopo de execução usando Namespaces de CPU, rede e isolando subpastas sensíveis do host local.
        </div>
      </div>
    </div>
  );
}
