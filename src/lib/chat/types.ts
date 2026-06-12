export interface ChatMessageItem {
  id: string;
  matchId: number;
  nickname: string;
  message: string;
  createdAt: string;
}

export interface ChatMessagesResponse {
  matchId: number;
  messages: ChatMessageItem[];
}
