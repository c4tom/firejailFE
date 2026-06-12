/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FirejailProfile } from "../types";

/**
 * Generates the command-line arguments list based on the selected profile configurations
 */
export function generateFirejailArgs(profile: FirejailProfile): string[] {
  const args: string[] = [];

  // General & Execution
  if (profile.sandboxName) {
    args.push(`--name=${profile.sandboxName}`);
  }
  if (profile.timeout) {
    args.push(`--timeout=${profile.timeout}`);
  }
  if (profile.cpu) {
    args.push(`--cpu=${profile.cpu}`);
  }
  if (profile.nice !== undefined && profile.nice !== "") {
    args.push(`--nice=${profile.nice}`);
  }
  if (profile.oom !== undefined && profile.oom !== "") {
    args.push(`--oom=${profile.oom}`);
  }
  if (profile.debug) {
    args.push("--debug");
  }
  if (profile.debugBlacklists) {
    args.push("--debug-blacklists");
  }
  if (profile.debugWhitelists) {
    args.push("--debug-whitelists");
  }
  if (profile.deterministicExitCode) {
    args.push("--deterministic-exit-code");
  }
  if (profile.deterministicShutdown) {
    args.push("--deterministic-shutdown");
  }

  // Filesystem Isolation
  if (profile.privateHome) {
    if (profile.privateHomeDir) {
      args.push(`--private=${profile.privateHomeDir}`);
    } else {
      args.push("--private");
    }
  }
  if (profile.privateCache) {
    args.push("--private-cache");
  }
  if (profile.privateDev) {
    args.push("--private-dev");
  }
  if (profile.privateTmp) {
    args.push("--private-tmp");
  }
  if (profile.privateCwd) {
    if (profile.privateCwdDir) {
      args.push(`--private-cwd=${profile.privateCwdDir}`);
    } else {
      args.push("--private-cwd");
    }
  }
  if (profile.privateBin && profile.privateBin.length > 0) {
    args.push(`--private-bin=${profile.privateBin.join(",")}`);
  }
  if (profile.privateEtc && profile.privateEtc.length > 0) {
    args.push(`--private-etc=${profile.privateEtc.join(",")}`);
  }
  if (profile.privateOpt && profile.privateOpt.length > 0) {
    args.push(`--private-opt=${profile.privateOpt.join(",")}`);
  }
  if (profile.privateSrv && profile.privateSrv.length > 0) {
    args.push(`--private-srv=${profile.privateSrv.join(",")}`);
  }

  // Path restrictions
  if (profile.readOnlyPaths) {
    profile.readOnlyPaths.forEach(p => {
      if (p.trim()) args.push(`--read-only=${p.trim()}`);
    });
  }
  if (profile.readWritePaths) {
    profile.readWritePaths.forEach(p => {
      if (p.trim()) args.push(`--read-write=${p.trim()}`);
    });
  }
  if (profile.blacklistPaths) {
    profile.blacklistPaths.forEach(p => {
      if (p.trim()) args.push(`--blacklist=${p.trim()}`);
    });
  }
  if (profile.whitelistPaths) {
    profile.whitelistPaths.forEach(p => {
      if (p.trim()) args.push(`--whitelist=${p.trim()}`);
    });
  }
  if (profile.noBlacklistPaths) {
    profile.noBlacklistPaths.forEach(p => {
      if (p.trim()) args.push(`--noblacklist=${p.trim()}`);
    });
  }
  if (profile.noWhitelistPaths) {
    profile.noWhitelistPaths.forEach(p => {
      if (p.trim()) args.push(`--nowhitelist=${p.trim()}`);
    });
  }

  // Writable permissions
  if (profile.writableEtc) args.push("--writable-etc");
  if (profile.writableRunUser) args.push("--writable-run-user");
  if (profile.writableVar) args.push("--writable-var");
  if (profile.writableVarLog) args.push("--writable-var-log");
  if (profile.allusers) args.push("--allusers");

  // Networking
  if (profile.netBridge) {
    args.push(`--net=${profile.netBridge}`);
  }
  if (profile.ipAddress) {
    args.push(`--ip=${profile.ipAddress}`);
  }
  if (profile.ip6Address) {
    args.push(`--ip6=${profile.ip6Address}`);
  }
  if (profile.vethName) {
    args.push(`--veth-name=${profile.vethName}`);
  }
  if (profile.dnsServers && profile.dnsServers.length > 0) {
    profile.dnsServers.forEach(dns => {
      args.push(`--dns=${dns}`);
    });
  }
  if (profile.dnsTrace) args.push("--dnstrace");
  if (profile.netTrace) args.push("--nettrace");
  if (profile.netStats) args.push("--netstats");
  if (profile.macAddress) args.push(`--mac=${profile.macAddress}`);
  if (profile.mtu) args.push(`--mtu=${profile.mtu}`);
  if (profile.netmask) args.push(`--netmask=${profile.netmask}`);
  if (profile.netns) args.push(`--netns=${profile.netns}`);
  if (profile.hostname) {
    args.push(`--hostname=${profile.hostname}`);
  } else if (profile.hostnameRandomize) {
    args.push("--hostname-randomize");
  }
  if (profile.hostsFile) {
    args.push(`--hosts-file=${profile.hostsFile}`);
  }

  // Security filters
  if (profile.seccompEnabled) {
    if (profile.seccompSyscalls && profile.seccompSyscalls.length > 0) {
      args.push(`--seccomp=${profile.seccompSyscalls.join(",")}`);
    } else {
      args.push("--seccomp");
    }
  }
  if (profile.seccompDrop && profile.seccompDrop.length > 0) {
    args.push(`--seccomp.drop=${profile.seccompDrop.join(",")}`);
  }
  if (profile.seccompKeep && profile.seccompKeep.length > 0) {
    args.push(`--seccomp.keep=${profile.seccompKeep.join(",")}`);
  }
  if (profile.seccompBlockSecondary) {
    args.push("--seccomp.block-secondary");
  }
  if (profile.seccompErrorAction) {
    args.push(`--seccomp-error-action=${profile.seccompErrorAction}`);
  }

  // Caps
  if (profile.capsEnabled) {
    args.push("--caps");
  }
  if (profile.capsDropAll) {
    args.push("--caps.drop=all");
  } else if (profile.capsDrop && profile.capsDrop.length > 0) {
    args.push(`--caps.drop=${profile.capsDrop.join(",")}`);
  }
  if (profile.capsKeep && profile.capsKeep.length > 0) {
    args.push(`--caps.keep=${profile.capsKeep.join(",")}`);
  }

  // Resctict namespaces
  if (profile.restrictNamespacesEnabled) {
    if (profile.restrictNamespacesList && profile.restrictNamespacesList.length > 0) {
      args.push(`--restrict-namespaces=${profile.restrictNamespacesList.join(",")}`);
    } else {
      args.push("--restrict-namespaces");
    }
  }
  if (profile.memoryDenyWriteExecute) args.push("--memory-deny-write-execute");
  if (profile.nonewprivs) args.push("--nonewprivs");
  if (profile.noroot) args.push("--noroot");
  
  if (profile.apparmorEnabled) {
    if (profile.apparmorProfile) {
      args.push(`--apparmor=${profile.apparmorProfile}`);
    } else {
      args.push("--apparmor");
    }
  }

  // Landlock
  if (profile.landlockEnforce) {
    args.push("--landlock.enforce");
  }
  if (profile.landlockReadPaths) {
    profile.landlockReadPaths.forEach(p => {
      if (p.trim()) args.push(`--landlock.fs.read=${p.trim()}`);
    });
  }
  if (profile.landlockWritePaths) {
    profile.landlockWritePaths.forEach(p => {
      if (p.trim()) args.push(`--landlock.fs.write=${p.trim()}`);
    });
  }
  if (profile.landlockExecutePaths) {
    profile.landlockExecutePaths.forEach(p => {
      if (p.trim()) args.push(`--landlock.fs.execute=${p.trim()}`);
    });
  }
  if (profile.landlockMakeipcPaths) {
    profile.landlockMakeipcPaths.forEach(p => {
      if (p.trim()) args.push(`--landlock.fs.makeipc=${p.trim()}`);
    });
  }
  if (profile.landlockMakedevPaths) {
    profile.landlockMakedevPaths.forEach(p => {
      if (p.trim()) args.push(`--landlock.fs.makedev=${p.trim()}`);
    });
  }

  // Devices & DBUS
  if (profile.noSound) args.push("--nosound");
  if (profile.noVideo) args.push("--novideo");
  if (profile.noInput) args.push("--noinput");
  if (profile.no3d) args.push("--no3d");
  if (profile.noDvd) args.push("--nodvd");
  if (profile.noPrinters) args.push("--noprinters");
  if (profile.noU2f) args.push("--nou2f");
  if (profile.nodbus) args.push("--nodbus");

  if (profile.dbusSystem) {
    if (profile.dbusSystem === "filter") {
      args.push("--dbus-system=filter");
      if (profile.dbusSystemTalk) profile.dbusSystemTalk.forEach(t => args.push(`--dbus-system.talk=${t}`));
      if (profile.dbusSystemOwn) profile.dbusSystemOwn.forEach(o => args.push(`--dbus-system.own=${o}`));
      if (profile.dbusSystemSee) profile.dbusSystemSee.forEach(s => args.push(`--dbus-system.see=${s}`));
      if (profile.dbusSystemCall) profile.dbusSystemCall.forEach(c => args.push(`--dbus-system.call=${c}`));
      if (profile.dbusSystemLog) args.push("--dbus-system.log");
    } else {
      args.push("--dbus-system=none");
    }
  }

  if (profile.dbusUser) {
    if (profile.dbusUser === "filter") {
      args.push("--dbus-user=filter");
      if (profile.dbusUserTalk) profile.dbusUserTalk.forEach(t => args.push(`--dbus-user.talk=${t}`));
      if (profile.dbusUserOwn) profile.dbusUserOwn.forEach(o => args.push(`--dbus-user.own=${o}`));
      if (profile.dbusUserSee) profile.dbusUserSee.forEach(s => args.push(`--dbus-user.see=${s}`));
      if (profile.dbusUserCall) profile.dbusUserCall.forEach(c => args.push(`--dbus-user.call=${c}`));
      if (profile.dbusUserLog) args.push("--dbus-user.log");
    } else {
      args.push("--dbus-user=none");
    }
  }

  // X11 Graphical
  if (profile.x11Mode) {
    if (profile.x11Mode === "none") {
      args.push("--x11=none");
    } else {
      args.push(`--x11=${profile.x11Mode}`);
      if (profile.x11Mode === "xephyr") {
        if (profile.xephyrScreen) args.push(`--xephyr-screen=${profile.xephyrScreen}`);
        if (profile.xephyrExtraParams) args.push(`--xephyr-extra-params=${profile.xephyrExtraParams}`);
      }
    }
  }

  return args;
}

