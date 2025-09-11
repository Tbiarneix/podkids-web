export type AppEpisodeStatus = "unlistened" | "listening" | "listened";
export type DbEpisodeStatus = "UNLISTENED" | "LISTENING" | "LISTENED";

export function dbToAppStatus(s: unknown): AppEpisodeStatus {
  const up = String(s ?? "UNLISTENED").toUpperCase();
  return up === "LISTENED" ? "listened" : up === "LISTENING" ? "listening" : "unlistened";
}

export function appToDbStatus(s: AppEpisodeStatus | undefined): DbEpisodeStatus | undefined {
  if (!s) return undefined;
  if (s === "listened") return "LISTENED";
  if (s === "listening") return "LISTENING";
  return "UNLISTENED";
}

export function sessionStatusesKey(podcastId: number | string) {
  return `webplayer:podcast:${podcastId}:statuses`;
}

export function sessionSortKey(podcastId: number | string) {
  return `webplayer:podcast:${podcastId}:sortAsc`;
}
