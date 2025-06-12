import api from './api';
import { ChatSession, ChatMessage, SendMessageRequest } from '@/types';

export const chatService = {
  async getSessions(): Promise<ChatSession[]> {
    const response = await api.get<ChatSession[]>('/chat/sessions');
    return response.data;
  },

  async createSession(title?: string): Promise<ChatSession> {
    const response = await api.post<ChatSession>('/chat/sessions', { title });
    return response.data;
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  },

  async sendMessage(messageData: SendMessageRequest): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>('/chat/messages', messageData);
    return response.data;
  },
}; 