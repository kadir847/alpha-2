export type User = {
  id: number;
  email: string;
  created_at: string;
};

export type Message = {
  id: number | string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
};

export type Conversation = {
  id: number;
  title: string;
  created_at: string;
};

export type ConversationDetail = Conversation & {
  messages: Message[];
};

export type AiStatus = {
  requested_provider: string;
  active_provider: string;
  demo_mode: boolean;
  configured: boolean;
  ai_model: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

