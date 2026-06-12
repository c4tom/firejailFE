/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { 
  BookOpen, 
  HelpCircle, 
  Terminal, 
  Cpu, 
  Network, 
  ShieldCheck, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Lightbulb, 
  Zap, 
  FileText, 
  AlertCircle,
  HelpCircle as HelpIcon,
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface HelpTutorialProps {
  onSwitchTab?: (tab: any) => void;
  onImportExampleCommand?: (commandArgs: string, name: string) => void;
}

export default function HelpTutorial({ onSwitchTab, onImportExampleCommand }: HelpTutorialProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFaqId, setActiveFaqId] = useState<string | null>("pilar-1");
  const [compareTab, setCompareTab] = useState<"performance" | "complexity" | "usecase">("performance");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pilares = [
    {
      id: "pilar-1",
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      title: "Consumo Zero (Zero-Overhead)",
      subtitle: "Aproveitando recursos nativos do kernel Linux",
      description: "Ao contrário do Docker, Flatpak ou Máquinas Virtuais que virtualizam sistemas completos ou gerenciam camadas pesadas de arquivos, o Firejail utiliza o próprio kernel do Linux do seu computador. Ele cria namespaces (isolamento de processos, rede, montagem) e cgroups em microssegundos. É contenção instantânea de alta performance.",
      badge: "Performance"
    },
    {
      id: "pilar-2",
      icon: <Layers className="w-5 h-5 text-teal-400" />,
      title: "Mais de 1000 Perfis Prontos",
      subtitle: "Ecossistema pronto de fábrica em '/etc/firejail/'",
      description: "A grande magia está no repositório de perfis mantido pela comunidade mundial. Quase qualquer aplicativo popular que você tenha (Firefox, Google Chrome, Audacity, GIMP, VLC, Slack, Discord, VS Code, NodeJS, Python) já possui um arquivo de regras testado e pré-instalado pelo próprio Firejail. Basta rodar o comando e ele se tranca sozinho.",
      badge: "Usabilidade"
    },
    {
      id: "pilar-3",
      icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
      title: "Seccomp: Filtro de Chamadas Diretas",
      subtitle: "Bloqueio inteligente de códigos nocivos",
      description: "Ele permite instruir o kernel do Linux a vetar syscalls exóticos que aplicações convencionais nunca utilizam (como ptrace, kexec_load, reboot, etc). Isso reduz radicalmente a superfície de ataque físico contra o kernel de forma que, mesmo que o browser ou app seja hackeado, o invasor é incapaz de assumir controle da máquina host.",
      badge: "Robustez"
    },
    {
      id: "pilar-4",
      icon: <Network className="w-5 h-5 text-purple-400" />,
      title: "Isolamento de Rede Dinâmica",
      subtitle: "Namespaces de Rede e DNS Independentes",
      description: "Precisa garantir de forma infalível que um utilitário local não vaze logs ou códigos pela internet? Com uma única flag, você pode cortar o acesso à internet do programa completamente (com '--net=none'), criar uma ponte de rede ethernet isolada, aplicar velocidade máxima de upload/download ou configurar um DNS ultra-seguro temporário.",
      badge: "Rede"
    }
  ];

  const practicalExamples = [
    {
      title: "Navegação Anônima Anti-Rastros (Nível Agência)",
      description: "Inicia o navegador isolando sua pasta pessoal, impedindo leitura de suas ssh-keys (~/.ssh) e montando uma pasta temporária na memória RAM (descartada ao fechar o app).",
      cmd: "firejail --private --private-tmp --net=dns-server google-chrome",
      args: "--private --private-tmp --dns=1.1.1.1",
      profileName: "Navegador Ultra Seguro"
    },
    {
      title: "Auditar Scripts Node.JS Terceirizados (NPM)",
      description: "Ideal para executar comandos NPM 'install' ou scripts suspeitos. Sem acesso à internet e bloqueando leituras de suas credenciais (.bash_history, .ssh).",
      cmd: "firejail --net=none --private-tmp --blacklist=~/.ssh npm install",
      args: "--net=none --private-tmp --blacklist=~/.ssh",
      profileName: "Ambiente NPM Seguro"
    },
    {
      title: "Abrir PDF ou Imagem Suspeita",
      description: "Abre o visualizador num ambiente de sandbox estrito, sem acesso à rede, sem acesso a periféricos de áudio/gravação e forçando leitura isolada em /tmp.",
      cmd: "firejail --no3d --nosound --novideo --net=none evince documento_suspeito.pdf",
      args: "--no3d --nosound --novideo --net=none",
      profileName: "Visualizador Isolado"
    },
    {
      title: "Sandbox de Banco de Dados ou API de Teste",
      description: "Roda uma API sem chances de infectar arquivos confidenciais do sistema host utilizando uma home descartável temporária.",
      cmd: "firejail --private --noroot --nonewprivs python3 app.py",
      args: "--private --noroot --nonewprivs",
      profileName: "API Sandbox"
    }
  ];

  return (
    <div className="space-y-6" id="help-tutorial-module">
      
      {/* Upper header section */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950/20 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
              Guia de Aprendizado Completo
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              POR QUE O FIREJAIL É TÃO REVOLUCIONÁRIO?
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Descubra por que este utilitário SUID de sandbox leve é a escolha perfeita para segurança do terminal Linux, isolamento de softwares legados, navegadores e ferramentas CLI no dia a dia.
            </p>
          </div>

          <button
            onClick={() => onSwitchTab?.("builder")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow"
          >
            Ir Para Construtor
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real local host instruction banner */}
      <div id="local-setup-card" className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-5 shadow-xl space-y-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <Terminal className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase flex items-center gap-1.5">
              💻 Como Rodar este App de Verdade no seu Linux Local (Sem Mockups!)
            </h3>
            <p className="text-[11px] text-slate-400">Transforme essa simulação em um centro de controle operacional real de processos do seu próprio sistema operacional Linux nativo.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-950/85 border border-slate-800 p-3 rounded-lg space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">PASSO 1: SISTEMA</span>
              <h4 className="font-bold text-white mt-1.5 mb-1 text-xs">Instale o Firejail</h4>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">No Ubuntu/Debian/Mint, instale pelo terminal físico:</p>
            </div>
            <div className="bg-slate-900 border border-slate-850 p-2 rounded text-[10px] font-mono text-emerald-300 flex items-center justify-between mt-2">
              <span>sudo apt install firejail</span>
              <button onClick={() => copyToClipboard("sudo apt install firejail", "install-step")} className="hover:text-white cursor-pointer" title="Copiar comando">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950/85 border border-slate-800 p-3 rounded-lg space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">PASSO 2: EXPORTAR</span>
              <h4 className="font-bold text-white mt-1.5 mb-1 text-xs">Baixe o Código-fonte</h4>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">Abra as configurações no topo superior do AI Studio (ícone de engrenagem) e clique em <strong>"Baixar projeto como ZIP"</strong> para obter o código fullstack completo.</p>
            </div>
            <div className="text-[9.5px] text-slate-405 font-semibold bg-slate-900 p-1 rounded text-center border border-slate-850">
              Descompacte o ZIP localmente
            </div>
          </div>

          <div className="bg-slate-950/85 border border-slate-800 p-3 rounded-lg space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">PASSO 3: DEPENDÊNCIAS</span>
              <h4 className="font-bold text-white mt-1.5 mb-1 text-xs">Instale os Módulos</h4>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">Pelo terminal de comando físico, entre na pasta descompactada e execute:</p>
            </div>
            <div className="bg-slate-900 border border-slate-850 p-2 rounded text-[10px] font-mono text-emerald-300 flex items-center justify-between mt-2">
              <span>npm install</span>
              <button onClick={() => copyToClipboard("npm install", "install-step-2")} className="hover:text-white cursor-pointer" title="Copiar comando">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950/85 border border-slate-800 p-3 rounded-lg space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">PASSO 4: LANÇAR</span>
              <h4 className="font-bold text-white mt-1.5 mb-1 text-xs">Inicie o Dashboard</h4>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">Suba o servidor em tempo de execução com o script unificado do dashboard:</p>
            </div>
            <div className="bg-slate-900 border border-slate-850 p-2 rounded text-[10px] font-mono text-emerald-300 flex items-center justify-between mt-2">
              <span>npm run dev</span>
              <button onClick={() => copyToClipboard("npm run dev", "install-step-3")} className="hover:text-white cursor-pointer" title="Copiar comando">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-[10.5px] text-slate-500 text-center select-none pt-1">
          💡 Após iniciar, o Dashboard se conectará ao backend de controle do host. Acesse: <strong className="text-emerald-400">http://localhost:3000</strong>
        </p>
      </div>

      {/* Main Grid split: Pilares & Faq */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Side: Interactive key benefits (8 columns) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Key pillars card container */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-850 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Os 4 Pilares da Contenção de Elite
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pilares.map((p) => {
                const isActive = activeFaqId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveFaqId(p.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer h-full flex flex-col justify-between ${
                      isActive
                        ? "bg-gradient-to-br from-slate-900 to-emerald-950/20 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/25"
                        : "bg-slate-950/40 border-slate-850 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                          {p.icon}
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isActive 
                            ? "bg-emerald-500/20 text-emerald-350" 
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {p.badge}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {p.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {p.subtitle}
                        </p>
                      </div>

                      {isActive && (
                        <p className="text-[11px] text-slate-300 leading-relaxed pt-1.5 border-t border-slate-850 animate-fade-in">
                          {p.description}
                        </p>
                      )}
                    </div>

                    {!isActive && (
                      <span className="text-[10px] text-slate-500 font-bold self-end mt-2 flex items-center gap-0.5">
                        Ver Mais <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick command examples & generator playground */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-850">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Exemplos Reais para Copiar & Usar no Terminal Linux
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Abaixo estão receitas recomendadas para elevar a segurança no seu dia-a-dia de engenharia de software:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {practicalExamples.map((ex, idx) => {
                const uniqueId = `cmd-${idx}`;
                const isCopied = copiedId === uniqueId;

                return (
                  <div key={idx} className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                          {ex.profileName}
                        </span>
                        {onImportExampleCommand && (
                          <button
                            onClick={() => onImportExampleCommand(ex.args, ex.profileName)}
                            className="text-[9.5px] text-emerald-400 hover:text-emerald-300 font-bold underline transition cursor-pointer"
                            title="Carregar configurações para o construtor editar"
                          >
                            Editar no App
                          </button>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{ex.title}</h4>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">{ex.description}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase text-slate-500 font-bold">Comando Shell:</span>
                      <div className="bg-slate-900 border border-slate-850 p-2 rounded-lg font-mono text-[10px] text-slate-200 flex items-center justify-between gap-1 select-all relative overflow-hidden group">
                        <span className="truncate pr-4 text-emerald-300">{ex.cmd}</span>
                        <button
                          onClick={() => copyToClipboard(ex.cmd, uniqueId)}
                          className="p-1 text-slate-400 hover:text-white bg-slate-850 rounded hover:bg-slate-800 transition cursor-pointer"
                          title="Copiar comando"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Comparisons with Docker/Flatpak & Quick Tips (4 columns) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Tech Comparison Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3.5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Matriz Comparativa de Sandboxes
              </h3>
              <p className="text-[10.5px] text-slate-450 mt-1 leading-relaxed">
                Cada ferramenta resolve um problema distinto. Clique nas abas abaixo para ver as discrepâncias:
              </p>
            </div>

            {/* Matrix selection tabs */}
            <div className="grid grid-cols-3 bg-slate-950 p-1 border border-slate-850 rounded-lg text-center text-[10px]">
              <button
                onClick={() => setCompareTab("performance")}
                className={`py-1 rounded font-bold transition cursor-pointer ${
                  compareTab === "performance" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Performance
              </button>
              <button
                onClick={() => setCompareTab("complexity")}
                className={`py-1 rounded font-bold transition cursor-pointer ${
                  compareTab === "complexity" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Complexidade
              </button>
              <button
                onClick={() => setCompareTab("usecase")}
                className={`py-1 rounded font-bold transition cursor-pointer ${
                  compareTab === "usecase" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Uso Ideal
              </button>
            </div>

            {/* Comparison render block */}
            <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-lg space-y-3.5 animate-fade-in text-[11px]">
              {compareTab === "performance" && (
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <div className="flex justify-between font-bold text-white">
                      <span>⚡ Firejail (Nativo)</span>
                      <span className="text-emerald-400 font-mono">100% Excelente</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Tempo de boot em milisegundos. Consumo de RAM idêntico ao processo regular.</p>
                  </div>
                  <div className="space-y-0.5 border-t border-slate-850/60 pt-2">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>🐳 Docker (OS Virtual)</span>
                      <span className="text-emerald-400/80 font-mono">90% Ótimo</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Leve overhead de rede bridge e empilhamento de camadas de arquivos storage driver.</p>
                  </div>
                  <div className="space-y-0.5 border-t border-slate-850/60 pt-2">
                    <div className="flex justify-between font-bold text-slate-400">
                      <span>📦 Flatpak (Desktop)</span>
                      <span className="text-amber-500 font-mono">80% Médio</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Duplica runtime inteiras na memória local (ex: GNOME, KDE SDK completo de 600MB).</p>
                  </div>
                </div>
              )}

              {compareTab === "complexity" && (
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <div className="flex justify-between font-bold text-white">
                      <span>⚡ Firejail</span>
                      <span className="text-emerald-400 font-mono">Fácil / Baixíssima</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Simplesmente execute `firejail meu_app`. Sem criar imagens ou Dockerfiles complexos.</p>
                  </div>
                  <div className="space-y-0.5 border-t border-slate-850/60 pt-2">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>🐳 Docker</span>
                      <span className="text-amber-500 font-mono">Média</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Exige configurar portas, mapeamento de volumes host, logs de redes e Docker Compose.</p>
                  </div>
                  <div className="space-y-0.5 border-t border-slate-850/60 pt-2">
                    <div className="flex justify-between font-bold text-slate-400">
                      <span>📦 Flatpak</span>
                      <span className="text-amber-500 font-mono">Alta (para Empacotar)</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Exige criar manifestos json estritos e homologar dependências estáticas no Flatub.</p>
                  </div>
                </div>
              )}

              {compareTab === "usecase" && (
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <div className="flex justify-between font-bold text-white">
                      <span>⚡ Firejail</span>
                      <span className="text-emerald-400 font-mono">Segurança Desktop & CLI</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Proteger navegadores de internet, clientes de e-mail, reprodutores de vídeo e scrapers locais.</p>
                  </div>
                  <div className="space-y-0.5 border-t border-slate-850/60 pt-2">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>🐳 Docker</span>
                      <span className="text-emerald-400/80 font-mono">Servidores & Nuvem</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Ambiente idêntico do código de produção de microserviços em provedores Cloud.</p>
                  </div>
                  <div className="space-y-0.5 border-t border-slate-850/60 pt-2">
                    <div className="flex justify-between font-bold text-slate-400">
                      <span>📦 Flatpak / Snap</span>
                      <span className="text-emerald-450 font-mono">Distribuição Desktop</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Entregar apps gráficos de modo estável entre distros variadas (Ubuntu, Fedora, Arch).</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick tips & warnings card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-850">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              Dicas de Mestre em Firejail
            </h3>
            
            <div className="space-y-3 text-[11px] leading-relaxed">
              <div className="flex gap-2 text-slate-350">
                <span className="text-emerald-450 font-bold shrink-0 mt-0.5">💡</span>
                <span><strong>Comando '--private':</strong> É a flag de ouro. Ela esconde a home padrão e monta um espaço totalmente limpo e isolado que some ao fechar do aplicativo.</span>
              </div>
              <div className="flex gap-2 text-slate-350 border-t border-slate-850/50 pt-2">
                <span className="text-emerald-450 font-bold shrink-0 mt-0.5">💡</span>
                <span><strong>Comando '--net=none':</strong> A melhor forma de testar geradores de PDF e ferramentas de manipulação de imagem de procedência duvidosa sem riscos de expor telemetrias.</span>
              </div>
              <div className="flex gap-2 text-slate-350 border-t border-slate-850/50 pt-2">
                <span className="text-emerald-450 font-bold shrink-0 mt-0.5">💡</span>
                <span><strong>Desative o SUID se quiser:</strong> Em servidores super sensíveis, você pode revogar o bit SUID do executável Firejail e usar recursos nativos 'user namespaces' modernos no kernel Linux.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
