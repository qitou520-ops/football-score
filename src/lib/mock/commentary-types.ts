export type CommentaryEventType =
  | "goal"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "var"
  | "status";

export type CommentaryTeamSide = "home" | "away" | null;

export interface LiveCommentaryItem {
  id: string;
  matchId: number;
  /** null for status events like HT/FT */
  minute: number | null;
  extraMinute?: number;
  type: CommentaryEventType;
  team: CommentaryTeamSide;
  player?: string;
  playerOut?: string;
  playerIn?: string;
  assist?: string;
  score?: { home: number; away: number };
  /** 状态类型：kickoff | ht | ft | second_half */
  statusKind?: "kickoff" | "ht" | "ft" | "second_half";
  text: string;
  detail?: string;
}

export interface LiveCommentaryResponse {
  matchId: number;
  isLive: boolean;
  elapsed: number | null;
  status: string;
  items: LiveCommentaryItem[];
  updatedAt: string;
}
