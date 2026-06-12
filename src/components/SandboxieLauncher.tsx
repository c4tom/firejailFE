/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Network, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Zap, 
  FileText, 
  Globe, 
  Folder, 
  Tv, 
  FileCode, 
  HardDrive, 
  Play, 
  Pause, 
  Trash2, 
  Search, 
  RefreshCw, 
  Home, 
  Sliders, 
  VolumeX, 
  VideoOff, 
  EyeOff, 
  ArrowRight,
  Monitor,
  Activity,
  FolderOpen,
  AppWindow,
  LayoutGrid,
  ChevronRight
} from "lucide-react";
import { FirejailProfile, RunningSandbox, LogEntry } from "../types";

interface SandboxieLauncherProps {
  activeSandboxes: RunningSandbox[];
  onStartSandboxWithProfile: (profile: FirejailProfile) => void;
  onTerminateSandbox: (pid: number) => void;
  onAddLog: (log: LogEntry) => void;
  onSwitchTab: (tab: any) => void;
}

// Simulated Windows/Cinnamon Applications categorized
interface InstalledApp {
  id: string;
  name: string;
  binary: string;
  description: string;
  category: "internet" | "development" | "office" | "multimedia" | "accessories";
  iconName: string;
  defaultArgs?: string;
  recommendedBoxId?: string;
}

const INSTALLED_APPS_DB: InstalledApp[] = [
  {
    id: "app-firefox",
    name: "Firefox Browser",
    binary: "firefox",
    description: "Navegador web de código aberto rápido, privativo e focado em segurança.",
    category: "internet",
    iconName: "Globe",
    defaultArgs: "--private-window https://security.linux.org",
    recommendedBoxId: "box-hardened"
  },
  {
    id: "app-chrome",
    name: "Google Chrome",
    binary: "google-chrome",
    description: "Navegador de internet do Google rodando sob regras sandbox estritas.",
    category: "internet",
    iconName: "Globe",
    defaultArgs: "--new-window https://portal.banco.com",
    recommendedBoxId: "box-hardened"
  },
  {
    id: "app-vscode",
    name: "Visual Studio Code",
    binary: "code",
    description: "Editor de código para desenvolvimento Web, scripts Bash e desenvolvimento Linux.",
    category: "development",
    iconName: "FileCode",
    defaultArgs: "--disable-gpu",
    recommendedBoxId: "box-default"
  },
  {
    id: "app-npm",
    name: "NPM Package Manager",
    binary: "npm",
    description: "Instalação e execução de scripts de terceiros de repositórios públicos.",
    category: "development",
    iconName: "Terminal",
    defaultArgs: "install --production",
    recommendedBoxId: "box-nonet"
  },
  {
    id: "app-vlc",
    name: "VLC Media Player",
    binary: "vlc",
    description: "Reprodutor de áudio e vídeo versátil. Isole codecs exóticos suspeitos.",
    category: "multimedia",
    iconName: "Tv",
    recommendedBoxId: "box-media"
  },
  {
    id: "app-gimp",
    name: "GIMP Image Editor",
    binary: "gimp",
    description: "Software de manipulação de imagens avançado. Bloqueie acesso a rede.",
    category: "multimedia",
    iconName: "LayoutGrid",
    recommendedBoxId: "box-nonet"
  },
  {
    id: "app-evince",
    name: "Evince PDF Reader",
    binary: "evince",
    description: "Visualizador leve de documentos e arquivos PDF de procedência desconhecida.",
    category: "office",
    iconName: "FileText",
    recommendedBoxId: "box-media"
  },
  {
    id: "app-redis",
    name: "Redis Server",
    binary: "redis-server",
    description: "Armazenamento chave-valor de alta performance rodando como processo daemon.",
    category: "accessories",
    iconName: "HardDrive",
    recommendedBoxId: "box-nonet"
  },
  {
    id: "app-python",
    name: "Python Runner",
    binary: "python3",
    description: "Execução rápida de utilitários locais ou microsserviços de IA locais.",
    category: "development",
    iconName: "Terminal",
    recommendedBoxId: "box-default"
  }
];

