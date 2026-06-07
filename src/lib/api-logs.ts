import "server-only";

import { prisma } from "@/lib/db/prisma";
import { shouldUseDatabase } from "@/lib/db/is-enabled";

interface LogEntry {
  endpoint: string;
  method: string;
  statusCode?: number;
  durationMs?: number;
  cached: boolean;
  error?: string;
  createdAt: Date;
}

const memoryLogs: LogEntry[] = [];
const MAX_MEMORY_LOGS = 2000;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function logApiRequest(params: {
  endpoint: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  cached?: boolean;
  error?: string;
}): Promise<void> {
  const entry: LogEntry = {
    endpoint: params.endpoint,
    method: params.method ?? "GET",
    statusCode: params.statusCode,
    durationMs: params.durationMs,
    cached: params.cached ?? false,
    error: params.error,
    createdAt: new Date(),
  };

  if (shouldUseDatabase()) {
    try {
      await prisma.apiLog.create({
        data: {
          endpoint: entry.endpoint,
          method: entry.method,
          statusCode: entry.statusCode,
          durationMs: entry.durationMs,
          cached: entry.cached,
          error: entry.error,
        },
      });
      return;
    } catch {
      /* fallback to memory */
    }
  }

  memoryLogs.push(entry);
  if (memoryLogs.length > MAX_MEMORY_LOGS) {
    memoryLogs.splice(0, memoryLogs.length - MAX_MEMORY_LOGS);
  }
}

export async function getTodayApiRequestCount(): Promise<number> {
  const since = startOfToday();

  if (shouldUseDatabase()) {
    try {
      return await prisma.apiLog.count({
        where: { createdAt: { gte: since }, cached: false },
      });
    } catch {
      /* fallback */
    }
  }

  return memoryLogs.filter((l) => !l.cached && l.createdAt >= since).length;
}

export async function getRecentApiLogs(limit = 20) {
  if (shouldUseDatabase()) {
    try {
      return await prisma.apiLog.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch {
      /* fallback */
    }
  }

  return memoryLogs
    .slice(-limit)
    .reverse()
    .map((l, i) => ({
      id: String(i),
      endpoint: l.endpoint,
      method: l.method,
      statusCode: l.statusCode,
      durationMs: l.durationMs,
      cached: l.cached,
      error: l.error,
      createdAt: l.createdAt,
    }));
}