/**
 * Builds standard firejail command line string
 */
export function buildFirejailCommandLine(profile: FirejailProfile): string {
  const args = generateFirejailArgs(profile);
  const prog = profile.program ? profile.program : "[application]";
  const params = profile.arguments ? ` ${profile.arguments}` : "";
  return `firejail ${args.join(" ")} ${prog}${params}`;
}

/**
 * Generates the clean structure of standard .profile file text
 */
export function generateProfileFileContent(profile: FirejailProfile): string {
  const lines: string[] = [];
  lines.push(`# Firejail profile for ${profile.name || "application"}`);
  lines.push(`# Generated with Gerenciador de Perfis Firejail`);
  lines.push(`# Target program: ${profile.program || "any"}`);
  lines.push("");

  // System & Security
  if (profile.noroot) lines.push("noroot");
  if (profile.nonewprivs) lines.push("nonewprivs");
  if (profile.memoryDenyWriteExecute) lines.push("memory-deny-write-execute");
  
  if (profile.seccompEnabled) {
    if (profile.seccompSyscalls && profile.seccompSyscalls.length > 0) {
      lines.push(`seccomp ${profile.seccompSyscalls.join(",")}`);
    } else {
      lines.push("seccomp");
    }
  }
  if (profile.seccompDrop && profile.seccompDrop.length > 0) {
    lines.push(`seccomp.drop ${profile.seccompDrop.join(",")}`);
  }
  if (profile.seccompKeep && profile.seccompKeep.length > 0) {
    lines.push(`seccomp.keep ${profile.seccompKeep.join(",")}`);
  }
  if (profile.seccompBlockSecondary) lines.push("seccomp.block-secondary");

  if (profile.capsEnabled) {
    if (profile.capsDropAll) {
      lines.push("caps.drop all");
    } else if (profile.capsDrop && profile.capsDrop.length > 0) {
      lines.push(`caps.drop ${profile.capsDrop.join(",")}`);
    }
    if (profile.capsKeep && profile.capsKeep.length > 0) {
      lines.push(`caps.keep ${profile.capsKeep.join(",")}`);
    }
  }

  if (profile.apparmorEnabled) {
    if (profile.apparmorProfile) {
      lines.push(`apparmor ${profile.apparmorProfile}`);
    } else {
      lines.push("apparmor");
    }
  }

  // Restrict namespaces
  if (profile.restrictNamespacesEnabled) {
    if (profile.restrictNamespacesList && profile.restrictNamespacesList.length > 0) {
      lines.push(`restrict-namespaces ${profile.restrictNamespacesList.join(",")}`);
    } else {
      lines.push("restrict-namespaces");
    }
  }

  // Filesystem Isolation
  if (profile.privateHome) {
    lines.push("private");
  }
  if (profile.privateCache) lines.push("private-cache");
  if (profile.privateDev) lines.push("private-dev");
  if (profile.privateTmp) lines.push("private-tmp");
  
  if (profile.privateBin && profile.privateBin.length > 0) {
    lines.push(`private-bin ${profile.privateBin.join(",")}`);
  }
  if (profile.privateEtc && profile.privateEtc.length > 0) {
    lines.push(`private-etc ${profile.privateEtc.join(",")}`);
  }

  // Paths Readonly, Readwrite, Whitelist & Blacklist
  if (profile.readOnlyPaths) {
    profile.readOnlyPaths.forEach(p => {
      if (p.trim()) lines.push(`read-only ${p.trim()}`);
    });
  }
  if (profile.readWritePaths) {
    profile.readWritePaths.forEach(p => {
      if (p.trim()) lines.push(`read-write ${p.trim()}`);
    });
  }
  if (profile.whitelistPaths) {
    profile.whitelistPaths.forEach(p => {
      if (p.trim()) lines.push(`whitelist ${p.trim()}`);
    });
  }
  if (profile.blacklistPaths) {
    profile.blacklistPaths.forEach(p => {
      if (p.trim()) lines.push(`blacklist ${p.trim()}`);
    });
  }
  if (profile.noBlacklistPaths) {
    profile.noBlacklistPaths.forEach(p => {
      if (p.trim()) lines.push(`noblacklist ${p.trim()}`);
    });
  }

  // Writable permissions
  if (profile.writableEtc) lines.push("writable-etc");
  if (profile.writableRunUser) lines.push("writable-run-user");
  if (profile.writableVar) lines.push("writable-var");
  if (profile.allusers) lines.push("allusers");

  // Networking
  if (profile.netBridge) {
    lines.push(`net ${profile.netBridge}`);
  }
  if (profile.ipAddress) {
    lines.push(`ip ${profile.ipAddress}`);
  }
  if (profile.dnsServers && profile.dnsServers.length > 0) {
    profile.dnsServers.forEach(dns => {
      lines.push(`dns ${dns}`);
    });
  }
  if (profile.macAddress) lines.push(`mac ${profile.macAddress}`);
  if (profile.mtu) lines.push(`mtu ${profile.mtu}`);
  if (profile.hostname) lines.push(`hostname ${profile.hostname}`);

  // Devices Block
  if (profile.noSound) lines.push("nosound");
  if (profile.noVideo) lines.push("novideo");
  if (profile.noInput) lines.push("noinput");
  if (profile.no3d) lines.push("no3d");
  if (profile.nodbus) lines.push("nodbus");

  // DBus system and user filters
  if (profile.dbusSystem) {
    lines.push(`dbus-system ${profile.dbusSystem}`);
  }
  if (profile.dbusUser) {
    lines.push(`dbus-user ${profile.dbusUser}`);
  }

  // X11 Graphical Sandbox
  if (profile.x11Mode) {
    lines.push(`x11 ${profile.x11Mode}`);
  }

  // Landlock
  if (profile.landlockEnforce) {
    lines.push("landlock.enforce");
  }

  return lines.join("\n");
}