export default function SandboxieLauncher({
  activeSandboxes,
  onStartSandboxWithProfile,
  onTerminateSandbox,
  onAddLog,
  onSwitchTab
}: SandboxieLauncherProps) {
  // Detector Simulation States
  const [detectState, setDetectState] = useState<"idle" | "detecting" | "completed">("idle");
  const [detectedCount, setDetectedCount] = useState(0);
  const [scanStep, setScanStep] = useState("");
  const [detectedList, setDetectedList] = useState<InstalledApp[]>([]);

  // Sandboxie Compartment Configuration list
  const [compartments, setCompartments] = useState([
    {
      id: "box-default",
      name: "DefaultBox",
      description: "Jaula equilibrada. Ideal para softwares do cotidiano com rede ativada.",
      tag: "Padrão",
      color: "border-emerald-500",
      bgBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      settings: { seccompEnabled: true, privateTmp: true }
    },
    {
      id: "box-hardened",
      name: "HardenedBox",
      description: "Controle restrito completo. Sem root, sem privilégios extras e home limpa isolada.",
      tag: "Ultra Seguro",
      color: "border-cyan-500",
      bgBadge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      settings: { seccompEnabled: true, noroot: true, nonewprivs: true, privateHome: true, privateTmp: true }
    },
    {
      id: "box-nonet",
      name: "NoNetBox",
      description: "Totalmente offline. Namespace de rede cortada (--net=none) previne escape de dados.",
      tag: "Sem Internet",
      color: "border-purple-500",
      bgBadge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      settings: { seccompEnabled: true, netBridge: "none", ipAddress: "none", privateTmp: true }
    },
    {
      id: "box-media",
      name: "MediaJailBox",
      description: "Periféricos e aceleração 3D desativados. Sem acesso a áudio, vídeo ou GPU de renderização.",
      tag: "Isolamento Multimídia",
      color: "border-amber-500",
      bgBadge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      settings: { seccompEnabled: true, noSound: true, noVideo: true, no3d: true, privateTmp: true }
    }
  ]);

  // Sidebar category/Cinnamon state
  const [selectedCategory, setSelectedCategory] = useState<"all" | "internet" | "development" | "office" | "multimedia" | "accessories">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBoxId, setSelectedBoxId] = useState("box-default");
  
  // Custom execution state for quick parameters override
  const [activePresetBox, setActivePresetBox] = useState<string | null>(null);

  // Trigger simulated detector on component mount
  useEffect(() => {
    if (detectState === "idle") {
      setDetectState("detecting");
      const paths = [
        "Escaneando /usr/bin/firefox...",
        "Validando assinaturas em /usr/bin/google-chrome...",
        "Procurando runtime em /usr/local/bin/code...",
        "Interrogando bibliotecas seccomp em /bin/evince...",
        "Verificando integridade em /usr/bin/redis-server...",
        "Finalizando detecção no kernel host..."
      ];
      
      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < paths.length) {
          setScanStep(paths[stepIdx]);
          stepIdx++;
        } else {
          clearInterval(interval);
          setDetectState("completed");
          setDetectedList(INSTALLED_APPS_DB);
          setDetectedCount(INSTALLED_APPS_DB.length);
          
          onAddLog({
            id: `audit-launch-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            pid: 1201,
            sandboxName: "sys-audit",
            type: "INFO",
            message: `🔍 Auto-Detetor detectou ${INSTALLED_APPS_DB.length} aplicativos locais compatíveis com compartimentos Firejail/Sandboxie.`,
            severity: "low"
          });
        }
      }, 550);
      return () => clearInterval(interval);
    }
  }, []);

  const handleRunAppInBox = (app: InstalledApp, boxId: string) => {
    const box = compartments.find(b => b.id === boxId);
    if (!box) return;

    // Create a dynamic Firejail profile based on sandbox selected
    const mockProfileId = `profile-launcher-${app.id}-${boxId}-${Date.now()}`;
    const dynamicProfile: FirejailProfile = {
      id: mockProfileId,
      name: `${app.name} (${box.name})`,
      description: `Executado diretamente do Cinnamon App Menu através do compartimento de segurança: '${box.name}'.`,
      program: app.binary,
      arguments: app.defaultArgs || "",
      icon: app.iconName,
      isPreset: false,
      ...box.settings
    };

    onStartSandboxWithProfile(dynamicProfile);

    onAddLog({
      id: `launch-success-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      pid: 2400,
      sandboxName: "sys-loader",
      type: "INFO",
      message: `📥 Aplicativo '${app.name}' foi lançado na jaula '${box.name}'. Todas as regras sandbox estão ativas sob o subsistema SUID do Firejail.`,
      severity: "medium"
    });
  };

  const handleWipeCompartment = (boxName: string) => {
    // Collect running sandboxes from this box
    const targetedPids = activeSandboxes
      .filter(s => s.name.includes(`(${boxName})`))
      .map(s => s.pid);

    targetedPids.forEach(pid => {
      onTerminateSandbox(pid);
    });

    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    onAddLog({
      id: `wipe-${Date.now()}`,
      timestamp: stamp,
      pid: 1201,
      sandboxName: "sys-audit",
      type: "INFO",
      message: `🧼 Operação Limpar (Wipe Sandbox) executada na jaula '${boxName}'. Todos os arquivos residuais criados em /tmp e subpastas de cache foram expurgados permanentemente.`,
      severity: "medium"
    });
  };

  // Filter apps list
  const filteredApps = detectedList.filter(app => {
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.binary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: "all", label: "Todos os Apps" },
    { id: "internet", label: "Internet & Redes" },
    { id: "development", label: "Desenvolvimento" },
    { id: "multimedia", label: "Multimídia & Som" },
    { id: "office", label: "Escritório & PDF" },
    { id: "accessories", label: "Acessórios" }
  ];

  return (
    <div className="space-y-6" id="sandboxie-cinnamon-module">
      
      {/* Intro Header banner */}
      <div className="bg-gradient-to-r from-cyan-950/30 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 animate-fade-in">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
              Windows Sandboxie-Plus & Linux Mint/Cinnamon Integrado
            </span>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Monitor className="w-5 h-5 text-cyan-400 animate-pulse" />
              DESKTOP MATRIX DE ISOLAMENTO
            </h2>
            <p className="text-xs text-slate-450 max-w-3xl leading-relaxed">
              Inicie qualquer executável de seu computador diretamente dentro de um dos **4 Compartimentos (Boxes) Sandboxie**
              pré-configurados com políticas restritas exclusivas de segurança do kernel Linux.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setDetectState("idle");
                setDetectedList([]);
              }}
              disabled={detectState === "detecting"}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${detectState === "detecting" ? "animate-spin" : ""}`} />
              Re-detectar Apps
            </button>
            <button
              onClick={() => onSwitchTab("monitor")}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-cyan-400 border border-cyan-500/20 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Ver Simulador
            </button>
          </div>
        </div>
      </div>

      {/* Main Sandboxie Box and Start Menu Container split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Cinammon/Linux Mint Desktop Start Menu (7 columns) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Start Menu Header */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-3 border-b border-slate-805 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-250 font-mono tracking-tight flex items-center gap-1">
                  <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                  MENU INICIAR : CINNAMON DESKTOP
                </span>
              </div>
              <div className="relative w-44">
                <input
                  type="text"
                  placeholder="Pesquisar app..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-[10.5px] text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
                />
                <Search className="w-3 h-3 text-slate-500 absolute right-2 top-2" />
              </div>
            </div>

            {/* Application detector scanner loading bar if actively executing search */}
            {detectState === "detecting" && (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 flex-1 bg-slate-950/20">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin" />
                <div className="space-y-1.5 text-center">
                  <p className="text-xs font-bold text-white tracking-widest uppercase">Escaneando sistema operacional...</p>
                  <p className="text-[10px] text-cyan-400 font-mono italic">{scanStep}</p>
                </div>
                <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 animate-progress" style={{ width: "70%" }} />
                </div>
              </div>
            )}

            {/* Complete Cinnamon Grid layout */}
            {detectState !== "detecting" && (
              <div className="flex flex-1 overflow-hidden">
                {/* Cinnamon Mint Left Sidebar Categories list */}
                <div className="w-40 bg-slate-950 border-r border-slate-850 p-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-black px-2 block mb-2">Categorias</span>
                    {categories.map((cat) => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id as any)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                            isActive
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                          }`}
                        >
                          <span>{cat.label}</span>
                          {selectedCategory === cat.id && <ChevronRight className="w-3 h-3 text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* System properties foot */}
                  <div className="p-2 border-t border-slate-850 bg-slate-900/40 rounded-lg text-[9.5px] text-slate-500 font-mono">
                    Host: Linux x86_64<br/>
                    Status: Integrado
                  </div>
                </div>

                {/* Main Apps List Area */}
                <div className="flex-1 p-3 overflow-y-auto bg-slate-950/20 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-850">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      {selectedCategory.toUpperCase()} ({filteredApps.length} encontrados)
                    </span>
                    <span className="text-[10px] text-slate-500">Destino: <strong className="text-cyan-450 font-mono">{selectedBoxId}</strong></span>
                  </div>

                  {filteredApps.length === 0 ? (
                    <div className="text-center p-12 text-slate-500 text-xs">
                      Nenhum aplicativo correspondente encontrado para os termos informados.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredApps.map((app) => {
                        const recBox = compartments.find(b => b.id === app.recommendedBoxId);
                        
                        return (
                          <div 
                            key={app.id} 
                            className="bg-slate-900 border border-slate-850 rounded-xl p-3 hover:border-cyan-500/30 transition-all hover:bg-slate-850/30 flex flex-col justify-between group h-[135px]"
                          >
                            <div className="space-y-1">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-1 bg-slate-950 border border-slate-800 rounded group-hover:border-cyan-500/30 group-hover:text-cyan-400 text-slate-300">
                                    {app.iconName === "Globe" ? <Globe className="w-4 h-4 text-emerald-400" /> : 
                                     app.iconName === "FileCode" ? <FileCode className="w-4 h-4 text-cyan-400" /> : 
                                     app.iconName === "Tv" ? <Tv className="w-4 h-4 text-amber-400" /> : 
                                     app.iconName === "FileText" ? <FileText className="w-4 h-4 text-purple-400" /> : 
                                     app.iconName === "HardDrive" ? <HardDrive className="w-4 h-4 text-blue-400" /> : 
                                     <Terminal className="w-4 h-4 text-teal-400" />}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-white tracking-tight">{app.name}</h4>
                                    <span className="text-[9px] font-mono text-slate-500">/usr/bin/{app.binary}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[10.5px] text-slate-400 leading-tight line-clamp-2">
                                {app.description}
                              </p>
                            </div>

                            {/* Actions bar inside start menu item */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-850/60 mt-1">
                              {recBox && (
                                <span className="text-[9px] text-slate-500 font-medium">
                                  Sugerido: <span className="text-cyan-450 underline">{recBox.name}</span>
                                </span>
                              )}
                              
                              <button
                                onClick={() => handleRunAppInBox(app, selectedBoxId)}
                                className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                              >
                                <Play className="w-3 h-3 text-white fill-white" />
                                Executar na {selectedBoxId === "box-default" ? "DefaultBox" : selectedBoxId === "box-hardened" ? "Hardened" : selectedBoxId === "box-nonet" ? "NoNet" : "MediaBox"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Quick tips about Cinnamon Launcher and Sandboxie compatibility */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Como Funciona a Integração Linux Mint + Sandboxie-Plus?</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cada aplicativo listado no menu esquerdo representa um software real detectado no repositório local do Host. Ao clicar em **Executar**, o painel clona e virtualiza em frações de segundos um arquivo de configuração temporário, unindo os escopos de Seccomp do kernel, Isolamentos de Disco de cada Compartimento e inicia a rotina no simulador.
              </p>
            </div>
          </div>

        </div>

        {/* Right Hand: Sandboxie-Plus Compartment (Box) Controller Manager (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 flex flex-col h-[520px] justify-between">
            
            <div className="space-y-3">
              <div className="pb-2 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    COMPARTIMENTOS SANDBOXIE (BOX)
                  </h3>
                </div>
                <span className="text-[9.5px] font-mono text-cyan-400 uppercase">Sandboxie Engine v0.96</span>
              </div>

              <p className="text-[10.5px] text-slate-450 leading-relaxed">
                Selecione o compartimento ativo para receber os novos aplicativos executados do menu ao lado:
              </p>

              {/* Selector layout for boxes */}
              <div className="space-y-2">
                {compartments.map((box) => {
                  const isSelected = selectedBoxId === box.id;
                  
                  // Filter out active processes running under this compartment name template
                  const currentRuns = activeSandboxes.filter(s => 
                    s.name.includes(`(${box.name})`) && s.status !== "terminated"
                  );

                  return (
                    <div
                      key={box.id}
                      onClick={() => setSelectedBoxId(box.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-slate-950 to-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/20"
                          : "bg-slate-950/40 border-slate-850/70 hover:bg-slate-900 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <h4 className="text-xs font-bold text-white">{box.name}</h4>
                            <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border ${box.bgBadge}`}>
                              {box.tag}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 leading-tight">
                            {box.description}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-3.5 h-3.5 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          </div>
                        )}
                      </div>

                      {/* Display compartment statistics and cleanup (Wipe Sandboxie Box) */}
                      <div className="mt-2 pt-2 border-t border-slate-850/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-mono">
                          Processos: <strong className="text-slate-350">{currentRuns.length} ativados</strong>
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWipeCompartment(box.name);
                            }}
                            className="px-2 py-0.5 hover:bg-amber-500/15 hover:text-amber-400 hover:border-amber-500/20 text-slate-450 border border-slate-800 rounded font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Deletar arquivos temporários gerados por programas rodando nesta sandbox"
                          >
                            <Trash2 className="w-3 h-3" />
                            Esvaziar Box
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick monitor inside Sandboxie view showing currently active applications inside selected Box */}
            <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Atividade Ativa na Sandbox
                </span>
                <span className="text-[9px] font-mono text-slate-500">Filtrado por Box</span>
              </div>

              {activeSandboxes.filter(s => s.status !== "terminated").length === 0 ? (
                <p className="text-[10.5px] text-slate-500 italic py-4 text-center">
                  Zero processos ativos no momento. Use o Cinnamon Menu à esquerda para iniciar o isolamento.
                </p>
              ) : (
                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                  {activeSandboxes
                    .filter(s => s.status !== "terminated")
                    .map((s) => (
                      <div key={s.pid} className="bg-slate-900 border border-slate-850 rounded p-1.5 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold text-white">{s.name}</span>
                          <span className="text-[8.5px] font-mono bg-slate-850 px-1 py-0.2 px-1 rounded text-cyan-400">PID {s.pid}</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
                          <span>RAM: {Math.floor(s.memoryUsage)}MB</span>
                          <button
                            onClick={() => onTerminateSandbox(s.pid)}
                            className="p-1 hover:text-red-400 hover:bg-slate-800 transition rounded"
                            title="Finalizar processo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

          </div>

          {/* SCRIPTED/SANDBOXIE INFO CARD */}
          <div className="bg-gradient-to-br from-slate-900 to-cyan-950/25 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 text-[11px] leading-relaxed">
              <h4 className="text-xs font-bold text-white">Consistência de Isolamento Termporário</h4>
              <p className="text-slate-400">
                Clicar em <strong>Esvaziar Box</strong> simula o recurso exclusivo do Windows Sandboxie-Plus. Ao encerrar os processos ativos, o Firejail joga fora a partição transient <code>tmpfs</code>, evitando downloads maliciosos de se fixarem permanentemente no seu disco rígido real.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
