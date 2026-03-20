import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DOCKER_BIN = process.env.DOCKER_BIN ?? "docker";
const DOCKER_TIMEOUT_MS = Number(process.env.DOCKER_CMD_TIMEOUT_MS ?? 7000);
const EXEC_OPTIONS = {
  timeout: DOCKER_TIMEOUT_MS,
  maxBuffer: 4 * 1024 * 1024,
  windowsHide: true,
} as const;

export type ContainerHealth = "healthy" | "warming" | "degraded";

export type HostContainer = {
  id: string;
  name: string;
  image: string;
  status: ContainerHealth;
  statusText: string;
  cpu: string;
  memory: string;
  ports: string;
  uptime: string;
};

export type TerminalLine =
  | {
      type: "command";
      prompt: string;
      path: string;
      command: string;
    }
  | {
      type: "output";
      output: string;
    };

export type HostActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export type HostSnapshot = {
  connected: boolean;
  error?: string;
  capturedAt: string;
  hostName: string;
  operatingSystem: string;
  engineVersion: string;
  dockerContext: string;
  dockerSocket: string;
  composeProjects: number;
  runningContainers: number;
  cpuLabel: string;
  memoryUsedLabel: string;
  memoryTotalLabel: string;
  terminalSessions: number;
  containers: HostContainer[];
  terminalLines: TerminalLine[];
  activity: HostActivity[];
};

type DockerPsItem = {
  ID: string;
  Image: string;
  Names: string;
  Ports: string;
  Status: string;
  RunningFor: string;
};

type DockerStatsItem = {
  Name: string;
  CPUPerc: string;
  MemUsage: string;
};

type DockerInfo = {
  Name?: string;
  OperatingSystem?: string;
  DockerRootDir?: string;
  NCPU?: number;
  MemTotal?: number;
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function parseSizeToBytes(raw: string): number {
  const match = raw.trim().match(/([\d.]+)\s*([kmgtp]?i?b)/i);
  if (!match) {
    return 0;
  }

  const value = Number(match[1]);
  if (!Number.isFinite(value)) {
    return 0;
  }

  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    b: 1,
    kb: 1000,
    mb: 1000 ** 2,
    gb: 1000 ** 3,
    tb: 1000 ** 4,
    pb: 1000 ** 5,
    kib: 1024,
    mib: 1024 ** 2,
    gib: 1024 ** 3,
    tib: 1024 ** 4,
    pib: 1024 ** 5,
  };

  return value * (multipliers[unit] ?? 0);
}

