import { Router } from 'express';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

export const systemRouter = Router();

const execAsync = promisify(exec);

/** Compute CPU usage % by sampling ticks 500 ms apart */
function cpuUsage(): Promise<number> {
  return new Promise((resolve) => {
    const cpus1 = os.cpus();
    setTimeout(() => {
      const cpus2 = os.cpus();
      let totalIdle = 0, totalTick = 0;
      for (let i = 0; i < cpus1.length; i++) {
        const before = cpus1[i].times;
        const after  = cpus2[i].times;
        const idle = after.idle - before.idle;
        const total =
          (after.user - before.user) +
          (after.nice - before.nice) +
          (after.sys  - before.sys)  +
          (after.idle - before.idle) +
          (after.irq  - before.irq);
        totalIdle += idle;
        totalTick += total;
      }
      resolve(totalTick === 0 ? 0 : Math.round(((totalTick - totalIdle) / totalTick) * 100));
    }, 500);
  });
}

/** Parse `df -BK /` output to get disk usage in bytes */
async function diskUsage(): Promise<{ total: number; used: number; free: number } | null> {
  try {
    const { stdout } = await execAsync('df -BK /');
    const lines = stdout.trim().split('\n');
    if (lines.length < 2) return null;
    const parts = lines[1].split(/\s+/);
    const total = parseInt(parts[1]) * 1024;
    const used  = parseInt(parts[2]) * 1024;
    const free  = parseInt(parts[3]) * 1024;
    return { total, used, free };
  } catch {
    return null;
  }
}

/** CPU temperature — works on Raspberry Pi and most Linux boards */
async function cpuTemp(): Promise<number | null> {
  try {
    const { stdout } = await execAsync('cat /sys/class/thermal/thermal_zone0/temp');
    return Math.round(parseInt(stdout.trim()) / 1000);
  } catch {
    return null;
  }
}

systemRouter.get('/summary', async (_req, res) => {
  try {
    const [cpu, disk, temp] = await Promise.all([cpuUsage(), diskUsage(), cpuTemp()]);

    const totalMem = os.totalmem();
    const freeMem  = os.freemem();

    const nets = os.networkInterfaces();
    const interfaces = Object.entries(nets)
      .flatMap(([name, addrs]) =>
        (addrs ?? [])
          .filter((a) => !a.internal)
          .map((a) => ({ name, family: a.family, address: a.address, mac: a.mac }))
      );

    res.json({
      hostname:   os.hostname(),
      platform:   os.platform(),
      arch:       os.arch(),
      uptimeSecs: os.uptime(),
      cpuModel:   os.cpus()[0]?.model ?? 'Unknown',
      cpuCores:   os.cpus().length,
      cpuUsage:   cpu,
      loadAvg:    os.loadavg(),
      totalMem,
      freeMem,
      usedMem:    totalMem - freeMem,
      disk,
      temp,
      interfaces,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