/**
 * Parses .profile file string into a FirejailProfile object
 */
export function parseProfileFileContent(content: string, existing: FirejailProfile): FirejailProfile {
  // Create a base copy of the existing profile to merge parsed data into
  const result: FirejailProfile = {
    ...existing,
    // Reset lists that we will accumulate while parsing
    readOnlyPaths: [],
    readWritePaths: [],
    whitelistPaths: [],
    blacklistPaths: [],
    noBlacklistPaths: [],
    dnsServers: [],
    privateBin: [],
    privateEtc: [],
    // Reset flags so they match the parsed file unless we don't find them
    noroot: false,
    nonewprivs: false,
    memoryDenyWriteExecute: false,
    seccompEnabled: false,
    seccompBlockSecondary: false,
    capsEnabled: false,
    capsDropAll: false,
    apparmorEnabled: false,
    restrictNamespacesEnabled: false,
    privateHome: false,
    privateCache: false,
    privateDev: false,
    privateTmp: false,
    writableEtc: false,
    writableRunUser: false,
    writableVar: false,
    noSound: false,
    noVideo: false,
    noInput: false,
    no3d: false,
    nodbus: false,
    landlockEnforce: false,
  };

  const lines = content.split("\n");

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Try parsing metadata comments
    if (line.startsWith("#")) {
      const nameMatch = line.match(/^#\s*Firejail profile for\s+(.+)$/i);
      if (nameMatch) {
        result.name = nameMatch[1].trim();
      }
      const targetMatch = line.match(/^#\s*Target program:\s+(.+)$/i);
      if (targetMatch) {
        result.program = targetMatch[1].trim();
      }
      continue;
    }

    const firstSpaceIndex = line.indexOf(" ");
    let keyword = line;
    let argument = "";

    if (firstSpaceIndex !== -1) {
      keyword = line.substring(0, firstSpaceIndex).trim();
      argument = line.substring(firstSpaceIndex + 1).trim();
    }

    switch (keyword) {
      case "noroot":
        result.noroot = true;
        break;
      case "nonewprivs":
        result.nonewprivs = true;
        break;
      case "memory-deny-write-execute":
        result.memoryDenyWriteExecute = true;
        break;
      case "seccomp.block-secondary":
        result.seccompBlockSecondary = true;
        break;
      case "seccomp":
        result.seccompEnabled = true;
        if (argument) {
          result.seccompSyscalls = argument.split(",").map(s => s.trim());
        } else {
          result.seccompSyscalls = [];
        }
        break;
      case "seccomp.drop":
        result.seccompEnabled = true;
        result.seccompDrop = argument.split(",").map(s => s.trim());
        break;
      case "seccomp.keep":
        result.seccompEnabled = true;
        result.seccompKeep = argument.split(",").map(s => s.trim());
        break;
      case "caps.drop":
        result.capsEnabled = true;
        if (argument === "all") {
          result.capsDropAll = true;
        } else {
          result.capsDrop = argument.split(",").map(s => s.trim());
        }
        break;
      case "caps.keep":
        result.capsEnabled = true;
        result.capsKeep = argument.split(",").map(s => s.trim());
        break;
      case "apparmor":
        result.apparmorEnabled = true;
        if (argument) {
          result.apparmorProfile = argument;
        }
        break;
      case "restrict-namespaces":
        result.restrictNamespacesEnabled = true;
        if (argument) {
          result.restrictNamespacesList = argument.split(",").map(s => s.trim());
        }
        break;
      case "private":
        result.privateHome = true;
        break;
      case "private-cache":
        result.privateCache = true;
        break;
      case "private-dev":
        result.privateDev = true;
        break;
      case "private-tmp":
        result.privateTmp = true;
        break;
      case "private-bin":
        result.privateBin = argument.split(",").map(s => s.trim());
        break;
      case "private-etc":
        result.privateEtc = argument.split(",").map(s => s.trim());
        break;
      case "read-only":
        if (argument && !result.readOnlyPaths?.includes(argument)) {
          result.readOnlyPaths = [...(result.readOnlyPaths || []), argument];
        }
        break;
      case "read-write":
        if (argument && !result.readWritePaths?.includes(argument)) {
          result.readWritePaths = [...(result.readWritePaths || []), argument];
        }
        break;
      case "whitelist":
        if (argument && !result.whitelistPaths?.includes(argument)) {
          result.whitelistPaths = [...(result.whitelistPaths || []), argument];
        }
        break;
      case "blacklist":
        if (argument && !result.blacklistPaths?.includes(argument)) {
          result.blacklistPaths = [...(result.blacklistPaths || []), argument];
        }
        break;
      case "noblacklist":
        if (argument && !result.noBlacklistPaths?.includes(argument)) {
          result.noBlacklistPaths = [...(result.noBlacklistPaths || []), argument];
        }
        break;
      case "writable-etc":
        result.writableEtc = true;
        break;
      case "writable-run-user":
        result.writableRunUser = true;
        break;
      case "writable-var":
        result.writableVar = true;
        break;
      case "net":
        result.netBridge = argument;
        break;
      case "ip":
        result.ipAddress = argument;
        break;
      case "dns":
        if (argument && !result.dnsServers?.includes(argument)) {
          result.dnsServers = [...(result.dnsServers || []), argument];
        }
        break;
      case "mac":
        result.macAddress = argument;
        break;
      case "mtu":
        result.mtu = argument;
        break;
      case "hostname":
        result.hostname = argument;
        break;
      case "nosound":
        result.noSound = true;
        break;
      case "novideo":
        result.noVideo = true;
        break;
      case "noinput":
        result.noInput = true;
        break;
      case "no3d":
        result.no3d = true;
        break;
      case "nodbus":
        result.nodbus = true;
        break;
      case "dbus-system":
        result.dbusSystem = argument as any;
        break;
      case "dbus-user":
        result.dbusUser = argument as any;
        break;
      case "x11":
        result.x11Mode = argument as any;
        break;
      case "landlock.enforce":
        result.landlockEnforce = true;
        break;
    }
  }

  return result;
}
