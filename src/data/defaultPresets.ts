/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FirejailProfile } from "../types";

export const DEFAULT_PRESETS: FirejailProfile[] = [
  {
    id: "preset-firefox",
    name: "Navegador Web Firefox",
    description: "Nivel de isolamento alto ideal para navegar na internet. Bloqueia o acesso a arquivos locais e limita o acesso de rede apenas ao necessario, com seccomp ativo.",
    program: "firefox",
    arguments: "https://google.com",
    icon: "Globe",
    isPreset: true,
    
    // Configurações
    sandboxName: "firefox-jail",
    privateHome: true,
    privateHomeDir: "",
    privateCache: true,
    privateDev: true,
    privateTmp: true,
    
    blacklistPaths: [
      "~/Documents",
      "~/Pictures",
      "~/Downloads/private_keys",
      "~/.ssh",
      "~/.gnupg"
    ],
    
    dnsServers: ["8.8.8.8", "1.1.1.1"],
    allusers: false,
    
    // Security
    seccompEnabled: true,
    seccompBlockSecondary: true,
    nonewprivs: true,
    noroot: true,
    memoryDenyWriteExecute: true,
    
    // Devices
    noSound: false,
    noVideo: false,
    no3d: false,
    noInput: false,
    nodbus: false,
    
    x11Mode: "xorg"
  },
  {
    id: "preset-vlc",
    name: "Reprodutor de Midia VLC",
    description: "Isolamento focado em reprodução de videos e musicas. Restringe totalmente o acesso a rede e pastas sensiveis do sistema, apenas permitindo acesso a pasta de Videos e Musicas.",
    program: "vlc",
    arguments: "~/Videos/tutorial.mp4",
    icon: "Video",
    isPreset: true,

    sandboxName: "vlc-jail",
    privateCache: true,
    privateDev: true,
    privateTmp: true,
    
    // No networking at all!
    ipAddress: "none",
    netBridge: "none",
    
    readOnlyPaths: [
      "~"
    ],
    whitelistPaths: [
      "~/Videos",
      "~/Music"
    ],
    blacklistPaths: [
      "~/.ssh",
      "~/Documents"
    ],

    seccompEnabled: true,
    seccompDrop: ["mount", "umount2", "ptrace"],
    capsDropAll: true,
    capsEnabled: true,
    nonewprivs: true,
    noroot: true,
    
    noSound: false, // VLC need sound
    noVideo: false,
    nodbus: true,
    noInput: false,
    
    x11Mode: "xorg"
  },
  {
    id: "preset-transmission",
    name: "Transmission Torrent Client",
    description: "Sandbox restrita para torrents. Permite downloads apenas no diretorio especifico de Downloads, bloqueia o restante da home e limita banda de rede.",
    program: "transmission-gtk",
    arguments: "",
    icon: "DownloadCloud",
    isPreset: true,

    sandboxName: "transmission-jail",
    privateCache: true,
    privateDev: true,
    privateTmp: true,
    
    whitelistPaths: [
      "~/Downloads"
    ],
    blacklistPaths: [
      "~/Documents",
      "~/Pictures",
      "~/.ssh",
      "~/Videos"
    ],

    dnsServers: ["9.9.9.9"],
    netStats: true,
    
    seccompEnabled: true,
    nonewprivs: true,
    noroot: true,
    capsDropAll: true,
    
    noSound: true,
    noVideo: true,
    nodbus: true,
    x11Mode: "xorg"
  },
  {
    id: "preset-untrusted",
    name: "Script Python/Node Suspeito",
    description: "Perfil blindado para testar ferramentas ou scripts baixados da internet de fontes não confiaveis. Sem rede, sem sistema de arquivos real (Home temporaria) e syscalls bloqueadas.",
    program: "python3",
    arguments: "malicious_check.py",
    icon: "Terminal",
    isPreset: true,

    sandboxName: "untrusted-script-jail",
    timeout: "00:05:00", // 5 minutes max runtime
    privateHome: true, // completely empty home tempfs
    privateCache: true,
    privateDev: true,
    privateTmp: true,
    
    ipAddress: "none", // No internet
    netBridge: "none",
    
    seccompEnabled: true,
    seccompSyscalls: ["socket", "connect", "bind", "listen"], // Block socket calls!
    capsDropAll: true,
    capsEnabled: true,
    restrictNamespacesEnabled: true,
    nonewprivs: true,
    noroot: true,
    
    noSound: true,
    noVideo: true,
    noInput: true,
    no3d: true,
    nodbus: true,
    x11Mode: ""
  },
  {
    id: "preset-discord",
    name: "Discord Sandbox",
    description: "Isolamento para mensageiros eletrônicos. Permite audio e video mas isola caminhos sensiveis da home e chaves SSH.",
    program: "discord",
    arguments: "",
    icon: "MessageSquare",
    isPreset: true,

    sandboxName: "discord-jail",
    privateCache: true,
    privateTmp: true,
    
    blacklistPaths: [
      "~/.ssh",
      "~/.gnupg",
      "~/Documents/Passwords"
    ],

    seccompEnabled: true,
    nonewprivs: true,
    noroot: true,
    
    noSound: false,
    noVideo: false,
    noInput: false,
    nodbus: false,
    x11Mode: "xorg"
  }
];

export const AVAILABLE_SYSCALLS = [
  "socket", "connect", "accept", "bind", "listen", "sendto", "recvfrom",
  "execve", "fork", "vfork", "clone", "ptrace", "syslog", "setuid",
  "setgid", "chroot", "mount", "umount2", "reboot", "swapon", "swapoff",
  "init_module", "delete_module", "open", "read", "write", "close", "kill",
  "mmap", "mprotect", "munmap", "brk", "rt_sigaction", "ioctl"
];

export const AVAILABLE_CAPABILITIES = [
  "CAP_AUDIT_CONTROL", "CAP_AUDIT_READ", "CAP_AUDIT_WRITE", "CAP_BLOCK_SUSPEND",
  "CAP_CHOWN", "CAP_DAC_OVERRIDE", "CAP_DAC_READ_SEARCH", "CAP_FOWNER",
  "CAP_FSETID", "CAP_IPC_LOCK", "CAP_IPC_OWNER", "CAP_KILL", "CAP_LEASE",
  "CAP_LINUX_IMMUTABLE", "CAP_MAC_ADMIN", "CAP_MAC_OVERRIDE", "CAP_MKNOD",
  "CAP_NET_ADMIN", "CAP_NET_BIND_SERVICE", "CAP_NET_BROADCAST", "CAP_NET_RAW",
  "CAP_SETGID", "CAP_SETFCAP", "CAP_SETPCAP", "CAP_SETUID", "CAP_SYS_ADMIN",
  "CAP_SYS_BOOT", "CAP_SYS_CHROOT", "CAP_SYS_MODULE", "CAP_SYS_NICE",
  "CAP_SYS_PACCT", "CAP_SYS_PTRACE", "CAP_SYS_RAWIO", "CAP_SYS_RESOURCE",
  "CAP_SYS_TIME", "CAP_SYS_TTY_CONFIG", "CAP_SYSLOG", "CAP_WAKE_ALARM"
];
