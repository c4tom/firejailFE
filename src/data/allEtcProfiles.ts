import { FirejailProfile } from "../types";

export interface SystemProfileTemplate {
  filename: string;
  name: string;
  program: string;
  description: string;
  category: "Navegadores" | "Comunicação" | "Desenvolvimento" | "Internet & Downloaders" | "Escritório & Mídia" | "Utilitários, Jogos e Outros" | "Developer Stacks (Tecnologias)" | "Fullstack & Grupos";
  attentionNeeded: boolean;
  attentionReason?: string;
  icon: string;
  // Firejail settings mapped
  settings: Partial<FirejailProfile>;
  // Custom Raw .profile body
  customRawText?: string;
}

export const SYSTEM_PROFILE_TEMPLATES: SystemProfileTemplate[] = [
  // ==================== NAVEGADORES (1-12) ====================
  {
    filename: "firefox.profile",
    name: "Mozilla Firefox",
    program: "firefox",
    description: "Navegador web estável com isolamento robusto de home e seccomp habilitado.",
    category: "Navegadores",
    attentionNeeded: true,
    attentionReason: "Necessita de acesso à rede, áudio, vídeo e aceleração 3D. Risco médio devido à execução de JavaScript nocivo em páginas web.",
    icon: "Globe",
    settings: {
      privateHome: true,
      privateCache: true,
      privateTmp: true,
      privateDev: true,
      seccompEnabled: true,
      nonewprivs: true,
      noroot: true,
      noSound: false,
      noVideo: false,
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents"]
    }
  },
  {
    filename: "google-chrome.profile",
    name: "Google Chrome",
    program: "google-chrome",
    description: "Navegador proprietário do Google com restrições de sandbox nativo + Firejail.",
    category: "Navegadores",
    attentionNeeded: true,
    attentionReason: "Carrega chaves do sistema de senhas nativo (gnome-keyring) e ampla rede pública.",
    icon: "Globe",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      nonewprivs: true,
      noroot: true,
      noSound: false,
      noVideo: false,
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents", "~/Pictures"]
    }
  },
  {
    filename: "brave.profile",
    name: "Brave Browser",
    program: "brave",
    description: "Navegador focado em privacidade, bloqueador de anúncios nativo pré-instalado.",
    category: "Navegadores",
    attentionNeeded: true,
    attentionReason: "Ampla necessidade de rede, WebTorrent e plugins de criptomoedas herdados do Chromium.",
    icon: "Globe",
    settings: {
      privateHome: true,
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      nonewprivs: true,
      noroot: true,
      blacklistPaths: ["~/.ssh", "~/.gnupg"]
    }
  },
  {
    filename: "chromium.profile",
    name: "Chromium",
    program: "chromium",
    description: "A versão open-source que serve de base para o Google Chrome. Bastante modular.",
    category: "Navegadores",
    attentionNeeded: false,
    icon: "Globe",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      nonewprivs: true,
      noroot: true
    }
  },
  {
    filename: "opera.profile",
    name: "Opera Browser",
    program: "opera",
    description: "Navegador Opera com recursos integrados de VPN gratuita e carteiras digitais.",
    category: "Navegadores",
    attentionNeeded: true,
    attentionReason: "Serviço de VPN proprietária embutido que túneis tráfego de rede.",
    icon: "Globe",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      nonewprivs: true,
      noroot: true,
      noSound: false
    }
  },
  {
    filename: "vivaldi.profile",
    name: "Vivaldi",
    program: "vivaldi",
    description: "Navegador de alta personalização visual baseado no Chromium.",
    category: "Navegadores",
    attentionNeeded: false,
    icon: "Globe",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      nonewprivs: true,
      noroot: true
    }
  },
  {
    filename: "tor-browser.profile",
    name: "Tor Browser",
    program: "tor-browser",
    description: "Isolamento extremo do Tor. Roteia todo tráfego pela rede anônima onion.",
    category: "Navegadores",
    attentionNeeded: true,
    attentionReason: "Forte mitigação de fingerprinting físico. Altas restrições locais de caminhos e IPC do sistema.",
    icon: "Globe",
    settings: {
      privateHome: true,
      privateCache: true,
      privateTmp: true,
      privateDev: true,
      seccompEnabled: true,
      nonewprivs: true,
      noroot: true,
      ipAddress: "any",
      blacklistPaths: ["~"] // Isolamento completo do host
    }
  },
  {
    filename: "waterfox.profile",
    name: "Waterfox",
    program: "waterfox",
    description: "Fork do Firefox otimizado para sistemas de 64 bits modernos.",
    category: "Navegadores",
    attentionNeeded: false,
    icon: "Globe",
    settings: {
      privateHome: true,
      privateTmp: true,
      seccompEnabled: true,
      nonewprivs: true,
      noroot: true
    }
  },
  {
    filename: "pale-moon.profile",
    name: "Pale Moon",
    program: "pale-moon",
    description: "Navegador leve baseado na engine Goanna clássica do Firefox.",
    category: "Navegadores",
    attentionNeeded: false,
    icon: "Globe",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      nonewprivs: true
    }
  },
  {
    filename: "epiphany.profile",
    name: "GNOME Web (Epiphany)",
    program: "epiphany",
    description: "Navegador padrão do ambiente de desktop GNOME, limpo e integrado.",
    category: "Navegadores",
    attentionNeeded: false,
    icon: "Globe",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      nonewprivs: true
    }
  },
  {
    filename: "falkon.profile",
    name: "Falkon",
    program: "falkon",
    description: "Navegador web do KDE que utiliza a engine de renderização QtWebEngine.",
    category: "Navegadores",
    attentionNeeded: false,
    icon: "Globe",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      nonewprivs: true
    }
  },
  {
    filename: "midori.profile",
    name: "Midori",
    program: "midori",
    description: "Navegador web leve e rápido, ideal para máquinas com hardware limitado.",
    category: "Navegadores",
    attentionNeeded: false,
    icon: "Globe",
    settings: {
      privateHome: true,
      seccompEnabled: true
    }
  },

  // ==================== COMUNICAÇÃO (13-24) ====================
  {
    filename: "discord.profile",
    name: "Discord Desktop",
    program: "discord",
    description: "Isolamento para o aplicativo nativo Discord Electron.",
    category: "Comunicação",
    attentionNeeded: true,
    attentionReason: "Requer áudio do microfone e acesso à webcam do sistema, além de scanner na rede local de outros aparelhos.",
    icon: "MessageSquare",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      noroot: true,
      noSound: false,
      noVideo: false,
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents"]
    }
  },
  {
    filename: "slack.profile",
    name: "Slack",
    program: "slack",
    description: "Isolamento seguro para o cliente de trabalho corporativo Slack.",
    category: "Comunicação",
    attentionNeeded: true,
    attentionReason: "Frecuentemente compartilha arquivos confidenciais do trabalho e possui integração de áudio/câmera.",
    icon: "MessageSquare",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      noroot: true,
      noSound: false,
      noVideo: false,
      blacklistPaths: ["~/.ssh", "~/.gnupg"]
    }
  },
  {
    filename: "telegram.profile",
    name: "Telegram Desktop",
    program: "telegram-desktop",
    description: "Perfil focado em proteger os downloads locais de anexos executados por engano.",
    category: "Comunicação",
    attentionNeeded: true,
    attentionReason: "Downloads automáticos de mídia e arquivos executáveis remotos suspeitos.",
    icon: "MessageSquare",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      noroot: true,
      whitelistPaths: ["~/Downloads/Telegram Desktop"],
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents", "/etc/shadow"]
    }
  },
  {
    filename: "signal-desktop.profile",
    name: "Signal Desktop",
    program: "signal-desktop",
    description: "Sandbox rígida com criptografia ponta a ponta e exclusão de rastreamento local.",
    category: "Comunicação",
    attentionNeeded: true,
    attentionReason: "Mitigação extrema para conversas estritamente confidenciais e contatos pessoais.",
    icon: "MessageSquare",
    settings: {
      privateHome: true,
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      nonewprivs: true,
      noroot: true,
      noSound: false,
      noVideo: false,
      blacklistPaths: ["~/.ssh", "~/.gnupg"]
    }
  },
  {
    filename: "skype.profile",
    name: "Skype Desktop",
    program: "skypeforlinux",
    description: "Isolamento do cliente clássico Skype da Microsoft.",
    category: "Comunicação",
    attentionNeeded: true,
    attentionReason: "Aplicativo proprietário que realiza escaneamentos em planos de fundo no host Linux.",
    icon: "MessageSquare",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      noroot: true,
      noSound: false,
      noVideo: false,
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents"]
    }
  },
  {
    filename: "zoom.profile",
    name: "Zoom client",
    program: "zoom",
    description: "Perfil blindado para o cliente de conferências Zoom.",
    category: "Comunicação",
    attentionNeeded: true,
    attentionReason: "Histórico de comportamentos intrusivos de execução de processos remotos no GNU/Linux.",
    icon: "Video",
    settings: {
      privateTmp: true,
      privateCache: true,
      seccompEnabled: true,
      noroot: true,
      noSound: false,
      noVideo: false,
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents", "~/Pictures"]
    }
  },
  {
    filename: "teams.profile",
    name: "Microsoft Teams",
    program: "teams",
    description: "Sandbox de proteção para o Teams e suas chamadas integradas de videoconferência.",
    category: "Comunicação",
    attentionNeeded: true,
    attentionReason: "Proprietário. Elevado consumo de memória e processos secundários de telemetria.",
    icon: "MessageSquare",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      noroot: true,
      noSound: false,
      noVideo: false
    }
  },
  {
    filename: "element.profile",
    name: "Element (Matrix)",
    program: "element-desktop",
    description: "Isolador para o cliente federado oficial do ecossistema Matrix.",
    category: "Comunicação",
    attentionNeeded: false,
    icon: "MessageSquare",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "hexchat.profile",
    name: "HexChat (IRC)",
    program: "hexchat",
    description: "Configuração segura para canais clássicos IRC sem vazar IPs locais e nem chaves.",
    category: "Comunicação",
    attentionNeeded: false,
    icon: "MessageSquare",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      noroot: true,
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "pidgin.profile",
    name: "Pidgin Instant Messenger",
    program: "pidgin",
    description: "Simples, leve e multicliente de chat instantâneo de protocolos de rede clássicos.",
    category: "Comunicação",
    attentionNeeded: false,
    icon: "MessageSquare",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "thunderbird.profile",
    name: "Thunderbird Mail",
    program: "thunderbird",
    description: "Bloqueia acesso a anexos baixados à home, evita execução perigosa de PDFs.",
    category: "Escritório & Mídia",
    attentionNeeded: true,
    attentionReason: "Mapeia todos os e-mails criptografados localmente. Vulnerabilidade a exploits de PDF embutidos e links externos.",
    icon: "Layers",
    settings: {
      privateCache: true,
      seccompEnabled: true,
      noroot: true,
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents/Passwords"]
    }
  },
  {
    filename: "evolution.profile",
    name: "Evolution Mail",
    program: "evolution",
    description: "Cliente de correio eletrônico completo com calendário do ambiente GNOME.",
    category: "Comunicação",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateCache: true,
      seccompEnabled: true,
      noroot: true
    }
  },

  // ==================== DESENVOLVIMENTO & IDES (25-42) ====================
  {
    filename: "code.profile",
    name: "VS Code / VSCodium",
    program: "code",
    description: "Ambiente sandbox para desenvolvimento seguro. Isola pastas sensíveis enquanto permite terminal e compiladores.",
    category: "Desenvolvimento",
    attentionNeeded: true,
    attentionReason: "Roda extensões arbitrárias que podem varrer a pasta Home do desenvolvedor em segundo plano.",
    icon: "Terminal",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents/Passwords", "/etc/shadow"],
      readOnlyPaths: ["/usr/bin", "/usr/lib"]
    }
  },
  {
    filename: "sublime-text.profile",
    name: "Sublime Text",
    program: "sublime_text",
    description: "Perfil restrito para o Sublime Text no desenvolvimento ágil.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh", "~/Documents/Passwords"]
    }
  },
  {
    filename: "vim.profile",
    name: "Vim Editor",
    program: "vim",
    description: "Editor clássico no terminal. Restringe execuções de comandos arbitrários por scripts maliciosos de terceiros.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateCache: true,
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh", "~/.gnupg"],
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "neovim.profile",
    name: "Neovim (nvim)",
    program: "nvim",
    description: "Moderno fork do vim com lua embutido. Sandbox reduz riscos de plugins de terceiros colhidos pelo packer/lazy.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateCache: true,
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh", "~/.gnupg"],
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "emacs.profile",
    name: "GNU Emacs",
    program: "emacs",
    description: "Extensível editor de texto GNU. Contém isolamento contra subprocessos não solicitados de dialetos lisp.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateCache: true,
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh"]
    }
  },
  {
    filename: "gedit.profile",
    name: "Gedit Editor",
    program: "gedit",
    description: "Editor de texto gráfico básico do ambiente GNOME.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateHome: true,
      privateTmp: true,
      seccompEnabled: true
    }
  },
  {
    filename: "kate.profile",
    name: "Kate Advanced Editor",
    program: "kate",
    description: "Poderoso editor de código multi-documento do sistema de desktop KDE.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateCache: true,
      seccompEnabled: true
    }
  },
  {
    filename: "nano.profile",
    name: "Nano",
    program: "nano",
    description: "Fácil e clássico editor de texto puramente interativo no terminal.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      seccompEnabled: true,
      noroot: true,
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "git.profile",
    name: "Git VCS Tool",
    program: "git",
    description: "Sandbox rígida para rodar Git Clone em repositórios desconhecidos do GitHub de fontes duvidosas.",
    category: "Desenvolvimento",
    attentionNeeded: true,
    attentionReason: "Gatilhos post-checkout e hooks automáticos podem disparar scripts ocultos no computador host.",
    icon: "Terminal",
    settings: {
      privateTmp: true,
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh/id_rsa", "~/.ssh/id_ed25519", "~/.gnupg"]
    }
  },
  {
    filename: "mysql-cli.profile",
    name: "MySQL CLI client",
    program: "mysql",
    description: "Isolamento do utilitário de terminal interativo do MySQL para desenvolvimento local de banco de dados.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "postgresql-cli.profile",
    name: "PostgreSQL CLI (psql)",
    program: "psql",
    description: "Interação segura de banco de dados isolando arquivos locais e chaves.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      noSound: true
    }
  },
  {
    filename: "redis-cli.profile",
    name: "Redis CLI",
    program: "redis-cli",
    description: "Isola conexões de rede em loopback e veda a home na verificação de tabelas locais.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateHome: true,
      seccompEnabled: true
    }
  },
  {
    filename: "sqlite3.profile",
    name: "SQLite3 Console",
    program: "sqlite3",
    description: "Sandbox total de banco de dados SQL baseado em um arquivo local único. Rede desligada por completo.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      ipAddress: "none",
      netBridge: "none",
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "docker-cli.profile",
    name: "Docker Client CLI",
    program: "docker",
    description: "Veda acessos locais a chaves privadas enquanto gerencia instâncias e imagens e contêineres remotos.",
    category: "Desenvolvimento",
    attentionNeeded: true,
    attentionReason: "Acesso ao socket do Docker (/var/run/docker.sock) garante privilégios completos de administrador (root) no host Linux.",
    icon: "Terminal",
    settings: {
      blacklistPaths: ["~/.ssh", "~/.gnupg"],
      seccompEnabled: true
    }
  },
  {
    filename: "podman.profile",
    name: "Podman Container tool",
    program: "podman",
    description: "Gerenciador sem root nativo de contêineres com restrição de visibilidade da home.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh"]
    }
  },
  {
    filename: "netbeans.profile",
    name: "Apache NetBeans",
    program: "netbeans",
    description: "Ambiente completo de desenvolvimento integrado Java modular.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateCache: true,
      seccompEnabled: true
    }
  },
  {
    filename: "eclipse.profile",
    name: "Eclipse IDE",
    program: "eclipse",
    description: "Clássico ambiente corporativo IDE para engenharia de software rápida.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateCache: true,
      seccompEnabled: true
    }
  },
  {
    filename: "intellij.profile",
    name: "IntelliJ IDEA Community",
    program: "idea",
    description: "Poderosa IDE JVM que necessita de visibilidade controlada de diretórios de projetos.",
    category: "Desenvolvimento",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateCache: true,
      blacklistPaths: ["~/.ssh"]
    }
  },

  // ==================== INTERNET & DOWNLOADERS (43-60) ====================
  {
    filename: "transmission-gtk.profile",
    name: "Transmission Torrent",
    program: "transmission-gtk",
    description: "Confinamento para downloads bittorrent restritos a pasta de Downloads.",
    category: "Internet & Downloaders",
    attentionNeeded: true,
    attentionReason: "Mapeamento intensivo de conexões Peer-to-Peer de centenas de IPs aleatórios da internet.",
    icon: "DownloadCloud",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/Downloads"],
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents", "~/Pictures"],
      seccompEnabled: true,
      nonewprivs: true,
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "qbittorrent.profile",
    name: "qBittorrent client",
    program: "qbittorrent",
    description: "Isolamento avançado de torrent com whitelist obrigatória e rede dedicada.",
    category: "Internet & Downloaders",
    attentionNeeded: true,
    attentionReason: "Altas taxas de conexões de entrada de peers. O processo pode tentar explorar o uPnP do roteador.",
    icon: "DownloadCloud",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/Downloads"],
      blacklistPaths: ["~/.ssh", "~/Documents", "~/Pictures", "/etc/shadow"],
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "deluge.profile",
    name: "Deluge Torrent",
    program: "deluge",
    description: "Cliente bittorrent leve escrito em Python.",
    category: "Internet & Downloaders",
    attentionNeeded: false,
    icon: "DownloadCloud",
    settings: {
      privateHome: true,
      whitelistPaths: ["~/Downloads"],
      seccompEnabled: true
    }
  },
  {
    filename: "curl.profile",
    name: "Curl Utility",
    program: "curl",
    description: "Isola chamadas Curl no terminal para evitar que scripts executados remotamente consigam ler a Home ou dados sensíveis.",
    category: "Internet & Downloaders",
    attentionNeeded: true,
    attentionReason: "Utilizado por quase todos os instaladores 'curl | sh' para rodar scripts em segundo plano.",
    icon: "Terminal",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      noroot: true,
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "wget.profile",
    name: "Wget Utility",
    program: "wget",
    description: "Simples utilitário de terminal para baixar arquivos. Completo isolamento de disco local.",
    category: "Internet & Downloaders",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "filezilla.profile",
    name: "FileZilla FTP client",
    program: "filezilla",
    description: "Veda acesso a chaves privadas e arquivos locais do usuário enquanto realiza conexões FTP/SFTP.",
    category: "Internet & Downloaders",
    attentionNeeded: true,
    attentionReason: "Contém credenciais e senhas salvas de servidores em arquivos XML lidos em plain-text.",
    icon: "Layers",
    settings: {
      privateTmp: true,
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh", "~/Documents/Passwords"]
    }
  },
  {
    filename: "nmap.profile",
    name: "Nmap Network Scanner",
    program: "nmap",
    description: "Estatísticas e varredura de sockets. Reduz as permissões de escaneamento para que ele não consiga espionar locais.",
    category: "Internet & Downloaders",
    attentionNeeded: true,
    attentionReason: "Envia pacotes RAW na rede e interage intimamente com a pilha TCP/IP do kernel local.",
    icon: "Terminal",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      capsEnabled: true,
      capsDropAll: false // Nmap precisa de CAP_NET_RAW para varreduras syn
    }
  },
  {
    filename: "wireshark.profile",
    name: "Wireshark Packet Analyzer",
    program: "wireshark",
    description: "Análise avançada de tráfego de redes. Extremamente recomendado isolamento de processo gráfico.",
    category: "Internet & Downloaders",
    attentionNeeded: true,
    attentionReason: "Contém parseadores de protocolos gigantescos que processam dados brutos da rede, suscetíveis a overflows.",
    icon: "Activity",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      capsEnabled: true,
      nonewprivs: true
    }
  },
  {
    filename: "ssh.profile",
    name: "SSH client",
    program: "ssh",
    description: "Configuração para que conexões SSH de saída não tenham seu fluxo seqüestrado para leitura de arquivos locais.",
    category: "Internet & Downloaders",
    attentionNeeded: true,
    attentionReason: "Usa chaves criptográficas secretas para identificação remota a servidores confiáveis.",
    icon: "Terminal",
    settings: {
      seccompEnabled: true,
      blacklistPaths: ["~/Documents", "~/Pictures", "/etc/shadow"],
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "rsync.profile",
    name: "Rsync Tool",
    program: "rsync",
    description: "Isola sincronizações de arquivos em diretórios dedicados.",
    category: "Internet & Downloaders",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "links.profile",
    name: "Links (CLI Browser)",
    program: "links",
    description: "Navegador de internet em modo de texto ultrarápido no terminal.",
    category: "Internet & Downloaders",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "lynx.profile",
    name: "Lynx (CLI Browser)",
    program: "lynx",
    description: "O mais antigo navegador CLI de modo texto, altamente restrito localmente.",
    category: "Internet & Downloaders",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateHome: true,
      seccompEnabled: true
    }
  },
  {
    filename: "mutt.profile",
    name: "Mutt (CLI Mail Client)",
    program: "mutt",
    description: "Gerenciador CLI clássico para recebimento e leitura de e-mails de servidores IMAP/POP.",
    category: "Internet & Downloaders",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateHome: true,
      seccompEnabled: true
    }
  },
  {
    filename: "rtorrent.profile",
    name: "rTorrent client",
    program: "rtorrent",
    description: "Cliente bittorrent CLI robusto e de altíssima performance para servidores Linux.",
    category: "Internet & Downloaders",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      whitelistPaths: ["~/Downloads"],
      seccompEnabled: true
    }
  },
  {
    filename: "irssi.profile",
    name: "Irssi IRC client",
    program: "irssi",
    description: "Tradicional cliente de IRC interativo focado no minimalismo no terminal.",
    category: "Internet & Downloaders",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateHome: true,
      seccompEnabled: true
    }
  },
  {
    filename: "aria2c.profile",
    name: "Aria2 multithread loader",
    program: "aria2c",
    description: "Acelera downloads de múltiplas fontes simultaneamente, isolando o sistema host.",
    category: "Internet & Downloaders",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateHome: true,
      whitelistPaths: ["~/Downloads"],
      seccompEnabled: true
    }
  },
  {
    filename: "openvpn.profile",
    name: "OpenVPN Client",
    program: "openvpn",
    description: "Sandbox especial para criação de túneis virtuais VPN.",
    category: "Internet & Downloaders",
    attentionNeeded: true,
    attentionReason: "Requer privilégios administrativos de rede (CAP_NET_ADMIN) para criar dispositivos virtuais TUN/TAP.",
    icon: "Globe",
    settings: {
      seccompEnabled: true,
      capsEnabled: true,
      capsDropAll: false // Requer privilégio de admin de rede
    }
  },
  {
    filename: "wireguard.profile",
    name: "WireGuard client tools",
    program: "wg-quick",
    description: "Configuração restrita de conexão ràpida de Wireguard.",
    category: "Internet & Downloaders",
    attentionNeeded: true,
    attentionReason: "Manipula rotas de rede globais da máquina principal.",
    icon: "Globe",
    settings: {
      seccompEnabled: true,
      capsEnabled: true
    }
  },

  // ==================== ESCRITÓRIO & MÍDIA (61-80) ====================
  {
    filename: "libreoffice.profile",
    name: "LibreOffice Suite",
    program: "libreoffice",
    description: "Isola aplicativos do LibreOffice (Writer, Calc) de acessar caminhos de rede e outros.",
    category: "Escritório & Mídia",
    attentionNeeded: true,
    attentionReason: "Acesso a chaves locais por ataques de macros maliciosas embutidas em planilhas/documentos.",
    icon: "Layers",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      noroot: true,
      ipAddress: "none", // Libreoffice não precisa de internet
      netBridge: "none",
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Pictures", "~/Videos"]
    }
  },
  {
    filename: "gimp.profile",
    name: "GIMP Image Editor",
    program: "gimp",
    description: "Perfil clássico para o GNU Image Manipulation Program.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateCache: true,
      whitelistPaths: ["~/Pictures"],
      blacklistPaths: ["~/.ssh", "~/Documents"],
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "inkscape.profile",
    name: "Inkscape",
    program: "inkscape",
    description: "Isolador seguro para editor de gráficos vetoriais SVG.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateCache: true,
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "scribus.profile",
    name: "Scribus Desktop Publishing",
    program: "scribus",
    description: "Edição de jornais e diagramação estritamente offline.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateHome: true,
      seccompEnabled: true
    }
  },
  {
    filename: "evince.profile",
    name: "Evince PDF Reader",
    program: "evince",
    description: "Leitor de PDF oficial do GNOME. Rede desligada. Evita payloads rce em malwares embarcados em PDFs.",
    category: "Escritório & Mídia",
    attentionNeeded: true,
    attentionReason: "PDFs podem disparar execuções de exploits de memória em interpretadores antigos.",
    icon: "BookOpen",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      noroot: true,
      ipAddress: "none", // PDF offline
      netBridge: "none",
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "okular.profile",
    name: "Okular Document Viewer",
    program: "okular",
    description: "Leitor universal de documentos do KDE em sandbox restrita offline.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "BookOpen",
    settings: {
      privateHome: true,
      ipAddress: "none",
      seccompEnabled: true
    }
  },
  {
    filename: "calibre.profile",
    name: "Calibre Ebook Manager",
    program: "calibre",
    description: "Gerenciador abrangente de livros digitais e ePUBs.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "BookOpen",
    settings: {
      privateHome: true,
      seccompEnabled: true
    }
  },
  {
    filename: "zotero.profile",
    name: "Zotero Reference Manager",
    program: "zotero",
    description: "Ferramenta de pesquisa científica e catalogação bibliográfica.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "BookOpen",
    settings: {
      privateCache: true,
      seccompEnabled: true
    }
  },
  {
    filename: "audacity.profile",
    name: "Audacity Audio Editor",
    program: "audacity",
    description: "Edição de som multipista. Isola gravação de microfones locais e internet desabilitada.",
    category: "Escritório & Mídia",
    attentionNeeded: true,
    attentionReason: "Grava áudio do microfone físico do computador - vulnerável a espionagem acidental em background.",
    icon: "Activity",
    settings: {
      privateHome: true,
      whitelistPaths: ["~/Music"],
      ipAddress: "none",
      netBridge: "none",
      seccompEnabled: true,
      noSound: false // Precisa de som para tocar/gravar!
    }
  },
  {
    filename: "blender.profile",
    name: "Blender 3D Graphics",
    program: "blender",
    description: "Suíte 3D robusta. Bloqueia rede e isola arquivos de chaves confidenciais do renderizador de modelagem.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateCache: true,
      seccompEnabled: true,
      noroot: true,
      noSound: false
    }
  },
  {
    filename: "kdenlive.profile",
    name: "Kdenlive Video Editor",
    program: "kdenlive",
    description: "Isola codificadores ffmpeg locais ao realizar renderização de trilhas de gravações.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Video",
    settings: {
      privateCache: true,
      seccompEnabled: true
    }
  },
  {
    filename: "handbrake.profile",
    name: "HandBrake Transcoder",
    program: "ghb",
    description: "Isola conversor de formatos de mídia e codecs de vídeo pesados.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Video",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      ipAddress: "none"
    }
  },
  {
    filename: "vlc.profile",
    name: "VLC Media Player",
    program: "vlc",
    description: "Reprodutor universal de vídeos. Tráfego de internet desligado e home bloqueada, exceto pasta de Vídeos.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Video",
    settings: {
      privateCache: true,
      whitelistPaths: ["~/Videos", "~/Music"],
      blacklistPaths: ["~/.ssh", "~/Documents"],
      seccompEnabled: true,
      ipAddress: "none",
      noSound: false,
      noVideo: false
    }
  },
  {
    filename: "mpv.profile",
    name: "MPV Player",
    program: "mpv",
    description: "Leve e minimalista tocador de vídeo via linha de comando.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Video",
    settings: {
      privateHome: true,
      whitelistPaths: ["~/Videos"],
      seccompEnabled: true,
      ipAddress: "none"
    }
  },
  {
    filename: "spotify.profile",
    name: "Spotify Client",
    program: "spotify",
    description: "Perfil do cliente Spotify comercial. Isola áudio e limita as varreduras de rede mDNS.",
    category: "Escritório & Mídia",
    attentionNeeded: true,
    attentionReason: "Proprietário. Faz escaneamento intensivo na rede LAN em busca de dispositivos Chromecast/Spotify Connect.",
    icon: "Activity",
    settings: {
      privateCache: true,
      privateTmp: true,
      seccompEnabled: true,
      noroot: true,
      noSound: false,
      blacklistPaths: ["~/Documents", "~/.ssh"]
    }
  },
  {
    filename: "obs-studio.profile",
    name: "OBS Studio",
    program: "obs",
    description: "Sandbox para transmissor e gravador de tela. Permite câmera e captação de tela restrita.",
    category: "Escritório & Mídia",
    attentionNeeded: true,
    attentionReason: "Grava simultaneamente tela, áudio do sistema, webcam e microfone com amplo tráfego rtmp externo.",
    icon: "Video",
    settings: {
      privateCache: true,
      seccompEnabled: true,
      noSound: false,
      noVideo: false
    }
  },
  {
    filename: "rhythmbox.profile",
    name: "Rhythmbox",
    program: "rhythmbox",
    description: "Tocador e organizador clássico de arquivos de músicas locais do GNOME.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateHome: true,
      whitelistPaths: ["~/Music"],
      seccompEnabled: true
    }
  },
  {
    filename: "clementine.profile",
    name: "Clementine Music Player",
    program: "clementine",
    description: "Reprodutor focado em bibliotecas robustas de músicas locais e áudio dinâmico.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateCache: true,
      whitelistPaths: ["~/Music"],
      seccompEnabled: true
    }
  },
  {
    filename: "audacious.profile",
    name: "Audacious Audio Player",
    program: "audacious",
    description: "Moderno e minimalista tocador de áudios focado em ultra-baixo consumo de CPU.",
    category: "Escritório & Mídia",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateHome: true,
      whitelistPaths: ["~/Music"],
      seccompEnabled: true
    }
  },
  {
    filename: "cheese.profile",
    name: "Cheese WebCam App",
    program: "cheese",
    description: "Simples aplicativo gráfico para testar captura de imagens e vídeos da webcam física.",
    category: "Escritório & Mídia",
    attentionNeeded: true,
    attentionReason: "Direta e imediata interação física com drivers locais de câmera de vídeo.",
    icon: "Video",
    settings: {
      privateHome: true,
      whitelistPaths: ["~/Pictures"],
      seccompEnabled: true,
      noVideo: false,
      noSound: false
    }
  },

  // ==================== UTILITÁRIOS (81-94) ====================
  {
    filename: "thunar.profile",
    name: "Thunar File Manager",
    program: "thunar",
    description: "Gerenciador de arquivos do XFCE. Restringe manipulação para evitar destruição de chaves acidentais.",
    category: "Utilitários, Jogos e Outros",
    attentionNeeded: true,
    attentionReason: "Possui permissão para varrer, montar volumes de disco e deletar arquivos locais em larga escala.",
    icon: "Layers",
    settings: {
      privateCache: true,
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh", "~/.gnupg"]
    }
  },
  {
    filename: "nautilus.profile",
    name: "Nautilus File Manager",
    program: "nautilus",
    description: "Navegador padrão de arquivos do GNOME.",
    category: "Utilitários, Jogos e Outros",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateCache: true,
      blacklistPaths: ["~/.ssh"]
    }
  },
  {
    filename: "dolphin.profile",
    name: "Dolphin File Manager",
    program: "dolphin",
    description: "Gerenciador avançado e rico em funcionalidades de desktop do KDE.",
    category: "Utilitários, Jogos e Outros",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateCache: true,
      blacklistPaths: ["~/.ssh"]
    }
  },
  {
    filename: "ranger.profile",
    name: "Ranger CLI File manager",
    program: "ranger",
    description: "Gerenciador de arquivos interativo no terminal com atalhos baseados em vim.",
    category: "Utilitários, Jogos e Outros",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh"]
    }
  },
  {
    filename: "htop.profile",
    name: "Htop Progress Monitor",
    program: "htop",
    description: "Visualizador de processos. Isola-o para que ele veja apenas dados do próprio container, ou de permissão global filtrada.",
    category: "Utilitários, Jogos e Outros",
    attentionNeeded: false,
    icon: "Activity",
    settings: {
      privateHome: true,
      seccompEnabled: true,
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "ncdu.profile",
    name: "Ncdu Disk Usage",
    program: "ncdu",
    description: "Analisador rápido de uso do espaço em disco ocupado na home interativo no terminal.",
    category: "Utilitários, Jogos e Outros",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      seccompEnabled: true,
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "steam.profile",
    name: "Steam Client",
    program: "steam",
    description: "Isola execução de binários de jogos digitais proprietários de terceiros para evitar telemetria intrusiva.",
    category: "Utilitários, Jogos e Outros",
    attentionNeeded: true,
    attentionReason: "Roda softwares e binários drm comerciais não empacotados, necessita de renderização de alto alcance gpgpu.",
    icon: "Layers",
    settings: {
      privateCache: true,
      seccompEnabled: true,
      noroot: true,
      noSound: false,
      noVideo: false,
      blacklistPaths: ["~/Documents", "~/.ssh"]
    }
  },
  {
    filename: "file-roller.profile",
    name: "Archive Manager",
    program: "file-roller",
    description: "Evita exploits zip-slip de extração de arquivos em diretórios do sistema.",
    category: "Utilitários, Jogos e Outros",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateHome: true,
      whitelistPaths: ["~/Downloads"],
      seccompEnabled: true,
      ipAddress: "none"
    }
  },
  {
    filename: "bleachbit.profile",
    name: "BleachBit Cleaner",
    program: "bleachbit",
    description: "Sandbox de limpeza estritamente segura para não apagar pastas erradas.",
    category: "Utilitários, Jogos e Outros",
    attentionNeeded: true,
    attentionReason: "Deleta gigabytes de caches locais - necessita de precaução contra deleções em loops simbólicos.",
    icon: "Activity",
    settings: {
      seccompEnabled: true,
      blacklistPaths: ["~/.ssh", "~/Documents"]
    }
  },
  {
    filename: "simple-scan.profile",
    name: "Simple Scan",
    program: "simple-scan",
    description: "Utilitário clássico para digitalização de papéis via scanners físicos do sistema.",
    category: "Utilitários, Jogos e Outros",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateHome: true,
      seccompEnabled: true
    }
  },

  // ==================== DEVELOPER STACKS (95-101) ====================
  {
    filename: "dev-nodejs.profile",
    name: "Node.js Environment",
    program: "node",
    description: "Sandbox rígida para rodar comandos Node, scripts locais de npm de pacotes que podem conter códigos spywares.",
    category: "Developer Stacks (Tecnologias)",
    attentionNeeded: true,
    attentionReason: "Malwares em dependências npm (como roubo de session tokens por typo-squatting) são comuns.",
    icon: "Terminal",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/workspace", "~/.npm", "~/.config/configstore", "~/.npm-global"],
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents", "~/Pictures", "~/Downloads/private_keys"],
      seccompEnabled: true,
      nonewprivs: true,
      noroot: true,
      noSound: true,
      noVideo: true,
      nodbus: true
    }
  },
  {
    filename: "dev-python.profile",
    name: "Python Run Runtime",
    program: "python3",
    description: "Isolamento para scripts e ferramentas escritas em Python 3. Mantém pastas privadas protegidas.",
    category: "Developer Stacks (Tecnologias)",
    attentionNeeded: true,
    attentionReason: "Módulos de terceiros baixados pelo 'pip' podem realizar varreduras e roubos de senhas na home do Linux.",
    icon: "Terminal",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/workspace", "~/.cache/pip", "~/.local/lib/python3*"],
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents/Passwords"],
      seccompEnabled: true,
      noroot: true,
      noSound: true,
      noVideo: true
    }
  },
  {
    filename: "dev-php.profile",
    name: "PHP Sandbox Interpreter",
    program: "php",
    description: "Perfil voltado ao desenvolvimento web em PHP. Bloqueia acesso a arquivos fora do diretório do projeto.",
    category: "Developer Stacks (Tecnologias)",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateTmp: true,
      whitelistPaths: ["~/workspace", "~/.composer/cache"],
      blacklistPaths: ["~/.ssh", "~/.gnupg"],
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "dev-rust.profile",
    name: "Rust / Cargo Compiler",
    program: "cargo",
    description: "Isola execuções de builds Rust e downloads de dependências do crates.io.",
    category: "Developer Stacks (Tecnologias)",
    attentionNeeded: true,
    attentionReason: "Build scripts (build.rs) de dependências baixadas executam códigos arbitrários sem restrições no host Linux no compile-time.",
    icon: "Terminal",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/workspace", "~/.cargo", "~/.rustup"],
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents"],
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "dev-go.profile",
    name: "Go Language Compiler",
    program: "go",
    description: "Compilação protegida para GoLang. Permite acesso a rede apenas para baixar dependências via proxy goproxy.",
    category: "Developer Stacks (Tecnologias)",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/workspace", "~/go"],
      blacklistPaths: ["~/.ssh", "~/.gnupg"],
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "dev-cpp.profile",
    name: "C/C++ Tools (gcc/make)",
    program: "gcc",
    description: "Sandbox rígida para testar códigos C/C++ de alunos ou projetos externos sem comprometer o sistema.",
    category: "Developer Stacks (Tecnologias)",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateTmp: true,
      whitelistPaths: ["~/workspace"],
      blacklistPaths: ["~/.ssh", "~/.gnupg"],
      seccompEnabled: true,
      noroot: true
    }
  },
  {
    filename: "dev-java.profile",
    name: "Java Developer Tools",
    program: "java",
    description: "Restringe bibliotecas Maven/Gradle que executam localmente na JVM.",
    category: "Developer Stacks (Tecnologias)",
    attentionNeeded: false,
    icon: "Terminal",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/workspace", "~/.m2", "~/.gradle"],
      blacklistPaths: ["~/.ssh", "~/.gnupg"],
      seccompEnabled: true
    }
  },

  // ==================== FULLSTACKS & COMBINED (102+) ====================
  {
    filename: "fullstack-npm.profile",
    name: "Fullstack (NPM Engine)",
    program: "npm",
    description: "Perfil completo agrupado de Node.js + NPM + NPX. Isola o ecossistema de JS da home e bloqueia caminhos sensíveis enquanto provê rede local.",
    category: "Fullstack & Grupos",
    attentionNeeded: true,
    attentionReason: "Ferramenta de orquestração web com alto índice de dependências que rodam scripts de pré-construção ocultos.",
    icon: "Layers",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/workspace", "~/.npm", "~/.config/configstore", "~/.npm-global"],
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents/Passwords", "~/Pictures"],
      seccompEnabled: true,
      noroot: true,
      noSound: true,
      noVideo: true,
      nodbus: true
    },
    customRawText: `# Firejail profile for Fullstack (NPM Engine)
# Este perfil reúne e importa as principais regras de isolamento dev web:

# Importando perfis individuais via diretiva include do Firejail:
include dev-nodejs.profile

# Complementos específicos do ambiente Fullstack NPM:
# Permite rodar servidores locais em portas de desenvolvimento (eg. 3000, 5173, 8080)
writable-run-user
private-tmp
`
  },
  {
    filename: "fullstack-npm-php.profile",
    name: "Fullstack (PHP + NPM)",
    program: "composer",
    description: "Trabalho em stacks PHP (Laravel/Symfony) integradas com build de frontend web (Vite/Tailwind). Une as duas tecnologias.",
    category: "Fullstack & Grupos",
    attentionNeeded: true,
    attentionReason: "Une as permissões de rede do Composer com as de execução em segundo plano do Node.",
    icon: "Layers",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/workspace", "~/.composer", "~/.npm", "~/.npm-global"],
      blacklistPaths: ["~/.ssh", "~/.gnupg", "~/Documents/Passwords"],
      seccompEnabled: true,
      noroot: true
    },
    customRawText: `# Firejail profile for Fullstack (PHP + NPM)
# Este perfil realiza o agrupamento de segurança para stacks unindo backend PHP e frontend JS:

include dev-php.profile
include dev-nodejs.profile

# Regras adicionais para stack conjunta:
whitelist ~/workspace/laravel-projects
private-cache
`
  },
  {
    filename: "fullstack-python-postgres.profile",
    name: "Fullstack (Python + Postgres Client)",
    program: "python3",
    description: "Isolamento para stacks FastAPI, Django ou Flask que se conectam a bancos de dados PostgreSQL locais ou externos.",
    category: "Fullstack & Grupos",
    attentionNeeded: false,
    icon: "Layers",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/workspace", "~/.cache/pip", "~/.postgresql"],
      blacklistPaths: ["~/.ssh", "~/.gnupg"],
      seccompEnabled: true,
      noroot: true
    },
    customRawText: `# Firejail profile for Fullstack (Python + Postgres Client)
# Este perfil agrupa interpretadores python com conectores psql:

include dev-python.profile
include postgresql-cli.profile

# Habilita apenas conexões de rede em loopback e ips autorizados do banco
dns 8.8.8.8
`
  },
  {
    filename: "fullstack-rust-wasm.profile",
    name: "Fullstack Rust + WASM + Node",
    program: "cargo",
    description: "Desenvolvimento de WebAssembly compilado do Rust de altíssima performance guiado pelo wasm-pack e integrado ao Node/NPM.",
    category: "Fullstack & Grupos",
    attentionNeeded: true,
    attentionReason: "Compilação cruzada gera múltiplos binários transitórios e executa comandos node em paralelo.",
    icon: "Layers",
    settings: {
      privateCache: true,
      privateTmp: true,
      whitelistPaths: ["~/workspace", "~/.cargo", "~/.npm", "~/.rustup"],
      blacklistPaths: ["~/.ssh", "~/.gnupg"],
      seccompEnabled: true,
      noroot: true
    },
    customRawText: `# Firejail profile for Fullstack Rust + WASM + Node
# Agrupa os compiladores Rust e compiladores Javascript em uma sandbox rígida:

include dev-rust.profile
include dev-nodejs.profile

# Suporte extra para targets WASM
private-dev
`
  }
];
