import type { FootballProviderId } from "@/lib/football/types";

export class FootballProviderError extends Error {
  constructor(
    message: string,
    public readonly providerId: FootballProviderId,
    public readonly statusCode = 500
  ) {
    super(message);
    this.name = "FootballProviderError";
  }
}

export class ProviderNotConfiguredError extends FootballProviderError {
  constructor(providerId: FootballProviderId) {
    super(`数据供应商 ${providerId} 未配置`, providerId, 503);
    this.name = "ProviderNotConfiguredError";
  }
}

export class ProviderNotImplementedError extends FootballProviderError {
  constructor(providerId: FootballProviderId, method: string) {
    super(`数据供应商 ${providerId} 尚未实现: ${method}`, providerId, 501);
    this.name = "ProviderNotImplementedError";
  }
}
