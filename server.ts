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

// 2. Save a generated Firejail profile directly to ~/.config/firejail/
app.post("/api/profiles/save", async (req, res) => {
  const { filename, content } = req.body;
  if (!filename || !content) {
    return res.status(400).json({ error: "Missing filename or content" });
  }

  try {
    const filePath = await getFirejailConfigPath(filename);
    await fs.writeFile(filePath, content, "utf-8");
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

// 3. List active sandboxes (fetches real lists from Linux host via 'firejail --list')
app.get("/api/sandboxes/list", async (req, res) => {
  const hasFirejail = await checkFirejailInstalled();

  if (!hasFirejail) {
    // If not on a local Linux server with firejail, return simulated native instances + local spawned
    const simulated = Array.from(localProcesses.values()).map(p => ({
      pid: p.pid,
      user: os.userInfo().username || "localuser",
      command: `firejail ${p.args.join(" ")} ${p.program}`,
      program: p.program,
      isSimulated: true
    }));
    return res.json({
      sandboxes: simulated,
      firejailInstalled: false
    });
  }

  // Parse stdout of 'firejail --list'
  // Line format is typically: "PID:USER:Command name..." or "1234:user::firejail --private firefox"
  exec("firejail --list", (err, stdout) => {
    if (err) {
      // firejail --list can exit with nonkey if empty list
      return res.json({ sandboxes: [], firejailInstalled: true });
    }

    const lines = stdout.split("\n");
    const sandboxesList: any[] = [];

    lines.forEach(line => {
      const parts = line.trim().split(":");
      if (parts.length >= 3) {
        const pidStr = parts[0];
        const user = parts[1];
        // Rest of the string is command
        const command = parts.slice(2).join(":").trim();
        const pid = parseInt(pidStr, 10);
        
        if (!isNaN(pid)) {
          let program = "unknown";
          const programMatch = command.match(/firejail\s+.*?\s+(\w+)$/);
          if (programMatch) {
            program = programMatch[1];
          } else {
            // fallback
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

    res.json({
      sandboxes: sandboxesList,
      firejailInstalled: true
    });
  });
});

// 4. Start an application sandbox locally via 'firejail'
app.post("/api/sandboxes/start", async (req, res) => {
  const { program, args, profileName, profileContent } = req.body;
  if (!program) {
    return res.status(400).json({ error: "Missing program name" });
  }

  const hasFirejail = await checkFirejailInstalled();
  const formatArgs = Array.isArray(args) ? args : [];

  // Write custom quick profile if provided
  let commandArgs = [...formatArgs];
  if (profileName && profileContent) {
    try {
      const profilePath = await getFirejailConfigPath(profileName);
      await fs.writeFile(profilePath, profileContent, "utf-8");
      // Append standard firejail flags to point to this saved profile
      commandArgs.unshift(`--profile=${profilePath}`);
    } catch (saveErr) {
      console.warn("Could not save temporary file, launching with standard dynamic flags", saveErr);
    }
  }

  const stamp = new Date().toLocaleTimeString();

  if (!hasFirejail) {
    // Simulated Sandbox Run: generates a fake process and tracks in memory
    const simulatedPid = Math.floor(4000 + Math.random() * 5000);
    localProcesses.set(simulatedPid, {
      pid: simulatedPid,
      program,
      args: commandArgs,
      startTime: new Date(),
      profileName: profileName || "Simulado"
    });

    return res.json({
      success: true,
      pid: simulatedPid,
      simulated: true,
      command: `firejail ${commandArgs.join(" ")} ${program}`,
      message: `🚀 Sandbox '${program}' iniciada em MODO SIMULADO (` + (process.platform === "linux" ? "Firejail está ausente" : "Executando fora do Linux") + `).`
    });
  }

  // Real execution! Spawn firejail detached from node
  try {
    const fullArgs = [...commandArgs, program];
    console.log(`Spawning: firejail ${fullArgs.join(" ")}`);

    const child = spawn("firejail", fullArgs, {
      detached: true,
      stdio: "ignore"
    });

    const realPid = child.pid;
    if (realPid) {
      localProcesses.set(realPid, {
        pid: realPid,
        program,
        args: commandArgs,
        startTime: new Date(),
        profileName: profileName || "Custom"
      });

      child.unref();

      res.json({
        success: true,
        pid: realPid,
        simulated: false,
        command: `firejail ${fullArgs.join(" ")}`,
        message: `🚀 Processo seguro lançado com sucesso na Sandbox OS! (PID: ${realPid})`
      });
    } else {
      res.status(500).json({
        error: "Process failed to yield valid host PID"
      });
    }
  } catch (spawnErr: any) {
    res.status(500).json({
      error: "Falha ao spawnar processo firejail",
      details: spawnErr.message
    });
  }
});

// 5. Shutdown/terminate a running sandbox via PID
app.post("/api/sandboxes/terminate", async (req, res) => {
  const { pid } = req.body;
  if (!pid) {
    return res.status(400).json({ error: "Missing process PID" });
  }

  // Remove from local memory tracking
  const wasTracked = localProcesses.delete(Number(pid));
  const hasFirejail = await checkFirejailInstalled();

  if (!hasFirejail) {
    return res.json({
      success: true,
      message: `Processo simulado PID ${pid} finalizado.`
    });
  }

  // In Linux, firejail handles cleanups when calling shutdown
  exec(`firejail --shutdown=${pid}`, (err, stdout) => {
    if (err) {
      // fallback to normal process kill if shutdown fails
      exec(`kill -9 ${pid}`, (killErr) => {
        if (killErr) {
          return res.status(500).json({
            error: `Não foi possível desligar o PID ${pid}`,
            details: killErr.message
          });
        }
        res.json({
          success: true,
          message: `Processo finalizado via kill -9 (PID: ${pid}).`
        });
      });
    } else {
      res.json({
        success: true,
        message: `Sandbox encerrada com sucesso usando o protocolo nativo de shutdown (PID: ${pid}).`
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
  });
}

startServer();