function parseJsonLines<T>(content: string): T[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function inferContainerHealth(statusText: string): ContainerHealth {
  const normalized = statusText.toLowerCase();

  if (
    normalized.includes("unhealthy") ||
    normalized.includes("restarting") ||
    normalized.includes("dead") ||
    normalized.includes("exited")
  ) {
    return "degraded";
  }

  if (normalized.includes("starting") || normalized.includes("created")) {
    return "warming";
  }

  return "healthy";
}

async function runDockerCommand(args: string[]): Promise<string> {
  const result = await execFileAsync(DOCKER_BIN, args, EXEC_OPTIONS);
  return result.stdout.trim();
}

async function tryDockerCommand(args: string[]): Promise<string> {
  try {
    return await runDockerCommand(args);
  } catch {
    return "";
  }
}

export async function getHostSnapshot(): Promise<HostSnapshot> {
  try {
    const [dockerContext, engineVersion, infoRaw, psRaw, statsRaw] =
      await Promise.all([
        tryDockerCommand(["context", "show"]),
        runDockerCommand(["version", "--format", "{{.Server.Version}}"]),
        runDockerCommand(["info", "--format", "{{json .}}"]),
        runDockerCommand(["ps", "--no-trunc", "--format", "{{json .}}"]),
        tryDockerCommand(["stats", "--no-stream", "--format", "{{json .}}"]),
      ]);

    const info = JSON.parse(infoRaw) as DockerInfo;
    const psRows = parseJsonLines<DockerPsItem>(psRaw);
    const statRows = parseJsonLines<DockerStatsItem>(statsRaw);
    const statsByName = new Map(statRows.map((row) => [row.Name, row]));

    let memoryUsedBytes = 0;

    const containers: HostContainer[] = psRows.slice(0, 12).map((container) => {
      const stats = statsByName.get(container.Names);
      const memoryUsage = stats?.MemUsage?.split("/")[0]?.trim() ?? "n/a";
      memoryUsedBytes += parseSizeToBytes(memoryUsage);

      return {
        id: container.ID,
        name: container.Names,
        image: container.Image,
        status: inferContainerHealth(container.Status),
        statusText: container.Status,
        cpu: stats?.CPUPerc?.trim() || "n/a",
        memory: memoryUsage || "n/a",
        ports: container.Ports?.trim() || "internal",
        uptime: container.RunningFor,
      };
    });

    const terminalOutput = await tryDockerCommand([
      "ps",
      "--format",
      "table {{.Names}}\t{{.Status}}\t{{.Ports}}",
    ]);

    const terminalLines: TerminalLine[] = [
      {
        type: "command",
        prompt: "ops@host",
        path: "~",
        command:
          'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
      },
      ...terminalOutput
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(0, 8)
        .map((output) => ({ type: "output", output }) as TerminalLine),
      {
        type: "command",
        prompt: "ops@host",
        path: "~",
        command:
          containers.length > 0
            ? `docker exec -it ${containers[0].name} sh`
            : "docker context ls",
      },
    ];

    const activity: HostActivity[] = [
      {
        id: "snapshot",
        title: "Host snapshot refreshed",
        detail: `Connected to ${dockerContext || "default"} context`,
        time: "just now",
      },
      ...containers.slice(0, 3).map((container) => ({
        id: container.id,
        title: `${container.name} is ${container.status}`,
        detail: `${container.image} . ${container.statusText}`,
        time: container.uptime,
      })),
    ];

    const composeProjects = Number(
      (
        await tryDockerCommand([
          "ps",
          "--filter",
          "label=com.docker.compose.project",
          "--format",
          '{{.Label "com.docker.compose.project"}}',
        ])
      )
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((value, index, all) => all.indexOf(value) === index).length,
    );

    return {
      connected: true,
      capturedAt: new Date().toISOString(),
      hostName: info.Name || "docker-host",
      operatingSystem: info.OperatingSystem || "unknown os",
      engineVersion,
      dockerContext: dockerContext || "default",
      dockerSocket:
        process.env.DOCKER_HOST ||
        process.env.DOCKER_SOCKET ||
        "unix:///var/run/docker.sock",
      composeProjects,
      runningContainers: containers.length,
      cpuLabel: `${info.NCPU ?? 0} cores`,
      memoryUsedLabel: formatBytes(memoryUsedBytes),
      memoryTotalLabel: formatBytes(info.MemTotal ?? 0),
      terminalSessions: 0,
      containers,
      terminalLines,
      activity,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";

    return {
      connected: false,
      error: reason,
      capturedAt: new Date().toISOString(),
      hostName: "unreachable",
      operatingSystem: "unknown",
      engineVersion: "n/a",
      dockerContext: "n/a",
      dockerSocket:
        process.env.DOCKER_HOST ||
        process.env.DOCKER_SOCKET ||
        "unix:///var/run/docker.sock",
      composeProjects: 0,
      runningContainers: 0,
      cpuLabel: "n/a",
      memoryUsedLabel: "n/a",
      memoryTotalLabel: "n/a",
      terminalSessions: 0,
      containers: [],
      terminalLines: [
        {
          type: "command",
          prompt: "ops@host",
          path: "~",
          command: "docker ps",
        },
        {
          type: "output",
          output:
            "Failed to connect to Docker host. Verify docker daemon and context.",
        },
      ],
      activity: [
        {
          id: "connectivity-error",
          title: "Docker connection failed",
          detail: reason,
          time: "just now",
        },
      ],
    };
  }
}
