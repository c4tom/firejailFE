/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { FirejailProfile, RunningSandbox, LogEntry } from "../types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Play, 
  Square, 
  Trash2, 
  Activity, 
  Terminal, 
  ShieldAlert, 
  Search, 
  Wifi, 
  Database, 
  Info,
  Pause,
  RefreshCw
} from "lucide-react";

interface LogsMonitorProps {
  activeSandboxes: RunningSandbox[];
  onTerminateSandbox: (pid: number) => void;
  onPauseSandbox: (pid: number) => void;
  onResumeSandbox: (pid: number) => void;
  logs: LogEntry[];
  onClearLogs: () => void;
  onAddLog: (log: LogEntry) => void;
  selectedProfile?: FirejailProfile;
  onStartWithProfile: (profile: FirejailProfile) => void;
  presetProfiles: FirejailProfile[];
}

export default function LogsMonitor({
  activeSandboxes,
  onTerminateSandbox,
  onPauseSandbox,
  onResumeSandbox,
  logs,
  onClearLogs,
  onAddLog,
  selectedProfile,
  onStartWithProfile,
  presetProfiles
}: LogsMonitorProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>(() => {
    // initialize history data
    const list = [];
    for (let i = 10; i >= 0; i--) {
      list.push({
        time: `${i}s atrás`,
        cpu: 10 + Math.random() * 20,
        memory: 120 + Math.random() * 40,
        netRx: 5 + Math.random() * 15,
        blocked: 0
      });
    }
    return list;
  });

  const lastLogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic for terminal
  useEffect(() => {
    if (lastLogRef.current) {
      lastLogRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Telemetry updates simulation
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeSandboxes.length === 0) return;

      // Calculate aggregated metrics
      const avgCpu = activeSandboxes.reduce((acc, s) => acc + (s.status === "running" ? s.cpuUsage : 0), 0);
      const totalMem = activeSandboxes.reduce((acc, s) => acc + (s.status === "running" ? s.memoryUsage : 0), 0);
      const totalRx = activeSandboxes.reduce((acc, s) => acc + (s.status === "running" ? s.networkRx : 0), 0);
      const totalBlocked = activeSandboxes.reduce((acc, s) => acc + s.blockedSyscallsCount + s.blockedFilesCount, 0);

      setTelemetryHistory(prev => {
        const next = [...prev.slice(1)];
        next.push({
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          cpu: Number(avgCpu.toFixed(1)),
          memory: Math.round(totalMem),
          netRx: Number(totalRx.toFixed(1)),
          blocked: totalBlocked
        });
        return next;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [activeSandboxes]);

  // Quick launch helper
  const handleLaunchPreset = (id: string) => {
    const preset = presetProfiles.find(p => p.id === id);
    if (preset) {
      onStartWithProfile(preset);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterType !== "ALL" && log.type !== filterType) return false;
    if (searchTerm.trim() === "") return true;
    return log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
           log.sandboxName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div id="logs-monitor-wrapper" className="space-y-6">
      {/* Upper Active Containers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Sandboxes pane */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Ambientes Sandbox Ativos (Simulado)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Sandboxes atualmente rodando sob restrições do Firejail.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-slate-950 px-2 py-1 border border-slate-800 rounded text-slate-400 font-semibold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeSandboxes.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`}></span>
                  {activeSandboxes.length} {activeSandboxes.length === 1 ? "Ativo" : "Ativos"}
                </span>
              </div>
            </div>

            {/* List of active sandboxes */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {activeSandboxes.map((s) => {
                const isPaused = s.status === "paused";
                return (
                  <div key={s.pid} className="p-3.5 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between gap-4" id={`sandbox-node-${s.pid}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${isPaused ? "bg-yellow-500" : "bg-emerald-500 animate-pulse"}`}></span>
                        <span className="font-bold text-xs text-white truncate max-w-[150px]">{s.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">PID: {s.pid}</span>
                        <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">
                          {s.program}
                        </span>
                      </div>

                      {/* Spark Stats */}
                      <div className="grid grid-cols-4 gap-2 mt-2.5 text-[10px] text-slate-400 font-mono">
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase">CPU:</span>
                          <span className="text-slate-200">{isPaused ? "0%" : `${s.cpuUsage.toFixed(1)}%`}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase">Memória:</span>
                          <span className="text-slate-200">{isPaused ? "2.4 MB" : `${s.memoryUsage.toFixed(0)} MB`}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase">Banda Rx/Tx:</span>
                          <span className="text-slate-200">{isPaused ? "0 KB/s" : `${s.networkRx.toFixed(1)}K/${s.networkTx.toFixed(1)}K`}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-red-400 uppercase font-bold flex items-center gap-0.5">
                            Bloqueios:
                          </span>
                          <span className="text-red-400 font-bold">{s.blockedSyscallsCount + s.blockedFilesCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons on running process */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {isPaused ? (
                        <button
                          type="button"
                          onClick={() => onResumeSandbox(s.pid)}
                          className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:text-emerald-400 rounded text-xs transition flex items-center gap-1"
                          title="Retomar Execução"
                        >
                          <Play className="w-3 h-3 text-emerald-400 fill-current" />
                          <span className="text-[10px] font-bold">Retomar</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onPauseSandbox(s.pid)}
                          className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:text-yellow-400 rounded text-xs transition flex items-center gap-1"
                          title="Pausar Sandbox"
                        >
                          <Pause className="w-3 h-3 text-yellow-500" />
                          <span className="text-[10px] font-bold">Pausar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onTerminateSandbox(s.pid)}
                        className="p-1 px-2 bg-red-950/40 border border-red-900/30 text-red-400 hover:bg-red-500 hover:text-black rounded text-[10px] font-bold transition flex items-center gap-1"
                        title="Matar Processo Sandbox"
                        id={`btn-terminate-sandbox-${s.pid}`}
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Matar</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {activeSandboxes.length === 0 && (
                <div className="border border-dashed border-slate-800 p-8 rounded-lg text-center bg-slate-950/20">
                  <Terminal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <span className="text-slate-500 text-xs block">Nenhuma sandbox rodando ativamente</span>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto">
                    Inicie uma sandbox de teste no construtor de perfis acima ou clique em uma das configurações recomendadas abaixo para iniciar simulações de log de isolamento.
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => handleLaunchPreset("preset-firefox")}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded font-semibold text-xs text-slate-300 transition"
                    >
                      🚀 Testar Firefox
                    </button>
                    <button
                      onClick={() => handleLaunchPreset("preset-untrusted")}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded font-semibold text-xs text-slate-300 transition"
                    >
                      🐍 Testar Script Python Suspeito
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {activeSandboxes.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-slate-800/60 text-[10px] text-slate-500 leading-relaxed font-mono">
              ⚡ Você pode acoplar o terminal via console Linux utilizando: <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400">firejail --join={activeSandboxes[0].pid}</code>
            </div>
          )}
        </div>

        {/* Aggregate Telemetry chart */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Recursos de Hardware Consumidos (Total)
            </h3>
            <span className="text-[10px] text-slate-400 block mb-4">Atualizado em tempo real de acordo com as restrições e tráfego.</span>

            <div className="w-full h-36 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="time" stroke="#71717a" fontSize={8} />
                  <YAxis stroke="#71717a" fontSize={8} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", fontSize: 10 }} />
                  <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#10b981" fillOpacity={1} fill="url(#colorCpu)" />
                  <Area type="monotone" dataKey="memory" name="Memória (MB)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMem)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded border border-slate-850">
              <Wifi className="w-3.5 h-3.5 text-blue-400" />
              <div>
                <span className="block text-[8px] text-slate-500 uppercase font-mono">Banda Passante</span>
                <span className="font-bold text-slate-200">
                  {activeSandboxes.reduce((acc, s) => acc + (s.status === "running" ? s.networkRx + s.networkTx : 0), 0).toFixed(1)} KB/s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded border border-slate-850">
              <Database className="w-3.5 h-3.5 text-red-400" />
              <div>
                <span className="block text-[8px] text-red-500 uppercase font-mono font-bold">Tentativas de Escape</span>
                <span className="font-bold text-red-400">
                  {activeSandboxes.reduce((acc, s) => acc + s.blockedSyscallsCount + s.blockedFilesCount, 0)} Bloqueadas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time color-coded Streaming Terminal Logs */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-5 flex flex-col" id="live-terminal-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Console de Logs em Tempo Real (Firejail Audit Stream)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Eventos do sistema detectados e interceptados por restrições Namespace e Seccomp.</p>
            </div>
          </div>

          {/* Filtering and cleaning logs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filtrar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-905 border border-slate-800 rounded px-2.5 py-1 pl-8 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 sm:w-48 placeholder-slate-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
            >
              <option value="ALL">Todos Eventos</option>
              <option value="BLOCK_FILE">Arquivo Bloqueado</option>
              <option value="BLOCK_SYSCALL">Seccomp Interceptado</option>
              <option value="DNS">DNS Log</option>
              <option value="NETWORK">Tráfego de Rede</option>
              <option value="INFO">Informação Geral</option>
            </select>

            <button
              onClick={onClearLogs}
              className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded font-semibold transition flex items-center gap-1"
              id="btn-clear-logs"
            >
              Limpar Console
            </button>
          </div>
        </div>

        {/* The Live Terminal Screen */}
        <div className="bg-black/95 rounded-lg border border-slate-900 p-4 font-mono text-xs leading-relaxed max-h-[350px] min-h-[220px] overflow-y-auto scrollbar-thin space-y-1.5 select-text shadow-inner">
          {filteredLogs.map((log) => {
            let badgeColor = "text-slate-500 bg-slate-900/40 border border-slate-800";
            let msgColor = "text-slate-300";
            
            if (log.type === "BLOCK_FILE") {
              badgeColor = "text-red-400 bg-red-950/20 border border-red-900/30 font-bold";
              msgColor = "text-red-300 font-semibold";
            } else if (log.type === "BLOCK_SYSCALL") {
              badgeColor = "text-amber-400 bg-amber-950/20 border border-amber-900/30 font-bold animate-pulse";
              msgColor = "text-amber-300 font-semibold";
            } else if (log.type === "DNS") {
              badgeColor = "text-blue-400 bg-blue-950/20 border border-blue-900/20";
              msgColor = "text-blue-200";
            } else if (log.type === "NETWORK") {
              badgeColor = "text-emerald-400 bg-emerald-950/20 border border-emerald-900/20";
              msgColor = "text-emerald-300";
            } else if (log.type === "INFO") {
              badgeColor = "text-slate-300 bg-slate-900 border border-slate-800";
              msgColor = "text-slate-400";
            }

            return (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-start gap-1 p-1 hover:bg-slate-900/50 rounded transition">
                <span className="text-slate-600 flex-shrink-0">[{log.timestamp}]</span>
                <span className="text-slate-500 font-bold flex-shrink-0 w-24 truncate">[{log.sandboxName}]</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${badgeColor} inline-block leading-none`}>
                  {log.type}
                </span>
                <span className={`flex-1 break-words pl-1.5 ${msgColor}`}>
                  {log.message}
                </span>
              </div>
            );
          })}

          <div ref={lastLogRef} />

          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-center gap-1.5">
              <Terminal className="w-5 h-5 text-slate-700 font-bold" />
              <span>Nenhum log corresponde ao filtro atual.</span>
              <span className="text-[10px] text-slate-650 font-mono">Inicie e execute um perfil para ver as interceptações sandbox ao vivo</span>
            </div>
          )}
        </div>

        <div className="mt-3 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit-Sec ativo: Seccomp e Caps listados reportam alertas visíveis imediatamente.</span>
          </div>
          <span className="font-mono text-[9px] text-slate-500">
            Fila de Logs: {logs.length}/100 entradas max
          </span>
        </div>
      </div>
    </div>
  );
}
