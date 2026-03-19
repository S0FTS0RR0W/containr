import { Button } from "@/components/ui/button";

const metrics = [
  {
    label: "Running containers",
    value: "18",
    detail: "+3 since deploy window",
    tone: "emerald",
  },
  {
    label: "Host CPU",
    value: "42%",
    detail: "8-core Debian node",
    tone: "sky",
  },
  {
    label: "Memory in use",
    value: "21.6 GB",
    detail: "of 64 GB available",
    tone: "amber",
  },
  {
    label: "Open terminal sessions",
    value: "4",
    detail: "2 interactive, 2 watch",
    tone: "violet",
  },
] as const;

const containers = [
  {
    name: "api-gateway",
    image: "ghcr.io/containr/gateway:1.8.2",
    status: "healthy",
    cpu: "0.33 cores",
    memory: "512 MB",
    ports: "80, 443",
    uptime: "14d 8h",
  },
  {
    name: "worker-batch",
    image: "ghcr.io/containr/worker:2.1.0",
    status: "warming",
    cpu: "0.82 cores",
    memory: "1.4 GB",
    ports: "internal",
    uptime: "11m",
  },
  {
    name: "postgres-main",
    image: "postgres:16-alpine",
    status: "healthy",
    cpu: "0.29 cores",
    memory: "4.8 GB",
    ports: "5432",
    uptime: "37d 2h",
  },
  {
    name: "redis-cache",
    image: "redis:7.4",
    status: "degraded",
    cpu: "0.18 cores",
    memory: "894 MB",
    ports: "6379",
    uptime: "6d 5h",
  },
] as const;

const activity = [
  {
    title: "Terminal attached to api-gateway",
    detail: "root@api-gateway:/srv/app",
    time: "2m ago",
  },
  {
    title: "Container restart policy changed",
    detail: "worker-batch set to unless-stopped",
    time: "18m ago",
  },
  {
    title: "Image pull completed",
    detail: "postgres:16-alpine pulled in 12.3s",
    time: "44m ago",
  },
  {
    title: "Alert triggered",
    detail: "redis-cache memory threshold exceeded",
    time: "1h ago",
  },
] as const;

const terminalLines = [
  {
    prompt: "ops@node-03",
    path: "~",
    command: 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
  },
  {
    output:
      "api-gateway      Up 14 days (healthy)        0.0.0.0:80->80/tcp, 443->443/tcp",
  },
  { output: "worker-batch     Up 11 minutes               " },
  {
    output:
      "postgres-main    Up 37 days                  0.0.0.0:5432->5432/tcp",
  },
  {
    output:
      "redis-cache      Restarting (137) 22s ago    0.0.0.0:6379->6379/tcp",
  },
  {
    prompt: "ops@node-03",
    path: "~",
    command: "docker exec -it api-gateway sh",
  },
  {
    prompt: "root@api-gateway",
    path: "/srv/app",
    command: "tail -f /var/log/nginx/access.log",
  },
] as const;

const quickActions = [
  "Create container",
  "Open compose stack",
  "Attach terminal",
  "Review host logs",
] as const;

const navigation = [
  { label: "Overview", icon: NavIcon },
  { label: "Containers", icon: StackIcon },
  { label: "Terminal", icon: TerminalIcon },
  { label: "Volumes", icon: NavIcon },
  { label: "Networks", icon: NavIcon },
] as const;

function toneClasses(tone: (typeof metrics)[number]["tone"]) {
  if (tone === "emerald") {
    return "from-emerald-400/30 via-emerald-300/10 to-transparent text-emerald-200";
  }

  if (tone === "sky") {
    return "from-sky-400/30 via-sky-300/10 to-transparent text-sky-200";
  }

  if (tone === "amber") {
    return "from-amber-400/30 via-amber-300/10 to-transparent text-amber-200";
  }

  return "from-violet-400/30 via-violet-300/10 to-transparent text-violet-200";
}

function statusClasses(status: (typeof containers)[number]["status"]) {
  if (status === "healthy") {
    return "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/30";
  }

  if (status === "warming") {
    return "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-400/30";
  }

  return "bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-400/30";
}

function NavIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <path d="M8 9.5h8M8 14.5h5" />
    </svg>
  );
}

function TerminalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <path d="m8 10 2.5 2.5L8 15" />
      <path d="M13 15h3.5" />
    </svg>
  );
}

function StackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="m12 4 8 4.4-8 4.3-8-4.3L12 4Z" />
      <path d="m4 12.1 8 4.4 8-4.4" />
      <path d="m4 15.8 8 4.2 8-4.2" />
    </svg>
  );
}

