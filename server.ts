/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { exec, spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Track spawned processes in memory (for local control & execution)
interface LocalActiveProcess {
  pid: number;
  program: string;
  args: string[];
  startTime: Date;
  profileName: string;
}
const localProcesses: Map<number, LocalActiveProcess> = new Map();

// Global server-side logs store for real process outputs and security auditing events
interface LogEntry {
  id: string;
  timestamp: string;
  pid: number;
  sandboxName: string;
  type: "INFO" | "BLOCK_FILE" | "BLOCK_SYSCALL" | "NETWORK" | "DNS" | "CAPABILITY";
  message: string;
  severity: "low" | "medium" | "high";
}

const serverLogs: LogEntry[] = [
  {
    id: "log-init-1",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    pid: 1201,
    sandboxName: "sys-init",
    type: "INFO",
    message: "Serviço de gerenciamento e monitoramento de sandbox Firejail iniciado no backend local.",
    severity: "low"
  }
];

function addServerLog(
  pid: number,
  sandboxName: string,
  type: "INFO" | "BLOCK_FILE" | "BLOCK_SYSCALL" | "NETWORK" | "DNS" | "CAPABILITY",
  message: string,
  severity: "low" | "medium" | "high" = "low"
) {
  const log: LogEntry = {
    id: `srv-log-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    pid,
    sandboxName,
    type,
    message,
    severity
  };
  serverLogs.push(log);
  if (serverLogs.length > 500) {
    serverLogs.shift();
  }
}

/**
 * Utility: Checks if firejail is installed on the host
 */
function checkFirejailInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("which firejail", (err, stdout) => {
      if (err || !stdout.trim()) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Utility: Dynamically triggers Firejail installation on Debian/Ubuntu systems
 */
async function attemptInstallFirejail() {
  const hasFirejail = await checkFirejailInstalled();
  if (hasFirejail) {
    console.log("✅ Firejail is already installed on the host OS.");
    addServerLog(
      0,
      "sys-init",
      "INFO",
      "✅ O Firejail foi detectado nativamente no host linux. Execuções em modo isolado kernel ativo habilitadas.",
      "low"
    );
    return;
  }

  console.log("ℹ️ Firejail is not present. Launching non-blocking background installer...");
  addServerLog(
    0,
    "sys-init",
    "INFO",
    "🕵️‍♂️ Firejail não foi encontrado no sistema. Tentando obter pacotes via gerenciador apt-get...",
    "medium"
  );

  // Run install asynchronously to avoid blocking the Express listener bootstrap
  exec("sudo apt-get update && sudo apt-get install -y firejail", (err, stdout, stderr) => {
    if (err) {
      console.warn("⚠️ Apt-get install failed. Attempting without sudo privileges...");
      exec("apt-get update && apt-get install -y firejail", (altErr) => {
        if (altErr) {
          console.error("❌ Failed to automatically install firejail dynamically.", altErr.message);
          addServerLog(
            0,
            "sys-init",
            "INFO",
            "⚠️ Instalação automática do Firejail indisponível (permissões ou ambiente restrito). Fallback para spawn nativo em sandbox de containeres ativo.",
            "medium"
          );
        } else {
          console.log("✅ Firejail successfully installed on second try.");
          addServerLog(
            0,
            "sys-init",
            "INFO",
            "✅ Firejail instalado com sucesso via repositórios do sistema local. Modo nativo liberado!",
            "low"
          );
        }
      });
    } else {
      console.log("✅ Firejail successfully installed.");
      addServerLog(
        0,
        "sys-init",
        "INFO",
        "✅ Firejail instalado com sucesso via repositórios do OS local. Sandboxing de kernel estrito liberado!",
        "low"
      );
    }
  });
}

/**
 * Utility: Returns the local firejail configurations path
 * Falls back to local directory if root HOME is not accessible or writable
 */
async function getFirejailConfigPath(filename: string): Promise<string> {
  const home = os.homedir();
  const folder = path.join(home, ".config", "firejail");
  try {
    await fs.mkdir(folder, { recursive: true });
    return path.join(folder, filename);
  } catch {
    const localFolder = path.join(process.cwd(), "local-profiles");
    await fs.mkdir(localFolder, { recursive: true });
    return path.join(localFolder, filename);
  }
}

// 1. API Status check
app.get("/api/status", async (req, res) => {
  const hasFirejail = await checkFirejailInstalled();
  res.json({
    status: "ok",
    fullstack: true,
    firejailInstalled: hasFirejail,
    platform: process.platform,
    arch: process.arch,
    homeDir: os.homedir(),
    localProcessesCount: localProcesses.size
  });
});

// 2. Clear server logs
app.post("/api/logs/clear", (req, res) => {
  serverLogs.length = 0;
  addServerLog(
    0,
    "sys-init",
    "INFO",
    "🧹 Fila de logs de auditoria limpa pelo usuário.",
    "low"
  );
  res.json({ success: true });
});

// 3. Get accumulated server logs
app.get("/api/logs", (req, res) => {
  res.json({ logs: serverLogs });
});

// 4. Save a generated Firejail profile directly to ~/.config/firejail/
app.post("/api/profiles/save", async (req, res) => {
  const { filename, content } = req.body;
  if (!filename || !content) {
    return res.status(400).json({ error: "Missing filename or content" });
  }

  try {
    const filePath = await getFirejailConfigPath(filename);
    await fs.writeFile(filePath, content, "utf-8");
    addServerLog(
      0,
      "sys-init",
      "INFO",
      `💾 Perfil salvo no disco do servidor: ${filePath} (${content.split("\n").length} linhas de diretivas)`,
      "low"
    );
    res.json({
      success: true,
      filePath,
      message: `Perfil salvo com sucesso no caminho local: ${filePath}`
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Falha ao gravar arquivo de perfil",
      details: err.message
    });
  }
});

function getProcessStats(pid: number): Promise<{ cpu: number; mem: number }> {
  return new Promise((resolve) => {
    exec(`ps -p ${pid} -o %cpu,rss --no-headers`, (err, stdout) => {
      if (err || !stdout.trim()) {
        resolve({ cpu: 0.1, mem: 5.0 }); // generic low fallback value
        return;
      }
      const parts = stdout.trim().split(/\s+/);
      if (parts.length >= 2) {
        const cpu = parseFloat(parts[0]) || 0.1;
        const rssKb = parseFloat(parts[1]) || 0;
        const memMb = parseFloat((rssKb / 1024).toFixed(1)) || 5.0;
        resolve({ cpu, mem: memMb });
      } else {
        resolve({ cpu: 0.1, mem: 5.0 });
      }
    });
  });
}

// 5. List active sandboxes (fetches real lists from Linux host via 'firejail --list')
app.get("/api/sandboxes/list", async (req, res) => {
  const hasFirejail = await checkFirejailInstalled();

  // Get active OS spawned processes from memory in real-time
  const memoryProcesses: any[] = Array.from(localProcesses.values()).map(p => ({
    pid: p.pid,
    user: os.userInfo().username || "appuser",
    command: p.args.length > 0 ? `firejail ${p.args.join(" ")} ${p.program}` : p.program,
    program: p.program,
    isSimulated: false
  }));

  const fetchRealList = (): Promise<any[]> => {
    return new Promise((resolve) => {
      if (!hasFirejail) {
        resolve(memoryProcesses);
        return;
      }

      // Parse stdout of 'firejail --list' if firejail is native
      exec("firejail --list", (err, stdout) => {
        if (err) {
          resolve(memoryProcesses);
          return;
        }

        const lines = stdout.split("\n");
        const sandboxesList: any[] = [...memoryProcesses];

        lines.forEach(line => {
          const parts = line.trim().split(":");
          if (parts.length >= 3) {
            const pidStr = parts[0];
            const user = parts[1];
            const command = parts.slice(2).join(":").trim();
            const pid = parseInt(pidStr, 10);
            
            if (!isNaN(pid)) {
              if (sandboxesList.some(s => s.pid === pid)) return;

              let program = "unknown";
              const programMatch = command.match(/firejail\s+.*?\s+(\w+)$/);
              if (programMatch) {
                program = programMatch[1];
              } else {
                const segments = command.split(" ");
                program = segments[segments.length - 1] || "app";
              }

              sandboxesList.push({
                pid,
                user,
                command,
                program,
                isSimulated: false
              });
            }
          }
        });

        resolve(sandboxesList);
      });
    });
  };

  try {
    const list = await fetchRealList();
    // Enrich with real OS metrics
    const enriched = await Promise.all(
      list.map(async (s) => {
        const stats = await getProcessStats(s.pid);
        return {
          ...s,
          cpu: stats.cpu,
          memory: stats.mem
        };
      })
    );
    res.json({
      sandboxes: enriched,
      firejailInstalled: hasFirejail
    });
  } catch (err: any) {
    res.status(500).json({ error: "Falha ao obter lista de processos", details: err.message });
  }
});

// 6. Start an application sandbox locally via 'firejail' or real fallback execution
app.post("/api/sandboxes/start", async (req, res) => {
  const { program, args, profileName, profileContent } = req.body;
  if (!program) {
    return res.status(400).json({ error: "Missing program name" });
  }

  const hasFirejail = await checkFirejailInstalled();
  const formatArgs = Array.isArray(args) ? args : [];
  let commandArgs = [...formatArgs];
  let profilePath = "";
  
  if (profileName && profileContent) {
    try {
      profilePath = await getFirejailConfigPath(profileName);
      await fs.writeFile(profilePath, profileContent, "utf-8");
    } catch (saveErr) {
      console.warn("Could not save profile file, continuing with dynamic args", saveErr);
    }
  }

  const sandboxName = profileName ? profileName.replace(/\.profile$/, "-jail") : `${program}-jail`;

  if (hasFirejail) {
    // Real Execution Mode A: Active Firejail Sandwich Isolation
    try {
      if (profilePath) {
        commandArgs.unshift(`--profile=${profilePath}`);
      }
      const fullArgs = [...commandArgs, program];
      console.log(`Executing isolated block: firejail ${fullArgs.join(" ")}`);

      addServerLog(
        0,
        sandboxName,
        "INFO",
        `📥 Sincronizando enclausuramento: Aplicando regras do perfil '${profileName}' sobre o comando '${program}'`,
        "medium"
      );

      // Spawn process under firejail shell wrapper
      const child = spawn("firejail", fullArgs);
      const realPid = child.pid;

      if (realPid) {
        localProcesses.set(realPid, {
          pid: realPid,
          program,
          args: commandArgs,
          startTime: new Date(),
          profileName: profileName || "Custom"
        });

        addServerLog(
          realPid,
          sandboxName,
          "INFO",
          `🚀 Processo iniciado e isolado com sucesso pela Sandbox Firejail! PID OS: ${realPid}`,
          "low"
        );

        // Pipe Standard Consoles (Stdout)
        child.stdout?.on("data", (data) => {
          const text = data.toString().trim();
          if (text) {
            text.split("\n").forEach((line: string) => {
              if (!line.trim()) return;
              let type: "INFO" | "BLOCK_FILE" | "BLOCK_SYSCALL" | "NETWORK" | "DNS" = "INFO";
              let sev: "low" | "medium" | "high" = "low";

              // Simple trace heuristics to convert terminal stdout logs into security dashboards
              if (/blacklist|denied|restrict|permission/i.test(line)) {
                type = "BLOCK_FILE";
                sev = "medium";
              } else if (/seccomp|syscall|blocked|sys-call|kernel/i.test(line)) {
                type = "BLOCK_SYSCALL";
                sev = "high";
              } else if (/connect|socket|ipv4|ipv6|networking|dns/i.test(line)) {
                type = "NETWORK";
                sev = "medium";
              }

              addServerLog(realPid, sandboxName, type, `[CONSOLE] ${line}`, sev);
            });
          }
        });

        // Pipe Standard Errors (Stderr)
        child.stderr?.on("data", (data) => {
          const text = data.toString().trim();
          if (text) {
            text.split("\n").forEach((line: string) => {
              if (!line.trim()) return;
              let type: "INFO" | "BLOCK_FILE" | "BLOCK_SYSCALL" | "NETWORK" | "DNS" = "INFO";
              let sev: "low" | "medium" | "high" = "medium";

              if (/blacklist|denied|restrict|permission/i.test(line)) {
                type = "BLOCK_FILE";
                sev = "medium";
              } else if (/seccomp|syscall|blocked|sys-call|kernel/i.test(line)) {
                type = "BLOCK_SYSCALL";
                sev = "high";
              } else if (/connect|socket|ipv4|ipv6|networking|dns/i.test(line)) {
                type = "NETWORK";
                sev = "medium";
              }

              addServerLog(realPid, sandboxName, type, `[ERRO] ${line}`, sev);
            });
          }
        });

        child.on("close", (code) => {
          localProcesses.delete(realPid);
          addServerLog(
            realPid,
            sandboxName,
            "INFO",
            `🏁 Processo sob sandbox (PID ${realPid}) foi encerrado de forma finalizada (Código de Saída: ${code}).`,
            code === 0 ? "low" : "medium"
          );
        });

        res.json({
          success: true,
          pid: realPid,
          command: `firejail ${fullArgs.join(" ")}`,
          message: `Lançado via Firejail com Sucesso! PID: ${realPid}`
        });
      } else {
        throw new Error("Não foi possível gerar um PID válido do wrapper kernel.");
      }
    } catch (err: any) {
      addServerLog(
        0,
        sandboxName,
        "INFO",
        `❌ Erro ao instanciar Firejail: ${err.message}`,
        "high"
      );
      res.status(500).json({ error: err.message });
    }
  } else {
    // Real Execution Mode B: OS Level Direct Process Spawn
    // Since firejail is missing on the current Cloud Run sandbox environment, we execute the native application
    // (python3, sh, node, curl, ls, etc.) direct to capture outputs/events and test real functionalities.
    try {
      console.log(`Executing direct system process: ${program} ${commandArgs.join(" ")}`);
      addServerLog(
        0,
        sandboxName,
        "INFO",
        `⚠️ Executando '${program}' diretamente no host (Firejail indisponível na arquitetura de container local). Monitorando canais de E/S.`,
        "medium"
      );

      const child = spawn(program, commandArgs);
      const realPid = child.pid;

      if (realPid) {
        localProcesses.set(realPid, {
          pid: realPid,
          program,
          args: commandArgs,
          startTime: new Date(),
          profileName: profileName || "Custom"
        });

        addServerLog(
          realPid,
          sandboxName,
          "INFO",
          `🚀 Processo de segundo plano instanciado no container local. PID: ${realPid}`,
          "low"
        );

        child.stdout?.on("data", (data) => {
          const text = data.toString().trim();
          if (text) {
            text.split("\n").forEach((line: string) => {
              if (!line.trim()) return;
              addServerLog(realPid, sandboxName, "INFO", `[STDOUT] ${line}`, "low");
            });
          }
        });

        child.stderr?.on("data", (data) => {
          const text = data.toString().trim();
          if (text) {
            text.split("\n").forEach((line: string) => {
              if (!line.trim()) return;
              addServerLog(realPid, sandboxName, "INFO", `[STDERR] ${line}`, "medium");
            });
          }
        });

        child.on("close", (code) => {
          localProcesses.delete(realPid);
          addServerLog(
            realPid,
            sandboxName,
            "INFO",
            `🏁 Processo local (PID ${realPid}) encerrou execução (Código: ${code}).`,
            code === 0 ? "low" : "medium"
          );
        });

        res.json({
          success: true,
          pid: realPid,
          command: `${program} ${commandArgs.join(" ")}`,
          message: `Spawn real direto bem sucedido! PID de rastreio: ${realPid}`
        });
      } else {
        throw new Error("Spawning process returned null shell handler.");
      }
    } catch (err: any) {
      addServerLog(
        0,
        sandboxName,
        "INFO",
        `❌ Falha crítica de spawn: Não foi possível rodar o utilitário '${program}'. Verifique se ele está presente no container local. Detalhes: ${err.message}`,
        "high"
      );
      res.status(500).json({ error: `Falha ao spawnar programa direto: ${err.message}` });
    }
  }
});

// 7. Shutdown/terminate a running sandbox via PID
app.post("/api/sandboxes/terminate", async (req, res) => {
  const { pid } = req.body;
  if (!pid) {
    return res.status(400).json({ error: "Missing process PID" });
  }

  const pidNum = Number(pid);
  const wasTracked = localProcesses.delete(pidNum);
  const hasFirejail = await checkFirejailInstalled();

  addServerLog(
    pidNum,
    "sys-control",
    "INFO",
    `🛑 Interrupção manual solicitada para o ID de sandbox / Processo: ${pidNum}`,
    "medium"
  );

  if (!hasFirejail) {
    // Kill processes directly
    try {
      process.kill(pidNum, "SIGKILL");
      addServerLog(
        pidNum,
        "sys-control",
        "INFO",
        `🗑️ Processo hospedado PID ${pidNum} eliminado com segurança via SIGKILL do container.`,
        "medium"
      );
      return res.json({
        success: true,
        message: `Processo local PID ${pidNum} finalizado.`
      });
    } catch (err: any) {
      // Maybe process is already dead
      return res.json({
        success: true,
        message: `Processo local PID ${pidNum} já se encontrava inativo ou encerrado.`
      });
    }
  }

  // native Firejail shutdown
  exec(`firejail --shutdown=${pidNum}`, (err, stdout) => {
    if (err) {
      // fallback to direct SIGKILL
      try {
        process.kill(pidNum, "SIGKILL");
        addServerLog(
          pidNum,
          "sys-control",
          "INFO",
          `🗑️ Finalizador nativo falhou, aplicando SIGKILL direto no PID ${pidNum}.`,
          "medium"
        );
        res.json({
          success: true,
          message: `Processo finalizado via kill local (PID: ${pidNum}).`
        });
      } catch (killErr: any) {
        res.status(500).json({
          error: `Não foi possível desligar o PID ${pidNum}`,
          details: killErr.message
        });
      }
    } else {
      addServerLog(
        pidNum,
        "sys-control",
        "INFO",
        `✅ Sandbox PID ${pidNum} finalizada com sucesso através do comando nativo de shutdown do Firejail.`,
        "low"
      );
      res.json({
        success: true,
        message: `Sandbox encerrada com sucesso usando o protocolo nativo de shutdown (PID: ${pidNum}).`
      });
    }
  });
});

// Core Vite connection integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`🔥 Firejail Dashboard Server running on http://localhost:${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || "development"}`);
    console.log(`===============================================`);

    // Run custom dynamic firejail checking/installer async
    attemptInstallFirejail().catch(err => {
      console.warn("Failed background check/install of firejail package", err);
    });
  });
}

startServer();
