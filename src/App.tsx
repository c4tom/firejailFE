/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { FirejailProfile, RunningSandbox, LogEntry } from "./types";
import { DEFAULT_PRESETS } from "./data/defaultPresets";
import { generateFirejailArgs, parseProfileFileContent, generateProfileFileContent, buildFirejailCommandLine } from "./utils/commandGenerator";
import { SYSTEM_PROFILE_TEMPLATES, SystemProfileTemplate } from "./data/allEtcProfiles";
import { ALL_FIREJAIL_FILENAME_PRESETS } from "./data/firejailFilenames";
import ProfileFileList from "./components/ProfileFileList";
import ProfileForm from "./components/ProfileForm";
import LogsMonitor from "./components/LogsMonitor";
import SyscallExplorer from "./components/SyscallExplorer";
import SecurityAudit from "./components/SecurityAudit";
import HelpTutorial from "./components/HelpTutorial";
import SandboxieLauncher from "./components/SandboxieLauncher";
import { 
  ShieldAlert, 
  ShieldCheck,
  Terminal, 
  Activity, 
  BookOpen, 
  Settings2,
  Info,
  Layers,
  Heart,
  Globe,
  Plus,
  Search,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Monitor
} from "lucide-react";

function highlightProfileLine(line: string): React.ReactNode {
  const trimmed = line.trim();
  if (trimmed.startsWith("#")) {
    return <span className="text-slate-500 italic">{line}</span>;
  }
  if (trimmed.startsWith("include")) {
    const parts = line.split(" ");
    return (
      <span>
        <span className="text-blue-400 font-semibold">{parts[0]}</span>{" "}
        <span className="text-slate-300">{parts.slice(1).join(" ")}</span>
      </span>
    );
  }
  if (trimmed.startsWith("blacklist") || trimmed.startsWith("disable-")) {
    const idx = line.indexOf(" ");
    if (idx !== -1) {
      return (
        <span>
          <span className="text-rose-400 font-bold">{line.slice(0, idx)}</span>
          <span className="text-slate-305">{line.slice(idx)}</span>
        </span>
      );
    }
    return <span className="text-rose-450 font-bold">{line}</span>;
  }
  if (trimmed.startsWith("whitelist") || trimmed.startsWith("private-") || trimmed.startsWith("private")) {
    const idx = line.indexOf(" ");
    if (idx !== -1) {
      return (
        <span>
          <span className="text-emerald-400 font-bold">{line.slice(0, idx)}</span>
          <span className="text-slate-305">{line.slice(idx)}</span>
        </span>
      );
    }
    return <span className="text-emerald-450 font-bold">{line}</span>;
  }
  if (trimmed.startsWith("seccomp") || trimmed.startsWith("caps.")) {
    const idx = line.indexOf(" ");
    if (idx !== -1) {
      return (
        <span>
          <span className="text-violet-400 font-bold">{line.slice(0, idx)}</span>
          <span className="text-slate-305">{line.slice(idx)}</span>
        </span>
      );
    }
    return <span className="text-violet-400 font-bold">{line}</span>;
  }
  return <span className="text-slate-205">{line}</span>;
}

