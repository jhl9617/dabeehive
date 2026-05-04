import type { RunStatus } from "./domain";

export const RUN_STATUS_TRANSITIONS: Record<
  RunStatus,
  readonly RunStatus[]
> = {
  queued: ["planning", "failed", "cancelled"],
  planning: ["waiting_approval", "coding", "failed", "cancelled"],
  waiting_approval: ["coding", "reviewing", "succeeded", "failed", "cancelled"],
  coding: ["reviewing", "waiting_approval", "failed", "cancelled"],
  reviewing: ["waiting_approval", "succeeded", "failed", "cancelled"],
  succeeded: [],
  failed: [],
  cancelled: []
};

export const TERMINAL_RUN_STATUSES: readonly RunStatus[] = [
  "succeeded",
  "failed",
  "cancelled"
];

export function getNextRunStatuses(status: RunStatus): RunStatus[] {
  return [...RUN_STATUS_TRANSITIONS[status]];
}

export function canTransitionRunStatus(
  from: RunStatus,
  to: RunStatus
): boolean {
  return RUN_STATUS_TRANSITIONS[from].includes(to);
}

export function isTerminalRunStatus(status: RunStatus): boolean {
  return TERMINAL_RUN_STATUSES.includes(status);
}

export function assertRunStatusTransition(
  from: RunStatus,
  to: RunStatus
): void {
  if (!canTransitionRunStatus(from, to)) {
    throw new Error(getRunStatusTransitionError(from, to));
  }
}

export function getRunStatusTransitionError(
  from: RunStatus,
  to: RunStatus
): string {
  return `Invalid run status transition: ${from} -> ${to}`;
}
