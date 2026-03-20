"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type ContainerOption = {
  id: string;
  name: string;
  statusText: string;
};

export function ContainerManagement() {
  const [containers, setContainers] = useState<ContainerOption[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState("");
  const [isLoadingContainers, setIsLoadingContainers] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedContainer = useMemo(
    () => containers.find((container) => container.id === selectedContainerId),
    [containers, selectedContainerId],
  );

  useEffect(() => {
    async function loadContainers() {
      setIsLoadingContainers(true);
      setErrorMessage("");

      try {
        const response = await fetch("/api/host/overview", {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          error?: string;
          containers?: Array<{
            id: string;
            name: string;
            statusText: string;
          }>;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load containers");
        }

        const nextContainers = payload.containers ?? [];
        setContainers(nextContainers);
        setSelectedContainerId((previous) => {
          if (previous && nextContainers.some((item) => item.id === previous)) {
            return previous;
          }
          return nextContainers[0]?.id ?? "";
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load containers";
        setErrorMessage(message);
      } finally {
        setIsLoadingContainers(false);
      }
    }

    loadContainers();
  }, []);

  async function runAction(action: "start" | "stop") {
    if (!selectedContainerId || isMutating) {
      return;
    }

    setIsMutating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response =
        action === "start"
          ? await fetch("/api/containers/start", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ containerId: selectedContainerId }),
            })
          : await fetch(
              `/api/containers/${encodeURIComponent(selectedContainerId)}/action`,
              {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ action: "stop" }),
              },
            );

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? `Failed to ${action} container`);
      }

      const label = selectedContainer?.name ?? selectedContainerId;
      setSuccessMessage(`${label} ${action} request sent`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to ${action} container`;
      setErrorMessage(message);
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <h2 className="text-lg font-semibold mb-4">Container Management</h2>

      <div className="space-y-3">
        <label className="block text-xs uppercase tracking-[0.2em] text-white/60">
          Container
          <select
            value={selectedContainerId}
            onChange={(event) => setSelectedContainerId(event.target.value)}
            className="mt-2 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            disabled={isLoadingContainers || containers.length === 0}
          >
            {containers.length === 0 ? (
              <option value="">No running containers detected</option>
            ) : null}
            {containers.map((container) => (
              <option key={container.id} value={container.id}>
                {container.name} ({container.statusText})
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <Button
            onClick={() => runAction("start")}
            disabled={isMutating || isLoadingContainers || !selectedContainerId}
          >
            {isMutating ? "Working..." : "Start Container"}
          </Button>
          <Button
            onClick={() => runAction("stop")}
            disabled={isMutating || isLoadingContainers || !selectedContainerId}
            variant="secondary"
          >
            {isMutating ? "Working..." : "Stop Container"}
          </Button>
        </div>

        {errorMessage ? (
          <p className="text-sm text-rose-200">{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="text-sm text-emerald-200">{successMessage}</p>
        ) : null}
      </div>

      <Button
        type="button"
        className="mt-3"
        onClick={() => {
          setErrorMessage("");
          setSuccessMessage("");
          setIsLoadingContainers(true);
          fetch("/api/host/overview", { cache: "no-store" })
            .then(async (response) => {
              const payload = (await response.json()) as {
                error?: string;
                containers?: ContainerOption[];
              };

              if (!response.ok) {
                throw new Error(payload.error ?? "Refresh failed");
              }

              const nextContainers = payload.containers ?? [];
              setContainers(nextContainers);
              setSelectedContainerId((previous) => {
                if (
                  previous &&
                  nextContainers.some((container) => container.id === previous)
                ) {
                  return previous;
                }

                return nextContainers[0]?.id ?? "";
              });
            })
            .catch((error) => {
              const message =
                error instanceof Error ? error.message : "Refresh failed";
              setErrorMessage(message);
            })
            .finally(() => {
              setIsLoadingContainers(false);
            });
        }}
      >
        {isLoadingContainers ? "Refreshing..." : "Refresh Containers"}
      </Button>
    </div>
  );
}