export default function Dashboard() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(57,189,154,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_26%),linear-gradient(180deg,#07111a_0%,#09141f_38%,#0b1320_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur xl:max-w-72">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(74,222,128,0.35),rgba(14,165,233,0.35))] text-white">
              <StackIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                Containr
              </p>
              <p className="text-lg font-semibold">Control surface</p>
            </div>
          </div>

          <nav className="mt-6 grid gap-2 text-sm text-white/70">
            {navigation.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  label === "Overview"
                    ? "bg-white text-slate-950"
                    : "hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-[1.75rem] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(14,165,233,0.16),rgba(15,23,42,0.25))] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">
              Host status
            </p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold">node-03</p>
                <p className="mt-1 text-sm text-cyan-50/75">
                  Debian 13 . Docker Engine 28.1
                </p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-300/20">
                reachable
              </span>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-cyan-50/80 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                <p className="text-white/55">Docker socket</p>
                <p className="mt-1 font-medium">unix:///var/run/docker.sock</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                <p className="text-white/55">Compose projects</p>
                <p className="mt-1 font-medium">7 stacks tracked</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">
              Quick actions
            </p>
            <div className="mt-4 grid gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  className="justify-between rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  {action}
                  <span className="text-white/45">+</span>
                </Button>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 space-y-6 rounded-[2rem] border border-white/10 bg-black/20 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-5 lg:p-6">
          <header className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(17,24,39,0.84),rgba(12,74,110,0.52)_55%,rgba(5,150,105,0.38))] p-6 sm:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                  Docker operations dashboard
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Manage Linux containers and drop into terminals without
                  leaving the control plane.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                  This starter dashboard is set up for host metrics, container
                  lifecycle actions, and interactive shell access. It gives you
                  a strong landing page to connect Docker APIs, exec sessions,
                  compose stacks, and log streams next.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="rounded-2xl bg-white text-slate-950 hover:bg-white/90">
                  Launch terminal
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/15 bg-white/8 text-white hover:bg-white/12 hover:text-white"
                >
                  New container
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">
              {[
                "SSH tunnel ready",
                "Exec API idle",
                "4 terminals active",
                "1 alert requires review",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5"
                >
                  {item}
                </span>
              ))}
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/6 p-5"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-24 bg-linear-to-b ${toneClasses(metric.tone)} opacity-80`}
                />
                <div className="relative">
                  <p className="text-sm text-white/60">{metric.label}</p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <p className="text-4xl font-semibold tracking-tight">
                      {metric.value}
                    </p>
                    <div className="flex h-10 items-end gap-1.5">
                      <span className="h-4 w-2 rounded-full bg-white/25" />
                      <span className="h-8 w-2 rounded-full bg-white/45" />
                      <span className="h-6 w-2 rounded-full bg-white/35" />
                      <span className="h-10 w-2 rounded-full bg-white/80" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-white/65">{metric.detail}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-6 2xl:grid-cols-[1.55fr_0.95fr]">
            <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                    Containers
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    Fleet overview
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    Filter
                  </Button>
                  <Button className="rounded-2xl bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                    Deploy stack
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {containers.map((container) => (
                  <article
                    key={container.name}
                    className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/20 hover:bg-black/25 lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.65fr_auto] lg:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-medium">
                          {container.name}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(container.status)}`}
                        >
                          {container.status}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-xs text-white/45">
                        {container.image}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                        CPU
                      </p>
                      <p className="mt-1 text-sm text-white/80">
                        {container.cpu}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                        Memory
                      </p>
                      <p className="mt-1 text-sm text-white/80">
                        {container.memory}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                        Ports
                      </p>
                      <p className="mt-1 text-sm text-white/80">
                        {container.ports}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <span className="text-xs text-white/45">
                        {container.uptime}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      >
                        Logs
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl bg-white text-slate-950 hover:bg-white/90"
                      >
                        Shell
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div className="space-y-6">
              <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#071017]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/45">
                      Terminal
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">
                      Live shell preview
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-400/12 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-300/20">
                    connected
                  </span>
                </div>
                <div className="space-y-3 px-5 py-5 font-mono text-sm text-emerald-200/90">
                  {terminalLines.map((line, index) => (
                    <div
                      key={`${index}-${"command" in line ? line.command : line.output}`}
                    >
                      {"output" in line ? (
                        <p className="text-emerald-100/70">{line.output}</p>
                      ) : (
                        <p>
                          <span className="text-cyan-300">{line.prompt}</span>
                          <span className="text-white/35">:</span>
                          <span className="text-sky-200">{line.path}</span>
                          <span className="text-white/35">$ </span>
                          <span>{line.command}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                  Activity
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Recent operations
                </h2>
                <div className="mt-5 space-y-4">
                  {activity.map((item) => (
                    <article
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="mt-1 text-sm text-white/58">
                            {item.detail}
                          </p>
                        </div>
                        <span className="text-xs text-white/38">
                          {item.time}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
