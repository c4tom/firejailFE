/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FirejailProfile {
  id: string;
  name: string;
  description: string;
  program: string;
  arguments: string;
  icon?: string;
  isPreset?: boolean;
  customRawText?: string;

  // General & Execution
  sandboxName?: string;
  timeout?: string; // hh:mm:ss
  cpu?: string; // cpu list
  nice?: string;
  oom?: string;
  debug?: boolean;
  debugBlacklists?: boolean;
  debugWhitelists?: boolean;
  deterministicExitCode?: boolean;
  deterministicShutdown?: boolean;

  // Filesystem Isolation
  privateHome?: boolean;
  privateHomeDir?: string;
  privateCache?: boolean;
  privateDev?: boolean;
  privateTmp?: boolean;
  privateCwd?: boolean;
  privateCwdDir?: string;
  privateBin?: string[]; // list of binaries
  privateEtc?: string[]; // list of configs
  privateOpt?: string[];
  privateSrv?: string[];
  
  readOnlyPaths?: string[];
  readWritePaths?: string[];
  blacklistPaths?: string[];
  whitelistPaths?: string[];
  noBlacklistPaths?: string[];
  noWhitelistPaths?: string[];
  
  writableEtc?: boolean;
  writableRunUser?: boolean;
  writableVar?: boolean;
  writableVarLog?: boolean;
  allusers?: boolean;

  // Network Options
  netBridge?: string; // bridge name, none, or interface
  ipAddress?: string; // address, none, dhcp
  ip6Address?: string;
  vethName?: string;
  dnsServers?: string[];
  dnsTrace?: boolean;
  netTrace?: boolean;
  netStats?: boolean;
  macAddress?: string;
  mtu?: string;
  netmask?: string;
  netns?: string;
  hostname?: string;
  hostnameRandomize?: boolean;
  hostsFile?: string;

  // System & Security Filters
  seccompEnabled?: boolean;
  seccompSyscalls?: string[]; // custom blacklist
  seccompDrop?: string[];
  seccompKeep?: string[];
  seccompBlockSecondary?: boolean;
  seccompErrorAction?: "errno" | "kill" | "log" | "";
  
  capsEnabled?: boolean; // --caps
  capsDropAll?: boolean; // --caps.drop=all
  capsDrop?: string[]; // --caps.drop=x,y
  capsKeep?: string[]; // --caps.keep=x,y

  restrictNamespacesEnabled?: boolean;
  restrictNamespacesList?: string[]; // e.g. user, pid, net
  memoryDenyWriteExecute?: boolean;
  nonewprivs?: boolean;
  noroot?: boolean;
  apparmorEnabled?: boolean;
  apparmorProfile?: string; // name
  
  landlockEnforce?: boolean;
  landlockReadPaths?: string[];
  landlockWritePaths?: string[];
  landlockExecutePaths?: string[];
  landlockMakeipcPaths?: string[];
  landlockMakedevPaths?: string[];

  // Devices & D-Bus
  noSound?: boolean;
  noVideo?: boolean;
  noInput?: boolean;
  no3d?: boolean;
  noDvd?: boolean;
  noPrinters?: boolean;
  noU2f?: boolean;
  nodbus?: boolean;
  dbusSystem?: "filter" | "none" | "";
  dbusSystemTalk?: string[];
  dbusSystemOwn?: string[];
  dbusSystemSee?: string[];
  dbusSystemCall?: string[];
  dbusSystemLog?: boolean;
  dbusUser?: "filter" | "none" | "";
  dbusUserTalk?: string[];
  dbusUserOwn?: string[];
  dbusUserSee?: string[];
  dbusUserCall?: string[];
  dbusUserLog?: boolean;

  // Graphical X11
  x11Mode?: "none" | "xephyr" | "xorg" | "xpra" | "xvfb" | "";
  xephyrScreen?: string; // WIDTHxHEIGHT
  xephyrExtraParams?: string;
}

export interface RunningSandbox {
  pid: number;
  name: string;
  profileId: string;
  program: string;
  status: "running" | "paused" | "terminated";
  startTime: Date;
  cpuUsage: number; // percentage
  memoryUsage: number; // MB
  networkRx: number; // KB/s
  networkTx: number; // KB/s
  blockedSyscallsCount: number;
  blockedFilesCount: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  pid: number;
  sandboxName: string;
  type: "INFO" | "BLOCK_FILE" | "BLOCK_SYSCALL" | "NETWORK" | "DNS" | "CAPABILITY";
  message: string;
  severity: "low" | "medium" | "high";
}
