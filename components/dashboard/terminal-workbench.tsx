"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { TerminalLine } from "@/lib/host-snapshot";

type TerminalContainerOption = {
  id: string;
  name: string;
  statusText: string;
};

type TerminalEntry = {
  id: string;
  type: "command" | "output";
  text: string;
};

type TerminalWorkbenchProps = {
  containers: TerminalContainerOption[];
  initialLines: TerminalLine[];
};

function makeEntryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapInitialLines(lines: TerminalLine[]): TerminalEntry[] {
  return lines.map((line) =>
    line.type === "command"
      ? {
          id: makeEntryId(),
          type: "command",
          text: `${line.prompt}:${line.path}$ ${line.command}`,
        }
      : {
          id: makeEntryId(),
          type: "output",
          text: line.output,
        },
  );
}

export function TerminalWorkbench({
  containers,
  initialLines,
}: TerminalWorkbenchProps) {
  const [selectedContainerId, setSelectedContainerId] = useState(
    containers[0]?.id ?? "",
  );
  const [commandInput, setCommandInput] = useState("pwd");
  const [entries, setEntries] = useState<TerminalEntry[]>(() =>
    mapInitialLines(initialLines),
  );
  const [isRunning, setIsRunning] = useState(false);

  const selectedContainer = useMemo(
    () => containers.find((container) => container.id === selectedContainerId),
    [containers, selectedContainerId],
  );

  async function runCommand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const command = commandInput.trim();
    if (!selectedContainerId || !command || isRunning) {
      return;
    }

    setIsRunning(true);
    setEntries((previous) => [
      ...previous,
      {
        id: makeEntryId(),
        type: "command",
        text: `ops@${selectedContainer?.name ?? "container"}:~$ ${command}`,
      },
    ]);

    try {
      const response = await fetch(
        `/api/containers/${encodeURIComponent(selectedContainerId)}/exec`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ command }),
        },
      );

      const payload = (await response.json()) as {
        output?: string;
        error?: string;
        exitCode?: number;
      };

      if (!response.ok) {
        setEntries((previous) => [
          ...previous,
          {
            id: makeEntryId(),
            type: "output",
            text: payload.error ?? "Failed to execute command",
          },
        ]);
        return;
      }

      const suffix =
        typeof payload.exitCode === "number" && payload.exitCode !== 0
          ? `\n[exit ${payload.exitCode}]`
          : "";

      setEntries((previous) => [
        ...previous,
        {
          id: makeEntryId(),
          type: "output",
          text: `${payload.output ?? "(no output)"}${suffix}`,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown terminal error";
      setEntries((previous) => [
        ...previous,
        { id: makeEntryId(), type: "output", text: message },
      ]);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={runCommand}
        className="space-y-3 rounded-xl border border-white/10 bg-black/15 p-4"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="space-y-1 text-xs uppercase tracking-[0.25em] text-emerald-100/50">
            Container
            <select
              value={selectedContainerId}
              onChange={(event) => setSelectedContainerId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm normal-case tracking-normal text-emerald-100"
              disabled={containers.length === 0}
            >
              {containers.length === 0 ? (
                <option value="">No containers available</option>
              ) : null}
              {containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name} ({container.statusText})
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setEntries([])}
            >
              Clear
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-emerald-300 text-slate-950 hover:bg-emerald-200"
              disabled={isRunning || !selectedContainerId}
            >
              {isRunning ? "Running..." : "Run"}
            </Button>
          </div>
        </div>

        <label className="space-y-1 text-xs uppercase tracking-[0.25em] text-emerald-100/50">
          Command
          <input
            value={commandInput}
            onChange={(event) => setCommandInput(event.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm normal-case tracking-normal text-emerald-100"
            placeholder="e.g. ls -la /srv/app"
          />
        </label>
      </form>

      <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm text-emerald-200/90">
        {entries.length === 0 ? (
          <p className="text-emerald-100/60">
            Run a command to start an interactive shell history.
          </p>
        ) : null}
        {entries.map((entry) => (
          <pre
            key={entry.id}
            className={
              entry.type === "command" ? "text-cyan-300" : "text-emerald-100/80"
            }
          >
            {entry.text}
          </pre>
        ))}
      </div>
    </div>
  );
}
