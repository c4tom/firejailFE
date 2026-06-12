/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, Search, Info, CheckCircle, AlertTriangle, Cpu } from "lucide-react";

interface SyscallDefinition {
  name: string;
  group: string;
  description: string;
  severity: "high" | "medium" | "low";
  firejailDefaultBlocked: boolean;
}

const SYSCALL_REGISTRY: SyscallDefinition[] = [
  { name: "reboot", group: "@reboot", description: "Reinicializa o sistema ou altera as chaves de reboot.", severity: "high", firejailDefaultBlocked: true },
  { name: "mount", group: "@mount", description: "Monta sistemas de arquivos, alterando a hierarquia de discos.", severity: "high", firejailDefaultBlocked: true },
  { name: "umount2", group: "@mount", description: "Desmonta sistemas de arquivos em vigor.", severity: "high", firejailDefaultBlocked: true },
  { name: "ptrace", group: "@debug", description: "Rastreia e inspeciona processos em execução. Permite ler senhas de outros apps na memória.", severity: "high", firejailDefaultBlocked: true },
  { name: "kexec_load", group: "@module", description: "Carrega um novo kernel para execução imediata.", severity: "high", firejailDefaultBlocked: true },
  { name: "init_module", group: "@module", description: "Insere um módulo binário (.ko) diretamente dentro do kernel.", severity: "high", firejailDefaultBlocked: true },
  { name: "delete_module", group: "@module", description: "Remove um módulo do kernel Linux em execução.", severity: "high", firejailDefaultBlocked: true },
  { name: "swapon", group: "@swap", description: "Ativa arquivos ou partições de SWAP de memória física.", severity: "high", firejailDefaultBlocked: true },
  { name: "swapoff", group: "@swap", description: "Desativa arquivos ou partições de SWAP em vigor.", severity: "high", firejailDefaultBlocked: true },
  { name: "chroot", group: "@chroot", description: "Altera o diretório raiz para um novo diretório.", severity: "high", firejailDefaultBlocked: true },
  
  { name: "socket", group: "@network", description: "Cria um canal de comunicação de rede (soquete).", severity: "medium", firejailDefaultBlocked: false },
  { name: "connect", group: "@network", description: "Inicia uma conexão em um soquete remoto.", severity: "medium", firejailDefaultBlocked: false },
  { name: "bind", group: "@network", description: "Associa um soquete a uma porta local para escuta.", severity: "medium", firejailDefaultBlocked: false },
  { name: "listen", group: "@network", description: "Coloca um soquete local em modo de recepção de conexões.", severity: "medium", firejailDefaultBlocked: false },
  
  { name: "clone", group: "@process", description: "Cria um processo filho ou nova Thread leve.", severity: "low", firejailDefaultBlocked: false },
  { name: "execve", group: "@process", description: "Executa um novo arquivo ou processo sob o PID em execução.", severity: "low", firejailDefaultBlocked: false },
  { name: "kill", group: "@process", description: "Envia um sinal para finalizar ou gerenciar outro processo.", severity: "medium", firejailDefaultBlocked: false },
  { name: "mmap", group: "@memory", description: "Mapeia arquivos ou dispositivos diretamente na memória virtual.", severity: "low", firejailDefaultBlocked: false },
  { name: "mprotect", group: "@memory", description: "Altera as permissões de acesso de uma região de memória.", severity: "low", firejailDefaultBlocked: false }
];

const CAP_REGISTRY = [
  { name: "CAP_SYS_ADMIN", risk: "Acesso administrativo completo. Praticamente equivale a privilégio root irrestrito sobre subsistemas.", severity: "high" },
  { name: "CAP_NET_RAW", risk: "Permite escuta de pacotes de baixo nível na rede (mecanismo sniffers / Wireshark).", severity: "high" },
  { name: "CAP_SYS_MODULE", risk: "Permite inserir drivers e códigos binários arbitrários diretamente no kernel.", severity: "high" },
  { name: "CAP_SYS_PTRACE", risk: "Permite debugar e manipular livremente qualquer processo do host.", severity: "high" },
  { name: "CAP_SYS_BOOT", risk: "Permite reiniciar à força a máquina host.", severity: "high" },
  { name: "CAP_CHOWN", risk: "Permite alterar o proprietário de qualquer arquivo no disco.", severity: "medium" },
  { name: "CAP_NET_ADMIN", risk: "Permite criar interfaces de rede virtuais e alterar tabelas de roteamento.", severity: "medium" },
  { name: "CAP_SETUID", risk: "Permite que um processo herde o UID do root para escalar privilégios.", severity: "medium" }
];

