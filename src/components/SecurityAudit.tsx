/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { FirejailProfile, LogEntry } from "../types";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Zap, 
  Terminal, 
  Cpu, 
  Network, 
  Lock, 
  HelpCircle, 
  ArrowRight,
  BookOpen,
  Check,
  Code,
  FileText
} from "lucide-react";

interface SecurityAuditProps {
  profiles: FirejailProfile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onUpdateProfile: (profile: FirejailProfile) => void;
  onAddLog: (log: LogEntry) => void;
  onSwitchTab: (tab: "builder" | "monitor" | "explorer" | "audit") => void;
}

interface AuditFinding {
  id: string;
  type: "high" | "warning" | "success";
  title: string;
  description: string;
  recommendation: string;
  fieldToFix?: string;
  valueToFix?: any;
}

export default function SecurityAudit({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onUpdateProfile,
  onAddLog,
  onSwitchTab
}: SecurityAuditProps) {
  const [activeDevGuideTab, setActiveDevGuideTab] = useState<"ide_inside" | "tooling_only" | "dev_container">("ide_inside");

  // Retrieve current active profile
  const selectedProfile = useMemo(() => {
    return profiles.find(p => p.id === selectedProfileId) || profiles[0];
  }, [profiles, selectedProfileId]);

  // Execute deep rule-based security audit
  const auditResults = useMemo(() => {
    if (!selectedProfile) return { score: 0, findings: [] as AuditFinding[] };

    const findings: AuditFinding[] = [];
    let score = 100;

    // --- RULE 1: Seccomp Protection ---
    if (selectedProfile.seccompEnabled) {
      findings.push({
        id: "seccomp-ok",
        type: "success",
        title: "Filtro de Chamadas do Sistema (Seccomp) Ativo",
        description: "Chamadas raras e perigosas ao kernel estão bloqueadas por padrão.",
        recommendation: "Mantenha o Seccomp ativo para mitigar explorações de escalabilidade locais."
      });
    } else {
      score -= 22;
      findings.push({
        id: "seccomp-fail",
        type: "high",
        title: "Seccomp Desabilitado",
        description: "O aplicativo possui acesso irrestrito a todas as chamadas de sistema (syscalls) do kernel Linux.",
        recommendation: "Habilite o Seccomp na aba Filtros de Sistema.",
        fieldToFix: "seccompEnabled",
        valueToFix: true
      });
    }

    // --- RULE 2: No Root Escalation (noroot) ---
    if (selectedProfile.noroot) {
      findings.push({
        id: "noroot-ok",
        type: "success",
        title: "Privilégios de Root Desativados (noroot)",
        description: "O processo é impedido de obter privilégios de superusuário dentro da sandbox.",
        recommendation: "Padrão de segurança essencial para impedir escalonamento de privilégios."
      });
    } else {
      score -= 18;
      findings.push({
        id: "noroot-fail",
        type: "high",
        title: "Execução como Root Permitida",
        description: "Sem a restrição 'noroot', binários SUID erráticos e malwares podem tentar escalonar privilégios de administrador.",
        recommendation: "Habilite a flag '--noroot' para forçar execução em nível de usuário.",
        fieldToFix: "noroot",
        valueToFix: true
      });
    }

    // --- RULE 3: No New Privileges (nonewprivs) ---
    if (selectedProfile.nonewprivs) {
      findings.push({
        id: "nonewprivs-ok",
        type: "success",
        title: "Prevenção contra Novos Privilégios (nonewprivs)",
        description: "Impede processos filhos de invocar programas SUID para ganhar privilégios extras.",
        recommendation: "Tranca a árvore de subprocessos com segurança total."
      });
    } else {
      score -= 15;
      findings.push({
        id: "nonewprivs-fail",
        type: "high",
        title: "Novos Privilégios por Filhos Permitidos",
        description: "Subprocessos podem contornar restrições chamando outros binários privilegiados do sistema host.",
        recommendation: "Habilite 'nonewprivs' para travar a árvore de execução de subprocessos.",
        fieldToFix: "nonewprivs",
        valueToFix: true
      });
    }

    // --- RULE 4: Private Home Directory isolation ---
    const hasHomeSandbox = selectedProfile.privateHome || !!selectedProfile.privateHomeDir;
    if (hasHomeSandbox) {
      findings.push({
        id: "home-ok",
        type: "success",
        title: "Isolamento da Pasta Home Ativo",
        description: "O aplicativo roda de forma cega para a home real. Ele enxerga uma pasta limpa ou temporária.",
        recommendation: "Ideal para navegadores, clientes de torrent e chats confidenciais."
      });
    } else {
      score -= 15;
      findings.push({
        id: "home-fail",
        type: "warning",
        title: "Home Real Totalmente Exposta",
        description: "O aplicativo pode ler todas as pastas do seu computador, incluindo Documentos, Downloads e Imagens.",
        recommendation: "Ative 'privateHome' para isolar a home ou configure Whitelists específicas.",
        fieldToFix: "privateHome",
        valueToFix: true
      });
    }

    // --- RULE 5: Leak detection of credentials (~/.ssh) ---
    const hasSshProtection = hasHomeSandbox || selectedProfile.blacklistPaths?.some(p => p.includes(".ssh"));
    if (hasSshProtection) {
      findings.push({
        id: "ssh-ok",
        type: "success",
        title: "Chaves SSH Protegidas contra Roubo",
        description: "O caminho sensível ~/.ssh está blindado por bloqueio explícito ou por sandbox de Home.",
        recommendation: "Fundamental para barrar malwares que buscam minerar credenciais no computador de desenvolvedores."
      });
    } else {
      score -= 12;
      findings.push({
        id: "ssh-fail",
        type: "high",
        title: "Credenciais SSH Expostas (~/.ssh)",
        description: "O aplicativo pode coletar secretamente suas chaves de acesso a servidores (id_rsa, id_ed25519) sem o seu consentimento.",
        recommendation: "Adicione '~/.ssh' na lista de caminhos proibidos (Blacklist) ou ative o isolamento de Home.",
        fieldToFix: "blacklistPaths",
        valueToFix: ["~/.ssh"]
      });
    }

    // --- RULE 6: Leak detection of GNU Privacy Guard (~/.gnupg) ---
    const hasGpgProtection = hasHomeSandbox || selectedProfile.blacklistPaths?.some(p => p.includes(".gnupg"));
    if (hasGpgProtection) {
      findings.push({
        id: "gnupg-ok",
        type: "success",
        title: "Chaves de Assinatura PGP Blindadas",
        description: "O diretório ~/.gnupg está restrito. Malwares não podem desviar credenciais de assinatura de código.",
        recommendation: "Garante integridade sobre suas commits assinadas."
      });
    } else {
      score -= 10;
      findings.push({
        id: "gnupg-fail",
        type: "warning",
        title: "Chaves PGP Expostas (~/.gnupg)",
        description: "Chaves criptográficas privadas e dados de confiança estão expostos à varredura e cópia do sandbox.",
        recommendation: "Adicione '~/.gnupg' à lista de caminhos restritos (Blacklist).",
        fieldToFix: "blacklistPaths",
        valueToFix: ["~/.gnupg"]
      });
    }

    // --- RULE 7: Temporary space isolation (private-tmp) ---
    if (selectedProfile.privateTmp) {
      findings.push({
        id: "tmp-ok",
        type: "success",
        title: "Fila de Arquivos Temporários Isolada (private-tmp)",
        description: "O sandbox usa um espaço /tmp limpo, ocultando sockets de comunicações de outros apps.",
        recommendation: "Evita espionagem de sockets X11 ou barramentos do sistema local."
      });
    } else {
      score -= 8;
      findings.push({
        id: "tmp-fail",
        type: "warning",
        title: "Diretório /tmp do Host Compartilhado",
        description: "O aplicativo compartilha arquivos temporários globais da máquina, facilitando vazamento de credenciais locais.",
        recommendation: "Ative 'privateTmp' na aba de Isolamento de Arquivos.",
        fieldToFix: "privateTmp",
        valueToFix: true
      });
    }

    // --- RULE 8: Writable /etc access block ---
    if (selectedProfile.writableEtc) {
      score -= 20;
      findings.push({
        id: "etc-fail",
        type: "high",
        title: "Acesso de Escrita à Pasta /etc Habilitado",
        description: "O aplicativo possui permissão para modificar as configurações globais do sistema host e de rede.",
        recommendation: "Desative a flag writableEtc instantaneamente. Mudanças em /etc devem ser tratadas fora da sandbox.",
        fieldToFix: "writableEtc",
        valueToFix: false
      });
    }

    // Ensure score is within boundaries
    score = Math.max(10, Math.min(100, score));

    return { score, findings };
  }, [selectedProfile]);

  // Handler to apply a security fix automatically
  const handleApplyFix = (finding: AuditFinding) => {
    if (!selectedProfile || !finding.fieldToFix) return;

    const updatedProfile = { ...selectedProfile };
    
    // Custom logic based on fields
    if (finding.fieldToFix === "blacklistPaths") {
      const existing = updatedProfile.blacklistPaths || [];
      const newPathsToInclude = finding.valueToFix as string[];
      // Avoid duplication
      const merged = Array.from(new Set([...existing, ...newPathsToInclude]));
      updatedProfile.blacklistPaths = merged;
    } else {
      // Direct boolean assignment
      (updatedProfile as any)[finding.fieldToFix] = finding.valueToFix;
    }

    onUpdateProfile(updatedProfile);

    // Logging action
    const timeStamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    onAddLog({
      id: `audit-fix-${Date.now()}`,
      timestamp: timeStamp,
      pid: 1201,
      sandboxName: selectedProfile.sandboxName || "auditor",
      type: "CAPABILITY",
      message: `⚡ Aplicada AUTO-CORREÇÃO de Segurança: '${finding.title}' foi ativada e corrigida sob o perfil de '${selectedProfile.name}'.`,
      severity: "low"
    });
  };

  // Bulk Apply all recommendations
  const handleApplyAllFixes = () => {
    if (!selectedProfile) return;

    let updatedProfile = { ...selectedProfile };
    let correctedCount = 0;

    auditResults.findings.forEach(f => {
      if (f.fieldToFix) {
        correctedCount++;
        if (f.fieldToFix === "blacklistPaths") {
          const existing = updatedProfile.blacklistPaths || [];
          const newPathsToInclude = f.valueToFix as string[];
          updatedProfile.blacklistPaths = Array.from(new Set([...existing, ...newPathsToInclude]));
        } else {
          (updatedProfile as any)[f.fieldToFix] = f.valueToFix;
        }
      }
    });

    if (correctedCount > 0) {
      onUpdateProfile(updatedProfile);
      const timeStamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      onAddLog({
        id: `audit-all-${Date.now()}`,
        timestamp: timeStamp,
        pid: 1201,
        sandboxName: selectedProfile.sandboxName || "auditor",
        type: "INFO",
        message: `🛡️ Auditoria Inteligente: Aplicada correção em lote (${correctedCount} correções) no perfil '${selectedProfile.name}'. Nível de segurança maximizado para 100%!`,
        severity: "low"
      });
      alert(`Parabéns! Aplicada ${correctedCount} correções automáticas em lote de modo bem-sucedido. Seu perfil de sandbox agora cumpre todos os requisitos normativos de contenção rígida.`);
    }
  };

  // Filter findings
  const highRiskCount = auditResults.findings.filter(f => f.type === "high").length;
  const warningCount = auditResults.findings.filter(f => f.type === "warning").length;
  const successCount = auditResults.findings.filter(f => f.type === "success").length;

  return (
    <div className="space-y-6" id="security-audit-module">
      
      {/* Upper overview card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 shadow-xl relative overflow-hidden animate-fade-in">
        {/* Subtle decorative background indicator */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
          
          {/* Profile selector and stats */}
          <div className="flex-1 space-y-3">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
              Auditoria de Inteligência de Segurança
            </span>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Análise do Perfil Ativo:
              </h2>
              <select
                value={selectedProfileId}
                onChange={(e) => onSelectProfile(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.program || "app"})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-450 mt-1 max-w-xl">
              Analisando controles de isolamento, regras syscall seccomp, restrições nativas linux, e segurança de barramentos dbus de <strong className="text-white font-mono">/etc/firejail/{selectedProfile.program || "app"}.profile</strong>.
            </p>

            {/* Badges of findings */}
            <div className="flex items-center gap-3 pt-1 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                Aviso de Riscos:
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                🛑 {highRiskCount} Críticos
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                ⚠️ {warningCount} Médios
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                ✅ {successCount} Seguros
              </span>
            </div>
          </div>

          {/* Radial score representation */}
          <div className="flex flex-col items-center justify-center bg-slate-950/60 p-4 border border-slate-850 rounded-xl min-w-[200px] gap-2">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Pontuação de Defesa</span>
            
            <div className="relative flex items-center justify-center">
              {/* Circular gauge */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  strokeWidth="6"
                  stroke="currentColor"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  strokeWidth="6"
                  strokeDasharray="239" // 2 * pi * r (approx 238.76)
                  strokeDashoffset={239 - (239 * auditResults.score) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  className={`transition-all duration-1000 ${
                    auditResults.score >= 80 
                      ? "text-emerald-500" 
                      : auditResults.score >= 50 
                      ? "text-amber-500" 
                      : "text-rose-500"
                  }`}
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-mono font-black text-white">{auditResults.score}%</span>
                <span className={`text-[8px] font-bold uppercase ${
                  auditResults.score >= 80 
                    ? "text-emerald-400" 
                    : auditResults.score >= 50 
                    ? "text-amber-400" 
                    : "text-rose-400"
                }`}>
                  {auditResults.score >= 80 ? "Suficiente" : auditResults.score >= 50 ? "Alerta" : "Vulnerável"}
                </span>
              </div>
            </div>

            {/* Quick corrective button */}
            {(highRiskCount > 0 || warningCount > 0) && (
              <button
                type="button"
                onClick={handleApplyAllFixes}
                className="mt-2 w-full py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] rounded transition flex items-center justify-center gap-1 cursor-pointer"
                id="btn-fix-profile-instantly"
              >
                <Zap className="w-3 h-3 text-yellow-350" />
                Blindar Perfil (Auto-Fix)
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Split Grid: Detailed findings and Dev sandboxing guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Side: Specific audit items (8 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5 mb-3.5 pb-2 border-b border-slate-850">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Checklist de Mitigação de Alta Segurança
            </h3>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
              {auditResults.findings.map((f) => {
                const isSuccess = f.type === "success";
                const isHigh = f.type === "high";

                return (
                  <div 
                    key={f.id}
                    className={`p-3 rounded-lg border transition duration-150 ${
                      isSuccess 
                        ? "bg-emerald-500/5 border-emerald-950/40 text-emerald-300"
                        : isHigh
                        ? "bg-rose-500/5 border-rose-950/40 text-slate-300"
                        : "bg-amber-500/5 border-amber-950/40 text-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Left icon wrapper */}
                      <span className="mt-0.5 shrink-0">
                        {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 font-bold" />}
                        {isHigh && <ShieldAlert className="w-4 h-4 text-rose-500 font-bold" />}
                        {f.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500 font-bold" />}
                      </span>

                      {/* Content block */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-bold ${
                            isSuccess 
                              ? "text-emerald-300" 
                              : isHigh 
                              ? "text-rose-400" 
                              : "text-amber-400"
                          }`}>
                            {f.title}
                          </h4>
                          <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isSuccess 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : isHigh 
                              ? "bg-rose-500/10 text-rose-400" 
                              : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {f.type}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {f.description}
                        </p>

                        {!isSuccess && (
                          <div className="pt-2 text-[10.5px] border-t border-slate-950/10 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/30 p-2 rounded">
                            <span className="text-slate-400">
                              <strong>💡 Recomendado:</strong> {f.recommendation}
                            </span>
                            {f.fieldToFix && (
                              <button
                                onClick={() => handleApplyFix(f)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-400 border border-slate-700 hover:border-emerald-500 rounded flex items-center gap-0.5 transition cursor-pointer self-end sm:self-auto uppercase tracking-wider font-bold"
                              >
                                <Zap className="w-2.5 h-2.5 text-yellow-500" /> Ativar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: IDE developments best approaches (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3.5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-slate-850">
                <Code className="w-4 h-4 text-emerald-400" />
                Dossiê: Como Sandboxar sua IDE (VS Code)?
              </h3>
              <p className="text-[10.5px] text-slate-450 mt-1.5 leading-relaxed">
                Desenvolvedores lidam com milhares de dependências arbitrárias e vulneráveis de terceiros diariamente (NPM, PyPI, Maven). Isolar o ambiente é vital. Qual é a melhor abordagem?
              </p>
            </div>

            {/* Selection tabs for the dev guide */}
            <div className="grid grid-cols-3 bg-slate-955 p-1 rounded-lg border border-slate-850 gap-0.5 text-center text-[10px]">
              <button
                onClick={() => setActiveDevGuideTab("ide_inside")}
                className={`py-1 rounded font-bold transition cursor-pointer ${
                  activeDevGuideTab === "ide_inside" 
                    ? "bg-slate-800 text-white border border-slate-700 shadow" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1. IDE em Firejail
              </button>
              <button
                onClick={() => setActiveDevGuideTab("tooling_only")}
                className={`py-1 rounded font-bold transition cursor-pointer ${
                  activeDevGuideTab === "tooling_only" 
                    ? "bg-slate-800 text-white border border-slate-700 shadow" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2. Compilador Isolado
              </button>
              <button
                onClick={() => setActiveDevGuideTab("dev_container")}
                className={`py-1 rounded font-bold transition cursor-pointer ${
                  activeDevGuideTab === "dev_container" 
                    ? "bg-slate-800 text-white border border-slate-700 shadow" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                3. Dev Containers
              </button>
            </div>

            {/* Render selected strategy guide */}
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 space-y-3 text-[11px] leading-relaxed">
              {activeDevGuideTab === "ide_inside" && (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <Terminal className="w-3.5 h-3.5" />
                    Iniciar VS Code diretamente sob o Firejail
                  </div>
                  <p className="text-slate-400">
                    Ao executar <code className="bg-slate-900 border border-slate-800 font-mono text-[10px] text-emerald-350 px-1 rounded">firejail code</code>, o editor e 100% de seus subprocessos (incluindo extensões de terceiros, ferramentas cli compiladores e interpretadores) são rigidamente aprisionados.
                  </p>
                  
                  <div className="space-y-1">
                    <span className="font-semibold text-white block">Pros:</span>
                    <ul className="list-disc list-inside text-slate-400 pl-1 space-y-1 text-[10.5px]">
                      <li>Proteção global contra roubo de tokens por extensões rogue.</li>
                      <li>Dificulta infiltrações de malware em scripts post-install.</li>
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-white block">Contras / Cuidados críticos:</span>
                    <ul className="list-disc list-inside text-slate-400 pl-1 space-y-1 text-[10.5px]">
                      <li>Impede integrações densas fora do espaço whitelisted.</li>
                      <li>Necessita declarar caminhos em <code className="text-slate-200">whitelist ~/workspace</code>.</li>
                      <li>Atividades com Docker nativo em portas locais ficam vetadas se não houver ajuste.</li>
                    </ul>
                  </div>

                  <div className="p-2 bg-slate-950 rounded border border-slate-850 font-mono text-[9.5px] text-slate-300">
                    <span className="text-slate-500"># Comando recomendado:</span><br />
                    firejail --private-tmp --whitelist=~/meu-codigo code .
                  </div>
                </>
              )}

              {activeDevGuideTab === "tooling_only" && (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                    <Cpu className="w-3.5 h-3.5" />
                    Manter IDE Livre, mas Isolando o Run / Compilação
                  </div>
                  <p className="text-slate-400">
                    Nesta tática, o seu editor roda livre no host Linux nativo (garantindo performance fluida e conexões ssh), porém qualquer comando como <code className="text-slate-200">npm install</code>, <code className="text-slate-200">pip install</code> ou scripts desconhecidos rodam em Firejail dedicado.
                  </p>

                  <div className="space-y-1">
                    <span className="font-semibold text-white block">Estratégia Recomendada:</span>
                    <p className="text-[10.5px] text-slate-400">
                      Crie aliases rápidos no bash para orquestrar:
                    </p>
                    <div className="p-2 bg-slate-950 rounded border border-slate-850 font-mono text-[9px] text-amber-400 leading-tight">
                      alias fnpm="firejail --private-tmp --whitelist=~/workspace npm"<br />
                      alias fnode="firejail --private-tmp --whitelist=~/workspace node"
                    </div>
                  </div>

                  <p className="text-[10.5px] text-slate-400">
                    Com isso, o ecossistema npm não consegue espiar além de <code className="text-slate-200">~/workspace</code>, impedindo invasão à sua chave id_rsa global em ~/.ssh quando as coleções executarem rotinas de postinstall.
                  </p>
                </>
              )}

              {activeDevGuideTab === "dev_container" && (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                    <Network className="w-3.5 h-3.5" />
                    Padrão de Ouro: IDE Dev Containers (Docker)
                  </div>
                  <p className="text-slate-400">
                    Para o dia a dia corporativo pesado, a abordagem ideal é o standard do **VS Code Dev Containers (Remote Containers)**. 
                  </p>
                  <p className="text-slate-400">
                    O editor roda leve de ponta a ponta no host físico, comunicando-se via socket interno com um container Docker rodando a aplicação. O Git, ssh-key, e as portas do localhost são encaminhados em encapsulamento, preservando a máquina hospedeira de exposições indesejadas.
                  </p>

                  <div className="p-2 bg-slate-800/40 rounded border border-slate-800 text-[10.5px] text-slate-200">
                    <strong>💡 Veredito:</strong> Se você desenvolve em equipes grandes, escolha <strong>Dev Containers (Docker)</strong>. Para ferramentas rápidas e auditorias locais sem Docker, utilize <strong>regras dedicadas do Firejail</strong>.
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => onSwitchTab("builder")}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-750 font-bold text-xs rounded text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              Ajustar Regras no Construtor
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