/**
 * Main Firejail profile manager and simulated log monitoring hub
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<"builder" | "monitor" | "explorer" | "audit" | "help" | "sandboxie">("sandboxie");
  
  // Custom interactive states for sidebar & templates
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [modalCategory, setModalCategory] = useState<string>("All");
  const [profileLoadingFilename, setProfileLoadingFilename] = useState<string | null>(null);

  // Modal Preview states
  const [modalTab, setModalTab] = useState<"explore" | "preview">("explore");
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Compute combined curated + all 1200+ list of Firejail profiles
  const ALL_TEMPLATES = React.useMemo(() => {
    const curatedMap = new Map<string, boolean>();
    SYSTEM_PROFILE_TEMPLATES.forEach(p => {
      curatedMap.set(p.filename.toLowerCase(), true);
    });

    const combined: SystemProfileTemplate[] = [...SYSTEM_PROFILE_TEMPLATES];

    ALL_FIREJAIL_FILENAME_PRESETS.forEach(filename => {
      const fnLower = filename.toLowerCase();
      if (curatedMap.has(fnLower)) {
        return; // Avoid duplicating curated ones
      }

      // Dynamic classification based on keywords
      let category: "Navegadores" | "Comunicação" | "Desenvolvimento" | "Internet & Downloaders" | "Escritório & Mídia" | "Utilitários, Jogos e Outros" = "Utilitários, Jogos e Outros";
      let icon = "FileText";

      if (
        fnLower.includes("browser") ||
        fnLower.includes("chrome") ||
        fnLower.includes("firefox") ||
        fnLower.includes("opera") ||
        fnLower.includes("vivaldi") ||
        fnLower.includes("tor-") ||
        fnLower.includes("surf") ||
        fnLower.includes("waterfox") ||
        fnLower.includes("midori") ||
        fnLower.includes("epiphany")
      ) {
        category = "Navegadores";
        icon = "Globe";
      } else if (
        fnLower.includes("discord") ||
        fnLower.includes("slack") ||
        fnLower.includes("telegram") ||
        fnLower.includes("signal") ||
        fnLower.includes("skype") ||
        fnLower.includes("zoom") ||
        fnLower.includes("matrix") ||
        fnLower.includes("chat") ||
        fnLower.includes("messenger") ||
        fnLower.includes("teams") ||
        fnLower.includes("whatsapp") ||
        fnLower.includes("mumble") ||
        fnLower.includes("pidgin") ||
        fnLower.includes("weechat") ||
        fnLower.includes("irssi")
      ) {
        category = "Comunicação";
        icon = "MessageSquare";
      } else if (
        fnLower.includes("code") ||
        fnLower.includes("vim") ||
        fnLower.includes("nano") ||
        fnLower.includes("git") ||
        fnLower.includes("python") ||
        fnLower.includes("node") ||
        fnLower.includes("compiler") ||
        fnLower.includes("gcc") ||
        fnLower.includes("cargo") ||
        fnLower.includes("ide") ||
        fnLower.includes("intellij") ||
        fnLower.includes("eclipse") ||
        fnLower.includes("netbeans") ||
        fnLower.includes("sublime") ||
        fnLower.includes("php") ||
        fnLower.includes("rust") ||
        fnLower.includes("golang") ||
        fnLower.includes("java")
      ) {
        category = "Desenvolvimento";
        icon = "Terminal";
      } else if (
        fnLower.includes("torrent") ||
        fnLower.includes("transmission") ||
        fnLower.includes("qbittorrent") ||
        fnLower.includes("curl") ||
        fnLower.includes("wget") ||
        fnLower.includes("download") ||
        fnLower.includes("ssh") ||
        fnLower.includes("aria2") ||
        fnLower.includes("ftp") ||
        fnLower.includes("sftp") ||
        fnLower.includes("nmap") ||
        fnLower.includes("wireshark") ||
        fnLower.includes("openvpn") ||
        fnLower.includes("vpn") ||
        fnLower.includes("wireguard")
      ) {
        category = "Internet & Downloaders";
        icon = "DownloadCloud";
      } else if (
        fnLower.includes("vlc") ||
        fnLower.includes("mpv") ||
        fnLower.includes("gimp") ||
        fnLower.includes("audacious") ||
        fnLower.includes("libreoffice") ||
        fnLower.includes("pdf") ||
        fnLower.includes("evince") ||
        fnLower.includes("okular") ||
        fnLower.includes("calibre") ||
        fnLower.includes("inkscape") ||
        fnLower.includes("blender") ||
        fnLower.includes("kdenlive") ||
        fnLower.includes("spotify") ||
        fnLower.includes("obs-studio") ||
        fnLower.includes("rhythmbox") ||
        fnLower.includes("clementine") ||
        fnLower.includes("audacity") ||
        fnLower.includes("cheese") ||
        fnLower.includes("media") ||
        fnLower.includes("player") ||
        fnLower.includes("office") ||
        fnLower.includes("writer") ||
        fnLower.includes("calc") ||
        fnLower.includes("impress")
      ) {
        category = "Escritório & Mídia";
        icon = "Video";
      }

      const cleanName = filename
        .replace(/\.profile$/, "")
        .replace(/\.inc$/, " (Include)")
        .replace(/_/g, " ")
        .replace(/-/g, " ");

      const properName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

      combined.push({
        filename,
        name: properName,
        program: filename.replace(/\.profile$/, "").replace(/\.inc$/, ""),
        description: `Perfil padrão do sistema (/etc/firejail/${filename}) importado e totalmente configurável nesta sandbox.`,
        category,
        attentionNeeded: false,
        icon,
        settings: {
          privateTmp: true,
          privateCache: true,
          seccompEnabled: true,
          nonewprivs: true,
          noroot: true,
          blacklistPaths: ["~/.ssh", "~/.gnupg"]
        }
      });
    });

    return combined;
  }, []);
  
  // Profiles store
  const [customProfiles, setCustomProfiles] = useState<FirejailProfile[]>(() => {
    const saved = localStorage.getItem("firejail_custom_profiles");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse custom profiles, resetting.", e);
      }
    }
    // Default initial profiles list
    return [
      {
        id: "profile-mybrowser",
        name: "Meu Navegador Seguro",
        description: "Configuração para acesso ao banco online e navegação restrita sem vazar chaves locais nem chaves ssh.",
        program: "google-chrome",
        arguments: "--new-window https://web.whatsapp.com",
        icon: "Globe",
        isPreset: false,
        sandboxName: "chrome-jail",
        privateHome: true,
        privateCache: true,
        privateDev: true,
        privateTmp: true,
        blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Dropbox"],
        dnsServers: ["1.1.1.1"],
        seccompEnabled: true,
        seccompBlockSecondary: true,
        nonewprivs: true,
        noroot: true,
        noSound: false,
        noVideo: false,
        x11Mode: "xorg"
      }
    ];
  });

  // Current selected profile for editor
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
    const defaultList = localStorage.getItem("firejail_custom_profiles");
    if (defaultList) {
      try {
        const parsed = JSON.parse(defaultList);
        if (parsed.length > 0) return parsed[0].id;
      } catch (e) {}
    }
    return "profile-mybrowser";
  });

  // Active running sandboxes simulation
  const [activeSandboxes, setActiveSandboxes] = useState<RunningSandbox[]>([]);

  // Simulator Logs queue
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    {
      id: "log-init-1",
      timestamp: new Date(Date.now() - 30000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      pid: 1201,
      sandboxName: "sys-init",
      type: "INFO",
      message: "Serviço de auditoria Firejail v0.9.80 inicializado com sucesso no host local.",
      severity: "low"
    },
    {
      id: "log-init-2",
      timestamp: new Date(Date.now() - 25000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      pid: 1201,
      sandboxName: "sys-init",
      type: "INFO",
      message: "Filtros Seccomp padrão carregados: 128 system calls raras desabilitadas globalmente por padrão.",
      severity: "low"
    }
  ]);

  // Persists custom profiles
  useEffect(() => {
    localStorage.setItem("firejail_custom_profiles", JSON.stringify(customProfiles));
  }, [customProfiles]);

  // Local companions endpoints integration states
  const [isLocalFullstack, setIsLocalFullstack] = useState(false);
  const [isFirejailInstalled, setIsFirejailInstalled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    // Probes if the dev/production server companion API endpoints are active in the local build
    const checkBackendStatus = async () => {
      try {
        const response = await fetch("/api/status");
        if (response.ok) {
          const data = await response.json();
          if (data.fullstack) {
            setIsLocalFullstack(true);
            setIsFirejailInstalled(data.firejailInstalled);
            
            // Log that backend has been successfully identified!
            setLogs(prev => [
              ...prev,
              {
                id: `bk-log-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                pid: 1205,
                sandboxName: "sys-net",
                type: "INFO",
                message: `🔌 Conectado ao servidor de controle local! Modo operacional Real-Time liberado. (Firejail: ${data.firejailInstalled ? "Instalado no Host ✅" : "Indisponível no Host ❌"})`,
                severity: "medium"
              }
            ]);
          }
        }
      } catch (err) {
        console.log("Companion Express server is not available or running on a client-only deployment. Using elegant simulation patterns as fallback.", err);
      }
    };
    checkBackendStatus();
  }, []);

  // Polls real operating system sandboxes when running locally under fullstack express
  useEffect(() => {
    if (!isLocalFullstack) return;

    const syncSandboxes = async () => {
      try {
        const response = await fetch("/api/sandboxes/list");
        if (response.ok) {
          const data = await response.json();
          const list = data.sandboxes; // Array of { pid, user, command, program, isSimulated }

          setActiveSandboxes(prev => {
            // Keep existing terminated or custom simulated entries that hasnt synced,
            // but update with live PIDs or merge active runs
            const currentNonTerminated = prev.filter(s => s.status !== "terminated");

            const syncedList: RunningSandbox[] = list.map((osJail: any) => {
              const existing = currentNonTerminated.find(x => x.pid === osJail.pid);
              if (existing) {
                return { 
                  ...existing, 
                  status: "running" as const,
                  cpuUsage: osJail.cpu ?? existing.cpuUsage,
                  memoryUsage: osJail.memory ?? existing.memoryUsage
                };
              }

              // Else mount new live dashboard view
              return {
                pid: osJail.pid,
                name: `${osJail.program.charAt(0).toUpperCase()}${osJail.program.slice(1)} [OS]`,
                profileId: `preset-${osJail.program}`,
                program: osJail.program,
                status: "running" as const,
                startTime: new Date(),
                cpuUsage: osJail.cpu ?? (1 + Math.random() * 3),
                memoryUsage: osJail.memory ?? (30 + Math.random() * 15),
                networkRx: 0,
                networkTx: 0,
                blockedSyscallsCount: 0,
                blockedFilesCount: 0
              };
            });

            return syncedList;
          });
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.warn("Companion server sync error:", err);
      }
    };

    syncSandboxes();
    const interval = setInterval(syncSandboxes, 3500);
    return () => clearInterval(interval);
  }, [isLocalFullstack]);

  // Real backend logs synchronizer
  useEffect(() => {
    if (!isLocalFullstack) return;

    const fetchServerLogs = async () => {
      try {
        const response = await fetch("/api/logs");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.logs)) {
            setLogs(prev => {
              const existingIds = new Set(prev.map(l => l.id));
              const newLogs = data.logs.filter((l: any) => !existingIds.has(l.id));
              if (newLogs.length === 0) return prev;
              
              const updatedList = [...prev, ...newLogs];
              if (updatedList.length > 250) {
                updatedList.splice(0, updatedList.length - 250);
              }
              return updatedList;
            });
          }
        }
      } catch (err) {
        console.warn("Falha ao sincronizar logs com o backend:", err);
      }
    };

    fetchServerLogs();
    const interval = setInterval(fetchServerLogs, 1000);
    return () => clearInterval(interval);
  }, [isLocalFullstack]);

  // Logs stream simulator thread (only active when offline / no backend companion is present)
  useEffect(() => {
    if (isLocalFullstack) return;

    const timer = setInterval(() => {
      if (activeSandboxes.length === 0) return;

      // Select a random running sandbox to execute an action
      const runningJobs = activeSandboxes.filter(s => s.status === "running");
      if (runningJobs.length === 0) return;

      const randomSandbox = runningJobs[Math.floor(Math.random() * runningJobs.length)];
      const profileOfSandbox = customProfiles.find(p => p.id === randomSandbox.profileId) || 
                               DEFAULT_PRESETS.find(p => p.id === randomSandbox.profileId);
      
      if (!profileOfSandbox) return;

      const newLog = generateSimulatedLogForProfile(profileOfSandbox, randomSandbox.pid);
      if (newLog) {
        // Appends to log state
        setLogs(prev => {
          const next = [...prev, newLog];
          if (next.length > 100) next.shift(); // keep max 100 to prevent leak
          return next;
        });

        // Update sandbox status count if got blocked
        if (newLog.type === "BLOCK_FILE" || newLog.type === "BLOCK_SYSCALL") {
          setActiveSandboxes(prev => prev.map(s => {
            if (s.pid === randomSandbox.pid) {
              const blockedSys = newLog.type === "BLOCK_SYSCALL" ? s.blockedSyscallsCount + 1 : s.blockedSyscallsCount;
              const blockedFiles = newLog.type === "BLOCK_FILE" ? s.blockedFilesCount + 1 : s.blockedFilesCount;
              return {
                ...s,
                blockedSyscallsCount: blockedSys,
                blockedFilesCount: blockedFiles
              };
            }
            return s;
          }));
        }

        // Slightly jitter resource usage
        setActiveSandboxes(prev => prev.map(s => {
          if (s.pid === randomSandbox.pid && s.status === "running") {
            const cpuJitter = Math.max(1, Math.min(99, s.cpuUsage + (Math.random() * 8) - 4));
            const memJitter = Math.max(10, s.memoryUsage + (Math.random() * 6) - 3);
            const isBroadcastingNetwork = profileOfSandbox.netBridge !== "none" && profileOfSandbox.ipAddress !== "none";
            const rxJitter = isBroadcastingNetwork ? Math.max(0, s.networkRx + (Math.random() * 4) - 2) : 0;
            const txJitter = isBroadcastingNetwork ? Math.max(0, s.networkTx + (Math.random() * 2) - 1) : 0;

            return {
              ...s,
              cpuUsage: cpuJitter,
              memoryUsage: memJitter,
              networkRx: rxJitter,
              networkTx: txJitter
            };
          }
          return s;
        }));
      }

    }, 1800);

    return () => clearInterval(timer);
  }, [activeSandboxes, customProfiles]);

  // Generates randomized high-fidelity logs of firejail audit events
  const generateSimulatedLogForProfile = (profile: FirejailProfile, pid: number): LogEntry => {
    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const sName = profile.sandboxName || `${profile.program}-jail`;

    // Decisions pool
    const pool: { type: "INFO" | "BLOCK_FILE" | "BLOCK_SYSCALL" | "NETWORK" | "DNS"; message: string; severity: "low" | "medium" | "high" }[] = [];

    // 1. Filesystem blocks simulation if options are checked
    if (profile.privateHome) {
      pool.push({
        type: "BLOCK_FILE",
        message: `Acesso negado para ler arquivo físico da Home Real (/home/usuario/.bash_history). Carregando home temporária Sandbox tmpfs.`,
        severity: "medium"
      });
    }

    if (profile.blacklistPaths && profile.blacklistPaths.length > 0) {
      const pathMock = profile.blacklistPaths[Math.floor(Math.random() * profile.blacklistPaths.length)];
      pool.push({
        type: "BLOCK_FILE",
        message: `Caminho na lista negra interceptado: Bloqueado acesso a '${pathMock}' no sitema. Erro: Access Denied.`,
        severity: "high"
      });
    }

    if (profile.readOnlyPaths && profile.readOnlyPaths.length > 0) {
      const pathMock = profile.readOnlyPaths[Math.floor(Math.random() * profile.readOnlyPaths.length)];
      pool.push({
        type: "BLOCK_FILE",
        message: `Tentativa de gravação bloqueada em caminho apenas-leitura: '${pathMock}'. Modificação bloqueada pela Sandbox.`,
        severity: "medium"
      });
    }

    // 2. Syscalls / Seccomp simulations if enabled
    if (profile.seccompEnabled) {
      const blockableSyscalls = profile.seccompSyscalls && profile.seccompSyscalls.length > 0 
        ? profile.seccompSyscalls 
        : ["mount", "ptrace", "reboot", "syslog"];
      const randomSys = blockableSyscalls[Math.floor(Math.random() * blockableSyscalls.length)];
      
      pool.push({
        type: "BLOCK_SYSCALL",
        message: `Chamada de sistema proibida interceptada: '${randomSys}()'. Processo bloqueado por filtro SECCOMP nativo.`,
        severity: "high"
      });
    }

    if (profile.capsEnabled || profile.capsDropAll) {
      pool.push({
        type: "BLOCK_SYSCALL",
        message: `Kernel Capability bloqueada: tentativa de elevar privilégios para executar CAP_SYS_ADMIN. Abortado.`,
        severity: "high"
      });
    }

    // 3. Network and DNS simulations
    if (profile.netBridge === "none" || profile.ipAddress === "none") {
      pool.push({
        type: "DNS",
        message: `Chamada socket(PF_INET...) bloqueada. Namespace de rede está desativada (--net=none). Sem conexões no container.`,
        severity: "medium"
      });
    } else {
      const domains = ["github.com", "slack.com", "updates.ubuntu.com", "telemetry-tracker.org", "api.stripe.com"];
      const rDom = domains[Math.floor(Math.random() * domains.length)];
      pool.push({
        type: "DNS",
        message: `DNS Query: Resolvendo endereço para o domínio '${rDom}' através do servidor ${profile.dnsServers?.[0] || "8.8.8.8"}`,
        severity: "low"
      });

      pool.push({
        type: "NETWORK",
        message: `Conexão estabelecida com sucesso. Transmissão outbound: TCP packet TLS v1.3 sended, port 443. (Rx: ${Math.floor(Math.random() * 5)}KB)`,
        severity: "low"
      });
    }

    // 4. Device bindings simulations
    if (profile.noSound) {
      pool.push({
        type: "BLOCK_FILE",
        message: `Acesso negado para ler o barramento de áudio real '/dev/snd/'. Bloqueado pelo filtro --nosound.`,
        severity: "medium"
      });
    }

    if (profile.noVideo) {
      pool.push({
        type: "BLOCK_FILE",
        message: `Dispositivo '/dev/video0' bloqueado. Programa tentou listar webcams mas foi isolado com --novideo.`,
        severity: "medium"
      });
    }

    if (profile.nodbus) {
      pool.push({
        type: "BLOCK_SYSCALL",
        message: `Comunicação D-Bus bloqueada. Tentativa de broadcast no Session Bus abortada por instrução --nodbus.`,
        severity: "medium"
      });
    }

    // Standard fallback information
    pool.push({
      type: "INFO",
      message: `Processo filho executando em sandbox estável. Namespaces ativas: pid, uts, mnt, ipc.`,
      severity: "low"
    });

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    return {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: stamp,
      pid: pid,
      sandboxName: sName,
      type: chosen.type,
      message: chosen.message,
      severity: chosen.severity
    };
  };

  const getSelectedProfile = () => {
    return customProfiles.find(p => p.id === selectedProfileId) || 
           DEFAULT_PRESETS.find(p => p.id === selectedProfileId) ||
           customProfiles[0];
  };

  // Profile actions
  const handleSelectProfile = (id: string) => {
    setSelectedProfileId(id);
    setActiveTab("builder");
  };

  const handleAddNewProfile = () => {
    setIsNewProfileModalOpen(true);
  };

  const handleCreateBlankProfile = () => {
    const newId = `profile-blank-${Date.now()}`;
    const newProf: FirejailProfile = {
      id: newId,
      name: `Novo Perfil do Zero ${customProfiles.length + 1}`,
      description: "Crie permissões personalizadas para o seu utilitário ou binário de teste.",
      program: "app_exemplo",
      arguments: "",
      icon: "Terminal",
      isPreset: false,
      seccompEnabled: true,
      nonewprivs: true
    };

    setCustomProfiles(prev => [...prev, newProf]);
    setSelectedProfileId(newId);
    setIsNewProfileModalOpen(false);
    setActiveTab("builder");

    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [
      ...prev,
      {
        id: `blank-create-${Date.now()}`,
        timestamp: stamp,
        pid: 1201,
        sandboxName: "sys-init",
        type: "INFO",
        message: `🆕 Novo perfil em branco "${newProf.name}" iniciado. Comece a configurar restrições nas abas Seccomp, Namespaces e Rede!`,
        severity: "low"
      }
    ]);
  };

  const handleLoadPreview = async (template: any) => {
    const filename = template.filename;
    setIsPreviewLoading(true);
    setPreviewTemplate(template);
    setModalTab("preview");

    const tempProfileForFileContent = {
      id: "preview-temp",
      name: template.name,
      description: template.description || "",
      program: template.program || filename.replace(/\.profile$/, ""),
      arguments: "",
      icon: template.icon || "FileText",
      isPreset: false,
      ...template.settings
    };

    let generatedText = generateProfileFileContent(tempProfileForFileContent);
    setPreviewContent(generatedText);

    try {
      const firstChar = filename.toLowerCase().charAt(0);
      let targetPath = "";
      if (filename.endsWith(".profile")) {
        if ((firstChar >= '0' && firstChar <= '9') || (firstChar >= 'a' && firstChar <= 'm')) {
          targetPath = `profile-a-m/${filename}`;
        } else if (firstChar >= 'n' && firstChar <= 'z') {
          targetPath = `profile-n-z/${filename}`;
        } else {
          targetPath = filename;
        }
      } else {
        targetPath = filename;
      }

      let response = await fetch(`https://raw.githubusercontent.com/netblue30/firejail/master/etc/${targetPath}`);
      if (!response.ok) {
        response = await fetch(`https://raw.githubusercontent.com/netblue30/firejail/master/etc/${filename}`);
      }

      if (response.ok) {
        const text = await response.text();
        setPreviewContent(text);
      }
    } catch (err) {
      console.warn("Could not retrieve online profile for preview, using generated defaults.", err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleConfirmImport = (template: any, content: string) => {
    const newId = `profile-template-${Date.now()}`;
    const filename = template.filename;

    const parsed = parseProfileFileContent(content, {
      id: newId,
      name: template.name,
      description: template.description || "",
      program: template.program || filename.replace(/\.profile$/, ""),
      arguments: "",
      icon: template.icon || "FileText",
      isPreset: false,
      ...template.settings
    });

    const newProf: FirejailProfile = {
      id: newId,
      name: template.name,
      description: template.description,
      program: template.program || filename.replace(/\.profile$/, ""),
      arguments: "",
      icon: template.icon || "FileText",
      isPreset: false,
      ...parsed,
      customRawText: content || undefined
    };

    setCustomProfiles(prev => [...prev, newProf]);
    setSelectedProfileId(newId);
    setIsNewProfileModalOpen(false);
    setModalSearch("");
    setModalCategory("All");
    setModalTab("explore");
    setPreviewTemplate(null);
    setPreviewContent("");
    setActiveTab("builder");

    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [
      ...prev,
      {
        id: `template-import-${Date.now()}`,
        timestamp: stamp,
        pid: 1211,
        sandboxName: "sys-init",
        type: "INFO",
        message: `📥 Perfil '${filename}' (${template.name}) gerado a partir da pré-visualização validada com total compatibilidade.`,
        severity: template.attentionNeeded ? "medium" : "low"
      }
    ]);
  };

  const handleImportTemplate = async (template: any) => {
    const newId = `profile-template-${Date.now()}`;
    const filename = template.filename;

    setProfileLoadingFilename(filename);

    let finalSettings = { ...template.settings };
    let finalRawText = template.customRawText || "";
    let fetchedOk = false;

    // Try to fetch raw text of this profile from official Firejail GitHub repository!
    try {
      const firstChar = filename.toLowerCase().charAt(0);
      let targetPath = "";
      if (filename.endsWith(".profile")) {
        if ((firstChar >= '0' && firstChar <= '9') || (firstChar >= 'a' && firstChar <= 'm')) {
          targetPath = `profile-a-m/${filename}`;
        } else if (firstChar >= 'n' && firstChar <= 'z') {
          targetPath = `profile-n-z/${filename}`;
        } else {
          targetPath = filename;
        }
      } else {
        targetPath = filename;
      }

      // Try primary url
      let response = await fetch(`https://raw.githubusercontent.com/netblue30/firejail/master/etc/${targetPath}`);
      if (!response.ok) {
        // Try direct fallback to root etc/ if not found there
        response = await fetch(`https://raw.githubusercontent.com/netblue30/firejail/master/etc/${filename}`);
      }

      if (response.ok) {
        const text = await response.text();
        finalRawText = text;
        const parsed = parseProfileFileContent(text, {
          id: newId,
          name: template.name,
          description: template.description || "",
          program: template.program || filename.replace(/\.profile$/, ""),
          arguments: "",
          icon: template.icon || "FileText",
          isPreset: false,
          ...template.settings
        });
        
        finalSettings = {
          ...parsed
        };
        fetchedOk = true;
      }
    } catch (err) {
      console.warn("Could not retrieve online profile, using built-in defaults.", err);
    } finally {
      setProfileLoadingFilename(null);
    }

    const newProf: FirejailProfile = {
      id: newId,
      name: template.name,
      description: template.description,
      program: template.program || filename.replace(/\.profile$/, ""),
      arguments: "",
      icon: template.icon || "FileText",
      isPreset: false,
      ...finalSettings,
      customRawText: finalRawText || undefined
    };

    setCustomProfiles(prev => [...prev, newProf]);
    setSelectedProfileId(newId);
    setIsNewProfileModalOpen(false);
    setActiveTab("builder");

    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [
      ...prev,
      {
        id: `template-import-${Date.now()}`,
        timestamp: stamp,
        pid: 1211,
        sandboxName: "sys-init",
        type: "INFO",
        message: fetchedOk 
          ? `📥 Perfil '${filename}' (${template.name}) gerado e sincronizado com as regras oficiais do repositório Firejail! Todos os parâmetros foram mapeados.`
          : `📥 Perfil '${filename}' (${template.name}) gerado a partir do template local com regras seguras padrão.`,
        severity: template.attentionNeeded ? "medium" : "low"
      }
    ]);
  };

  const handleDeleteProfile = (id: string) => {
    const updated = customProfiles.filter(p => p.id !== id);
    setCustomProfiles(updated);
    
    // Choose fallback if deleting currently opened
    if (selectedProfileId === id) {
      if (updated.length > 0) {
        setSelectedProfileId(updated[0].id);
      } else {
        setSelectedProfileId("preset-firefox");
      }
    }
  };

  const handleUpdateProfile = (updated: FirejailProfile) => {
    setCustomProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleImportProfile = (fileName: string, fileContent: string) => {
    const cleanFileName = fileName.replace(/\.profile$/, "");
    const newId = `profile-imported-${Date.now()}`;
    const baseProfile: FirejailProfile = {
      id: newId,
      name: `Importado: ${cleanFileName}`,
      description: `Perfil importado a partir do arquivo ${fileName}`,
      program: cleanFileName,
      arguments: "",
      icon: "FileText",
      isPreset: false,
    };

    try {
      const parsedProfile = parseProfileFileContent(fileContent, baseProfile);
      setCustomProfiles(prev => [...prev, parsedProfile]);
      setSelectedProfileId(newId);
      setActiveTab("builder");

      // Push success log to emulator log list
      const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLogs(prev => [
        ...prev,
        {
          id: `import-log-${Date.now()}`,
          timestamp: stamp,
          pid: 1201,
          sandboxName: "sys-init",
          type: "INFO",
          message: `📥 Perfil importado com sucesso do arquivo '${fileName}'! Todas as configurações de namespaces e permissões foram mapeadas.`,
          severity: "low"
        }
      ]);
    } catch (err) {
      alert("Houve um erro ao analisar o arquivo de perfil. Verifique se o formato está no padrão correto do Firejail.");
    }
  };

  const handleImportExampleCommand = (commandArgs: string, name: string) => {
    const newId = `profile-example-${Date.now()}`;
    const newProf: FirejailProfile = {
      id: newId,
      name: name,
      description: `Perfil importado a partir do Tutorial Interativo: '${name}'. Pronto para simulação.`,
      program: name === "Navegador Ultra Seguro" ? "google-chrome" : name === "Ambiente NPM Seguro" ? "npm" : name === "Visualizador Isolado" ? "evince" : "python3",
      arguments: "",
      icon: name === "Navegador Ultra Seguro" ? "Globe" : "Terminal",
      isPreset: false,
      seccompEnabled: true,
      nonewprivs: name.includes("API") || name.includes("Navegador"),
      noroot: name.includes("API") || name.includes("Navegador"),
      privateHome: name.includes("Navegador") || name.includes("API"),
      privateTmp: name.includes("Navegador") || name.includes("NPM"),
      noSound: name.includes("Visualizador"),
      noVideo: name.includes("Visualizador"),
      blacklistPaths: name.includes("NPM") ? ["~/.ssh"] : []
    };

    setCustomProfiles(prev => [...prev, newProf]);
    setSelectedProfileId(newId);
    setActiveTab("builder");

    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [
      ...prev,
      {
        id: `example-import-${Date.now()}`,
        timestamp: stamp,
        pid: 1402,
        sandboxName: "sys-init",
        type: "INFO",
        message: `📥 Importados parâmetros do Guia de Estudo para o perfil '${name}'.`,
        severity: "low"
      }
    ]);
  };

  const handleClonePreset = (preset: FirejailProfile) => {
    const newId = `profile-cloned-${Date.now()}`;
    const clonedObj: FirejailProfile = {
      ...preset,
      id: newId,
      name: `${preset.name} (Cópia)`,
      isPreset: false
    };

    setCustomProfiles(prev => [...prev, clonedObj]);
    setSelectedProfileId(newId);
    setActiveTab("builder");

    // Push info log
    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [
      ...prev,
      {
        id: `clone-log-${Date.now()}`,
        timestamp: stamp,
        pid: 1201,
        sandboxName: "sys-init",
        type: "INFO",
        message: `Novo perfil clonado com sucesso de '${preset.name}'. Configurações carregadas prontas para edição ou teste instantâneo.`,
        severity: "low"
      }
    ]);
  };

  // Sandbox Live execution simulator triggers
  const handleStartSandboxWithProfile = async (profile: FirejailProfile) => {
    // Check if copy is already running
    const existing = activeSandboxes.find(s => s.profileId === profile.id && s.status !== "terminated");
    if (existing) {
      // Bring up alert
      const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLogs(prev => [
        ...prev,
        {
          id: `err-log-${Date.now()}`,
          timestamp: stamp,
          pid: existing.pid,
          sandboxName: profile.sandboxName || "jail-blocked",
          type: "INFO",
          message: `⚠️ Falha ao inicializar: Já existe uma sandbox ativa para o perfil '${profile.name}' sob o PID ${existing.pid}.`,
          severity: "high"
        }
      ]);
      setActiveTab("monitor");
      return;
    }

    const args = generateFirejailArgs(profile);
    const argsString = args.join(" ");
    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    if (isLocalFullstack) {
      try {
        const response = await fetch("/api/sandboxes/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            program: profile.program || "firefox",
            args: args,
            profileName: `${profile.program || "custom"}.profile`,
            profileContent: generateProfileFileContent(profile)
          })
        });
        
        if (response.ok) {
          const resData = await response.json();
          const targetPid = resData.pid;
          
          const newSecObj: RunningSandbox = {
            pid: targetPid,
            name: profile.name,
            profileId: profile.id,
            program: profile.program || "unnamed",
            status: "running",
            startTime: new Date(),
            cpuUsage: 2 + Math.random() * 5,
            memoryUsage: 45 + Math.random() * 20,
            networkRx: profile.netBridge === "none" ? 0 : 4,
            networkTx: profile.netBridge === "none" ? 0 : 2,
            blockedSyscallsCount: 0,
            blockedFilesCount: 0
          };
          setActiveSandboxes(prev => [...prev, newSecObj]);

          setLogs(prev => [
            ...prev,
            {
              id: `start-log-${Date.now()}`,
              timestamp: stamp,
              pid: targetPid,
              sandboxName: profile.sandboxName || `${profile.program}-jail`,
              type: "INFO",
              message: `🚀 [REAL-HOST] Lançado com sucesso no OS! Comando: ${resData.command}. ${resData.message || ""}`,
              severity: "medium"
            }
          ]);
          setActiveTab("monitor");
          return;
        }
      } catch (err) {
        console.warn("Failed real startup, falling back to mock", err);
      }
    }

    const mockPid = Math.floor(4000 + Math.random() * 5000);
    const newSecObj: RunningSandbox = {
      pid: mockPid,
      name: profile.name,
      profileId: profile.id,
      program: profile.program || "unnamed",
      status: "running",
      startTime: new Date(),
      cpuUsage: 12 + Math.random() * 15,
      memoryUsage: 80 + Math.random() * 40,
      networkRx: profile.netBridge === "none" ? 0 : 5 + Math.random() * 10,
      networkTx: profile.netBridge === "none" ? 0 : 2 + Math.random() * 5,
      blockedSyscallsCount: 0,
      blockedFilesCount: 0
    };

    setActiveSandboxes(prev => [...prev, newSecObj]);
    
    setLogs(prev => [
      ...prev,
      {
        id: `start-log-${Date.now()}`,
        timestamp: stamp,
        pid: mockPid,
        sandboxName: profile.sandboxName || `${profile.program}-jail`,
        type: "INFO",
        message: `🚀 Sandbox '${profile.name}' iniciada com sucesso sob o PID: ${mockPid}. Comando carregado: firejail ${argsString} ${profile.program}`,
        severity: "medium"
      }
    ]);

    setActiveTab("monitor");
  };

  const handleTerminateSandbox = async (pid: number) => {
    setActiveSandboxes(prev => prev.filter(s => s.pid !== pid));

    if (isLocalFullstack) {
      try {
        await fetch("/api/sandboxes/terminate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pid })
        });
      } catch (err) {
        console.warn("Failed real terminate api call", err);
      }
    }

    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [
      ...prev,
      {
        id: `kill-log-${Date.now()}`,
        timestamp: stamp,
        pid: pid,
        sandboxName: "sys-audit",
        type: "INFO",
        message: isLocalFullstack
          ? `🛑 [REAL-HOST] Sandbox PID ${pid} enviada para finalização segura do OS. Recursos e jaula esvaziados.`
          : `🛑 Sandbox PID ${pid} finalizada e removida com sucesso. Todos os recursos temporários de tmpfs foram esvaziados de forma segura pelo Firejail.`,
        severity: "medium"
      }
    ]);
  };

  const handlePauseSandbox = (pid: number) => {
    setActiveSandboxes(prev => prev.map(s => s.pid === pid ? { ...s, status: "paused", cpuUsage: 0, networkRx: 0, networkTx: 0 } : s));

    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [
      ...prev,
      {
        id: `pause-log-${Date.now()}`,
        timestamp: stamp,
        pid: pid,
        sandboxName: "sys-audit",
        type: "INFO",
        message: `⏸️ Sinal SIGSTOP enviado para PID ${pid}. Processos suspensos temporariamente no namespace.`,
        severity: "low"
      }
    ]);
  };

  const handleResumeSandbox = (pid: number) => {
    setActiveSandboxes(prev => prev.map(s => s.pid === pid ? { ...s, status: "running", cpuUsage: 10 } : s));

    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [
      ...prev,
      {
        id: `resume-log-${Date.now()}`,
        timestamp: stamp,
        pid: pid,
        sandboxName: "sys-audit",
        type: "INFO",
        message: `▶️ Sinal SIGCONT enviado para PID ${pid}. Processos retomados dentro da sandbox.`,
        severity: "low"
      }
    ]);
  };

  const handleClearLogs = async () => {
    setLogs([]);
    if (isLocalFullstack) {
      try {
        await fetch("/api/logs/clear", { method: "POST" });
      } catch (err) {
        console.warn("Falha ao limpar logs no servidor:", err);
      }
    }
  };

  const handleAddCustomLog = (log: LogEntry) => {
    setLogs(prev => {
      const next = [...prev, log];
      if (next.length > 100) next.shift();
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-black">
      {/* Upper Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 md:px-6 h-14 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-slate-950 font-black shrink-0 shadow-inner">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight uppercase">
                Firejail <span className="text-emerald-400 font-normal normal-case">Dashboard</span>
              </h1>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 border border-emerald-500/20 font-bold rounded">
                {isLocalFullstack ? (isFirejailInstalled ? "NATIVO HOST 🐧" : "HOST LOCAL 🚀") : "SIMULAÇÃO 🖥️"}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 -mt-0.5 hidden sm:block">Confinamento Seguro e Auditoria Seccomp/Namespace</p>
          </div>
        </div>

        {/* Header Status + Tab bar wrapper */}
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full bg-emerald-500 ${activeSandboxes.some(s => s.status === 'running') ? 'animate-pulse' : ''}`}></span>
            <span>{activeSandboxes.filter(s => s.status === "running").length} Ativas</span>
          </div>

          {/* Core view tabs */}
          <nav className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs" aria-label="Abas Principais">
            <button
              onClick={() => setActiveTab("sandboxie")}
              className={`flex items-center gap-1.5 py-1 px-3 rounded font-medium transition cursor-pointer select-none ${
                activeTab === "sandboxie" 
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Terminal Sandboxie</span>
              <span className="inline sm:hidden">Sandboxie</span>
            </button>

            <button
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-1.5 py-1 px-3 rounded font-medium transition cursor-pointer select-none ${
                activeTab === "builder" 
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Construtor</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-1.5 py-1 px-3 rounded font-medium transition cursor-pointer select-none ${
                activeTab === "audit" 
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auditoria</span>
            </button>
            
            <button
              onClick={() => setActiveTab("monitor")}
              className={`flex items-center gap-1.5 py-1 px-3 rounded font-medium transition cursor-pointer select-none relative ${
                activeTab === "monitor" 
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Simulador</span>
              <span className="inline sm:hidden">Sim</span>
              {activeSandboxes.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("explorer")}
              className={`flex items-center gap-1.5 py-1 px-3 rounded font-medium transition cursor-pointer select-none ${
                activeTab === "explorer" 
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Permissões</span>
              <span className="inline md:hidden">Perms</span>
            </button>

            <button
              onClick={() => setActiveTab("help")}
              className={`flex items-center gap-1.5 py-1 px-3 rounded font-medium transition cursor-pointer select-none ${
                activeTab === "help" 
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guia</span>
            </button>
          </nav>
        </div>
      </header>

       {/* Main Container - High Density padding & gaps */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 md:p-4 lg:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Sidebar Left Column */}
        {activeTab !== "sandboxie" && (
          <div className={`space-y-4 h-full transition-all duration-300 ${
            isSidebarCollapsed 
              ? "md:col-span-1 xl:col-span-1" 
              : "md:col-span-4 xl:col-span-3"
          }`}>
            <ProfileFileList
              customProfiles={customProfiles}
              presetProfiles={DEFAULT_PRESETS}
              selectedProfileId={selectedProfileId}
              onSelectProfile={handleSelectProfile}
              onDeleteProfile={handleDeleteProfile}
              onAddNewProfile={handleAddNewProfile}
              onClonePreset={handleClonePreset}
              onImportProfile={handleImportProfile}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>
        )}

        {/* Content Right Column */}
        <div className={`space-y-4 transition-all duration-300 ${
          activeTab === "sandboxie"
            ? "md:col-span-12 xl:col-span-12"
            : isSidebarCollapsed 
              ? "md:col-span-11 xl:col-span-11" 
              : "md:col-span-8 xl:col-span-9"
        }`}>
          {activeTab === "sandboxie" && (
            <SandboxieLauncher
              activeSandboxes={activeSandboxes}
              onStartSandboxWithProfile={handleStartSandboxWithProfile}
              onTerminateSandbox={handleTerminateSandbox}
              onAddLog={handleAddCustomLog}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === "builder" && (
            <ProfileForm
              profile={getSelectedProfile()}
              onChange={handleUpdateProfile}
              onSave={async () => {
                const profile = getSelectedProfile();
                const content = generateProfileFileContent(profile);
                const filename = `${profile.program || "custom"}.profile`;
                const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

                let detailsMessage = "salvo com sucesso no LocalStorage do navegador!";

                if (isLocalFullstack) {
                  try {
                    const res = await fetch("/api/profiles/save", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ filename, content })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      detailsMessage = `salvo com sucesso no LocalStorage E no caminho do SO: ${data.filePath}!`;
                    }
                  } catch (err) {
                    console.warn("Failed saving profile to actual host", err);
                  }
                }

                setLogs(prev => [
                  ...prev,
                  {
                    id: `save-log-${Date.now()}`,
                    timestamp: stamp,
                    pid: 1215,
                    sandboxName: "sys-init",
                    type: "INFO",
                    message: `💾 Perfil '${profile.name}' ${detailsMessage}`,
                    severity: "low"
                  }
                ]);
                alert(`Perfil "${profile.name}" ${detailsMessage}`);
              }}
              onStartSandbox={handleStartSandboxWithProfile}
            />
          )}

          {activeTab === "monitor" && (
            <LogsMonitor
              activeSandboxes={activeSandboxes}
              onTerminateSandbox={handleTerminateSandbox}
              onPauseSandbox={handlePauseSandbox}
              onResumeSandbox={handleResumeSandbox}
              logs={logs}
              onClearLogs={handleClearLogs}
              onAddLog={handleAddCustomLog}
              selectedProfile={getSelectedProfile()}
              onStartWithProfile={handleStartSandboxWithProfile}
              presetProfiles={DEFAULT_PRESETS}
            />
          )}

          {activeTab === "audit" && (
            <SecurityAudit
              profiles={customProfiles}
              selectedProfileId={selectedProfileId}
              onSelectProfile={setSelectedProfileId}
              onUpdateProfile={handleUpdateProfile}
              onAddLog={handleAddCustomLog}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === "explorer" && (
            <SyscallExplorer />
          )}

          {activeTab === "help" && (
            <HelpTutorial
              onSwitchTab={setActiveTab}
              onImportExampleCommand={handleImportExampleCommand}
            />
          )}
        </div>
      </main>

      {/* Seletor e Repositório de Perfis do Sistema /etc/firejail/ */}
      {isNewProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" id="new-profile-modal-container">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Repositório de Perfis <span className="font-mono text-emerald-300">/etc/firejail/*.profile</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Selecione entre mais de 100 perfis padrão do sistema Linux ou monte Stacks de desenvolvimento integradas para editar e debugar.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsNewProfileModalOpen(false);
                  setModalSearch("");
                  setModalCategory("All");
                  setModalTab("explore");
                  setPreviewTemplate(null);
                  setPreviewContent("");
                }}
                className="p-1 px-2.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded transition cursor-pointer"
                title="Fechar"
                id="btn-close-new-profile-modal"
              >
                <X className="w-4 h-4 font-bold" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="bg-slate-950/85 border-b border-slate-850 px-4 md:px-5 flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setModalTab("explore")}
                className={`py-3 px-4 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
                  modalTab === "explore"
                    ? "border-emerald-500 text-white bg-slate-900/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
                id="btn-tab-modal-explore"
              >
                📁 Explorar Templates
              </button>
              <button
                type="button"
                onClick={() => {
                  if (previewTemplate) setModalTab("preview");
                }}
                disabled={!previewTemplate}
                className={`py-3 px-4 text-xs font-bold transition-all relative border-b-2 disabled:opacity-40 select-none ${
                  !previewTemplate
                    ? "border-transparent text-slate-600 cursor-not-allowed"
                    : modalTab === "preview"
                    ? "border-emerald-500 text-white bg-slate-900/40 cursor-pointer"
                    : "border-transparent text-slate-400 hover:text-slate-300 cursor-pointer"
                }`}
                id="btn-tab-modal-preview"
                title={previewTemplate ? `Pré-visualizar ${previewTemplate.filename}` : "Selecione um template antes de pré-visualizar"}
              >
                📝 Pré-visualização (.profile) {previewTemplate && `(${previewTemplate?.filename})`}
              </button>
            </div>

            {/* Quick Actions & Search Area */}
            {modalTab === "explore" && (
              <div className="p-4 bg-slate-950/40 border-b border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                {/* Search bar inside modal */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Pesquisar por comando (eg. firefox, node, code, composer)..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 pl-9 pr-4 py-2 text-xs text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-500 font-mono"
                    id="modal-search-field"
                  />
                  {modalSearch && (
                    <button
                      onClick={() => setModalSearch("")}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Blank profile option */}
                <button
                  onClick={handleCreateBlankProfile}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer justify-center shadow border border-slate-700"
                  id="btn-create-blank-inside-modal"
                  title="Criar um perfil limpo sem preset"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Criar do Zero (Sem Template)
                </button>
              </div>
            )}

            {/* Body partition */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative" id="modal-tab-body-container">
              {modalTab === "explore" ? (
                <>
                  {/* Remote fetching state loader screen inside the modal body */}
              {profileLoadingFilename && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4"></div>
                  <h3 className="text-sm font-bold text-slate-100">Baixando Regras Oficiais...</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm">
                    Acessando as regras originais de <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-450 font-mono">/etc/firejail/{profileLoadingFilename}</code> diretamente do repositório oficial do Firejail no GitHub...
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Mapeando parâmetros e importando sem perder nenhuma configuração específica!
                  </p>
                  <div className="text-[10px] text-slate-600 font-mono mt-4 animate-pulse">
                    Conectando ao GitHub API / CDN raw...
                  </div>
                </div>
              )}

              {/* Left pane: categories selector */}
              <div className="w-full md:w-64 bg-slate-950/20 md:border-r border-slate-850 p-2 overflow-y-auto space-y-1 scrollbar-thin shrink-0">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider p-2 block">Categorias</span>
                {[
                  { id: "All", label: "📁 Todos os Perfis (1200+)" },
                  { id: "CuratedOnly", label: "⭐ Perfis Curados de Destaque" },
                  { id: "Navegadores", label: "🌐 Navegadores Web" },
                  { id: "Comunicação", label: "💬 Chat & Comunicação" },
                  { id: "Desenvolvimento", label: "💻 Ferramentas & IDEs" },
                  { id: "Internet & Downloaders", label: "📥 Rede & Internet" },
                  { id: "Escritório & Mídia", label: "🎨 Escritório & Mídia" },
                  { id: "Utilitários, Jogos e Outros", label: "🛠️ Utilitários & Sistema" },
                  { id: "Developer Stacks (Tecnologias)", label: "⚡ Dev Stacks (Linguagens)" },
                  { id: "Fullstack & Grupos", label: "🔗 Stacks Agrupadas" }
                ].map((cat) => {
                  const isActive = modalCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setModalCategory(cat.id)}
                      className={`w-full text-left px-3 py-1.5 md:py-2 text-[11px] md:text-xs rounded transition-all cursor-pointer font-medium flex items-center justify-between ${
                        isActive
                          ? "bg-slate-800 text-white border-l-2 border-l-emerald-500 pl-2.5 font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                        {cat.id === "All" 
                          ? ALL_TEMPLATES.length 
                          : cat.id === "CuratedOnly"
                            ? SYSTEM_PROFILE_TEMPLATES.length
                            : ALL_TEMPLATES.filter(p => p.category === cat.id).length
                        }
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right pane: Profiles grid */}
              <div className="flex-1 p-4 md:p-5 overflow-y-auto bg-slate-950/30 scrollbar-thin">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
                  {(() => {
                    const filteredMatches = ALL_TEMPLATES.filter((p) => {
                      if (modalCategory === "CuratedOnly") {
                        const isHandCurated = SYSTEM_PROFILE_TEMPLATES.some(x => x.filename.toLowerCase() === p.filename.toLowerCase());
                        if (!isHandCurated) return false;
                      } else if (modalCategory !== "All" && p.category !== modalCategory) {
                        return false;
                      }
                      
                      if (modalSearch) {
                        const word = modalSearch.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(word) ||
                          p.filename.toLowerCase().includes(word) ||
                          p.program.toLowerCase().includes(word) ||
                          p.description.toLowerCase().includes(word) ||
                          p.category.toLowerCase().includes(word)
                        );
                      }
                      return true;
                    });

                    const slicedMatches = filteredMatches.slice(0, 100);
                    const hasMoreMatches = filteredMatches.length > 100;

                    if (filteredMatches.length === 0) {
                      return (
                        <div className="col-span-2 text-center py-12">
                          <p className="text-slate-500 text-xs italic">Nenhum perfil corresponde à sua busca.</p>
                          <button
                            onClick={() => { setModalSearch(""); setModalCategory("All"); }}
                            className="text-xs text-emerald-400 font-semibold underline mt-2 cursor-pointer"
                          >
                            Limpar pesquisa e filtros
                          </button>
                        </div>
                      );
                    }

                    return (
                      <>
                        {slicedMatches.map((p) => {
                          const isCurated = SYSTEM_PROFILE_TEMPLATES.some(x => x.filename.toLowerCase() === p.filename.toLowerCase());
                          return (
                            <div
                              key={p.filename}
                              onClick={() => handleLoadPreview(p)}
                              className={`p-3 bg-slate-900 hover:bg-slate-850 border rounded-lg cursor-pointer transition flex flex-col justify-between group h-full ${
                                p.attentionNeeded 
                                  ? "border-amber-950/50 hover:border-amber-600 bg-gradient-to-br from-slate-900 to-amber-955/5" 
                                  : isCurated
                                    ? "border-emerald-950/40 hover:border-emerald-500 bg-gradient-to-br from-slate-900 to-emerald-955/2"
                                    : "border-slate-850 hover:border-slate-700"
                              }`}
                              title="Clique para pré-visualizar as regras e validar antes de importar"
                            >
                              <div>
                                {/* Title block */}
                                <div className="flex items-start justify-between gap-1.5 mb-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="font-mono text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded truncate">
                                      {p.filename}
                                    </span>
                                    {p.attentionNeeded && (
                                      <span className="text-[8.5px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded shrink-0 flex items-center gap-0.5 uppercase tracking-wide">
                                        ⚠️ Atenção
                                      </span>
                                    )}
                                    {isCurated && !p.attentionNeeded && (
                                      <span className="text-[8.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded shrink-0 uppercase tracking-wide">
                                        curado ★
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-emerald-450 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0">
                                    Pré-visualizar &rarr;
                                  </span>
                                </div>

                                <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                                  {p.name}
                                </h4>
                                <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed">
                                  {p.description}
                                </p>
                              </div>

                              {/* Attention Reason */}
                              {p.attentionReason && (
                                <div className="mt-2.5 p-2 bg-amber-500/5 rounded border border-amber-500/10 text-[9.5px] text-amber-400/90 leading-snug">
                                  <strong>⚠️ Riscos / Atenção:</strong> {p.attentionReason}
                                </div>
                              )}

                              {/* Stack specifics if grouped */}
                              {p.customRawText && (
                                <div className="mt-2.5 p-2 bg-emerald-500/5 rounded border border-emerald-500/10 text-[9.5px] text-emerald-400/90 leading-snug">
                                  <strong>🔗 Importa múltiplos perfis:</strong> {p.customRawText.split("\n").filter(l => l.startsWith("include")).join(", ")}
                                </div>
                              )}
                              
                              <div className="mt-2.5 text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-950/20">
                                <span className="truncate">Caminho: /etc/firejail/{p.filename}</span>
                                <span className="text-[8.5px] text-slate-450 uppercase font-bold shrink-0 ml-1">
                                  {p.category.replace("Developer Stacks ", "").replace("Fullstack & ", "")}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {hasMoreMatches && (
                          <div className="col-span-1 md:col-span-2 p-3.5 bg-slate-900/60 rounded-xl border border-slate-850 text-center text-slate-400 text-xs">
                            Exibindo os primeiros <strong>100 de {filteredMatches.length} perfis</strong> correspondentes nesta categoria. 
                            Use a barra de busca acima para refinar e encontrar um perfil específico!
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
                </>
              ) : (
                /* Dedicated preview visualizer container */
                <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden w-full divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-slate-950/40">
                  {/* Left: Security parameters breakdown card */}
                  <div className="w-full md:w-85 p-4 md:p-5 overflow-y-auto space-y-4 shrink-0 bg-slate-900/40 scrollbar-thin flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded">
                            Ficha de Segurança
                          </span>
                          <span className="font-mono text-[9px] text-slate-500">etc/firejail/{previewTemplate?.filename}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white mt-1 uppercase tracking-wide">
                          {previewTemplate?.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                          {previewTemplate?.description}
                        </p>
                      </div>

                      {previewTemplate?.attentionReason && (
                        <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[11px] text-amber-400 font-sans leading-relaxed">
                          <strong className="block text-amber-300 mb-1">⚠️ Riscos / Atenção:</strong>
                          {previewTemplate?.attentionReason}
                        </div>
                      )}

                      {/* Security policy metrics derived directly from rules contents */}
                      <div className="space-y-2 pt-3 border-t border-slate-800">
                        <h5 className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider">Políticas Avaliadas</h5>
                        
                        <div className="space-y-1.5 text-[11px]">
                          {[
                            {
                              id: "seccomp",
                              label: "Filtro Seccomp",
                              active: previewContent.includes("seccomp"),
                              tooltip: "Bloqueia chamadas de sistema inseguras de kernel por padrão.",
                              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                              inactiveColor: "text-slate-500 bg-slate-950 border-slate-850"
                            },
                            {
                              id: "noroot",
                              label: "Isolar Superusuário (noroot)",
                              active: previewContent.includes("noroot") || !!previewTemplate?.settings?.noroot,
                              tooltip: "Garante que o aplicativo nunca possa escalar para root.",
                              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                              inactiveColor: "text-slate-500 bg-slate-950 border-slate-850"
                            },
                            {
                              id: "private-tmp",
                              label: "Diretório Tmp Privado",
                              active: previewContent.includes("private-tmp") || !!previewTemplate?.settings?.privateTmp,
                              tooltip: "/tmp isolado impede vazamento de IPC temporário.",
                              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                              inactiveColor: "text-slate-500 bg-slate-955 border-slate-850"
                            },
                            {
                              id: "private-dev",
                              label: "Dispositivos Isolados (private-dev)",
                              active: previewContent.includes("private-dev") || !!previewTemplate?.settings?.privateDev,
                              tooltip: "Restringe /dev físico e conexões de vídeo, áudio, usb extras.",
                              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                              inactiveColor: "text-slate-500 bg-slate-955 border-slate-850"
                            },
                            {
                              id: "private-home",
                              label: "Home Isolada (private)",
                              active: previewContent.includes("private ") || previewContent.includes("private\n") || !!previewTemplate?.settings?.privateHome,
                              tooltip: "A pasta Home real é oculta do aplicativo enclausurado.",
                              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                              inactiveColor: "text-slate-500 bg-slate-955 border-slate-850"
                            },
                            {
                              id: "nodbus",
                              label: "D-Bus Bloqueado (nodbus)",
                              active: previewContent.includes("nodbus"),
                              tooltip: "Previne comunicação socket e escalonamento lateral via D-Bus.",
                              color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                              inactiveColor: "text-slate-500 bg-slate-950 border-slate-850"
                            },
                            {
                              id: "net-none",
                              label: "Namespace de Rede Isolado",
                              active: previewContent.includes("net none") || previewTemplate?.settings?.netBridge === "none",
                              tooltip: "Dispositivo rodará totalmente offline sem interfaces externas.",
                              color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                              inactiveColor: "text-slate-500 bg-slate-950 border-slate-850"
                            }
                          ].map((pol) => (
                            <div 
                              key={pol.id}
                              className={`flex items-center justify-between p-2 rounded-lg border leading-tight ${
                                pol.active ? pol.color : pol.inactiveColor
                              }`}
                              title={pol.tooltip}
                            >
                              <span>{pol.label}</span>
                              <span className="font-semibold text-[10px]">
                                {pol.active ? "ATIVO ✅" : "NÃO INCLUSO"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-850">
                      <p className="text-[10px] text-slate-505 leading-relaxed font-mono">
                        * Parâmetros estruturados e identificados por rastreio sintático do compilador interno.
                      </p>
                    </div>
                  </div>

                  {/* Right: Code editor simulator panel */}
                  <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-950">
                    {/* Header bar */}
                    <div className="bg-slate-950/80 px-4 py-2.5 text-[10.5px] font-mono text-slate-400 border-b border-slate-800 flex items-center justify-between shrink-0">
                      <span className="flex items-center gap-1.5 text-slate-350">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        /etc/firejail/{previewTemplate?.filename} ({previewContent.split("\n").length} linhas)
                      </span>
                      <span className="text-slate-500 select-none">ReadOnly • Sintaxe Construtor</span>
                    </div>

                    {/* Live code block containing syntax custom highlight renderer */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-900/10 font-mono text-xs leading-relaxed select-text select-all whitespace-pre scrollbar-thin scrollbar-track-transparent">
                      {isPreviewLoading ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950">
                          <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4"></div>
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Sincronizando arquivo do repositório upstream...</h4>
                        </div>
                      ) : (
                        <div className="grid grid-cols-[30px_1fr] gap-4 min-w-0">
                          {/* Line Numbers Column */}
                          <div className="text-slate-650 text-right select-none pr-3 border-r border-slate-850 font-mono text-[10.5px]">
                            {previewContent.split("\n").map((_, idx) => (
                              <div key={idx} className="h-5">{idx + 1}</div>
                            ))}
                          </div>
                          {/* Code Lines Container */}
                          <div className="text-slate-200 select-text overflow-x-auto font-mono text-[11px]">
                            {previewContent.split("\n").map((line, idx) => (
                              <div key={idx} className="h-5">{highlightProfileLine(line)}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom confirm footer block */}
                    <div className="p-4 bg-slate-900 border-t border-slate-850 flex items-center justify-between shrink-0">
                      <button
                        type="button"
                        onClick={() => setModalTab("explore")}
                        className="px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-800 transition cursor-pointer"
                      >
                        &larr; Voltar para a Busca
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 mr-2 font-sans hidden lg:block">
                          Validação de sintaxe Firejail concluída com sucesso.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleConfirmImport(previewTemplate, previewContent)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-lg flex items-center gap-1.5 font-sans transition shadow-md hover:shadow-emerald-500/10 cursor-pointer"
                        >
                          Confirmar e Importar Perfil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer and credit line */}
      <footer className="mt-auto bg-slate-900 border-t border-slate-800 py-3 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Firejail UI Sandbox Studio</span>
            <span className="text-slate-700">•</span>
            <span>Confinamento e segurança de processos Linux</span>
            <Heart className="w-3 h-3 text-red-500 fill-current" />
          </div>
          <span className="font-mono text-[10px] text-slate-600">v0.9.80 &copy; 2026</span>
        </div>
      </footer>
    </div>
  );
}
