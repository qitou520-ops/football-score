/** 是否连接 MySQL — 仅当 DATABASE_ENABLED=true 时启用，避免未配置数据库时后台不可用 */
export function shouldUseDatabase(): boolean {
  return process.env.DATABASE_ENABLED === "true";
}