export default function SyscallExplorer() {
  const [activeSubTab, setActiveSubTab] = useState<"syscalls" | "caps">("syscalls");
  const [search, setSearch] = useState("");

  const filteredSyscalls = SYSCALL_REGISTRY.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.group.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCaps = CAP_REGISTRY.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.risk.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl" id="system-exploration-pane">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Explorador de Permissões e Kernel Linux
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 animate-fade-in">Guia de referência educativo sobre chamadas de sistema (Syscalls) e Linux Capabilities do Firejail.</p>
        </div>

        <div className="flex bg-slate-950 p-0.5 rounded border border-slate-c00 text-[10px] w-fit">
          <button
            onClick={() => { setActiveSubTab("syscalls"); setSearch(""); }}
            className={`px-3 py-1 rounded font-semibold transition ${activeSubTab === "syscalls" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-350"}`}
          >
            System Calls (Syscalls)
          </button>
          <button
            onClick={() => { setActiveSubTab("caps"); setSearch(""); }}
            className={`px-3 py-1 rounded font-semibold transition ${activeSubTab === "caps" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-355"}`}
          >
            Linux Capabilities (Caps)
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder={activeSubTab === "syscalls" ? "Buscar syscall (ex: mount, ptrace, socket)..." : "Buscar capability (ex: SYS_ADMIN...)..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full placeholder-slate-500"
        />
      </div>

      {activeSubTab === "syscalls" ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredSyscalls.map((s) => (
            <div key={s.name} className="p-3 bg-slate-950 rounded-lg border border-slate-850 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400">{s.name}()</span>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded-full">
                    {s.group}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end flex-shrink-0 gap-2 sm:gap-1 text-[10px]">
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-slate-500 text-[9px] uppercase">Risco:</span>
                  {s.severity === "high" ? (
                    <span className="text-red-400 font-bold flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3 text-red-500" /> ALTO
                    </span>
                  ) : s.severity === "medium" ? (
                    <span className="text-yellow-400 font-semibold">MÉDIO</span>
                  ) : (
                    <span className="text-emerald-400">BAIXO</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-[9px] uppercase">Firejail Padrão:</span>
                  {s.firejailDefaultBlocked ? (
                    <span className="text-red-400 bg-red-950/20 px-1.5 rounded font-semibold text-[8px] border border-red-900/10">BLOQUEADO</span>
                  ) : (
                    <span className="text-emerald-400 bg-emerald-950/20 px-1.5 rounded font-semibold text-[8px] border border-emerald-900/10">PERMITIDO</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredSyscalls.length === 0 && (
            <span className="text-xs text-slate-500 italic block text-center py-8">Nenhuma system call corresponde às suas palavras-chave.</span>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredCaps.map((c) => (
            <div key={c.name} className="p-3 bg-slate-950 rounded-lg border border-slate-850 hover:border-slate-700 transition flex flex-col justify-between gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400">{c.name}</span>
                {c.severity === "high" ? (
                  <span className="text-[10px] text-red-400 font-semibold flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" /> ALTÍSSIMO PERIGO
                  </span>
                ) : (
                  <span className="text-[10px] text-yellow-400 font-semibold">PERIGO MODERADO</span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                {c.risk}
              </p>
            </div>
          ))}

          {filteredCaps.length === 0 && (
            <span className="text-xs text-slate-500 italic block text-center py-8">Nenhuma Linux Capability corresponde às suas palavras-chave.</span>
          )}
        </div>
      )}

      <div className="bg-slate-950/40 p-3.5 border border-slate-850 rounded-lg mt-4 text-[11px] text-slate-400 leading-relaxed font-sans space-y-1">
        <div className="flex items-center gap-1 text-slate-200 font-semibold mb-1">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Por que isto importa?</span>
        </div>
        <p>
          Através das flags <code className="bg-slate-900 border border-slate-800 text-emerald-300 px-1 rounded font-mono text-[10px]">--caps.drop=all</code> e <code className="bg-slate-900 border border-slate-800 text-emerald-300 px-1 rounded font-mono text-[10px]">--seccomp</code>, o Firejail impede que mesmo códigos executando sob o usuário root explorem brechas do kernel Linux, blindando o PC contra invasões críticas.
        </p>
      </div>
    </div>
  );
}
