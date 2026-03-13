import api from './api';
import type {
  ChatSession,
  ChatSessionWithMessages,
  ChatMessage,
  TriageRun,
  TriageRunWithDetails,
  CreateChatSessionRequest,
  SendChatMessageRequest,
  CreateTriageRequest,
} from '../types';

export const chatService = {
  /**
   * Create a new chat session
   */
  async createSession(data?: CreateChatSessionRequest): Promise<ChatSession> {
    const response = await api.post<ChatSession>('/chat/sessions', {
      source: data?.source || 'web',
      locale: data?.locale || navigator.language.split('-')[0] || 'en',
      context_json: data?.context_json,
    });
    return response.data;
  },

  /**
   * Get all chat sessions for the current user
   */
  async getMySessions(skip = 0, limit = 20, status?: string): Promise<ChatSession[]> {
    const response = await api.get<ChatSession[]>('/chat/sessions/me', {
      params: { skip, limit, status },
    });
    return response.data;
  },

  /**
   * Get a chat session with all messages
   */
  async getSession(sessionId: number): Promise<ChatSessionWithMessages> {
    const response = await api.get<ChatSessionWithMessages>(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Close a chat session
   */
  async closeSession(sessionId: number): Promise<ChatSession> {
    const response = await api.post<ChatSession>(`/chat/sessions/${sessionId}/close`);
    return response.data;
  },

  /**
   * Send a message to a chat session
   */
  async sendMessage(sessionId: number, data: SendChatMessageRequest): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, {
      content: data.content,
      role: data.role || 'user',
      content_type: data.content_type || 'text',
    });
    return response.data;
  },

  /**
   * Get all messages for a chat session
   */
  async getMessages(sessionId: number, skip = 0, limit = 100): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`, {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Create a triage run for doctor matching
   */
  async createTriageRun(sessionId: number, data?: CreateTriageRequest): Promise<TriageRun> {
    const response = await api.post<TriageRun>(`/chat/sessions/${sessionId}/triage`, data || {});
    return response.data;
  },

  /**
   * Get all triage runs for a session
   */
  async getTriageRuns(sessionId: number, skip = 0, limit = 20): Promise<TriageRun[]> {
    const response = await api.get<TriageRun[]>(`/chat/sessions/${sessionId}/triage`, {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Get the latest triage run with doctor candidates
   */
  async getLatestTriageRun(sessionId: number): Promise<TriageRunWithDetails | null> {
    const response = await api.get<TriageRunWithDetails | null>(
      `/chat/sessions/${sessionId}/triage/latest`
    );
    return response.data;
  },

  /**
   * Get a specific triage run with details
   */
  async getTriageRun(triageRunId: number): Promise<TriageRunWithDetails> {
    const response = await api.get<TriageRunWithDetails>(`/chat/triage/${triageRunId}`);
    return response.data;
  },

  /**
   * Send message and wait for AI response (streaming)
   */
  async sendMessageWithStream(
    sessionId: number,
    content: string,
    onChunk: (chunk: string) => void,
    onComplete: (message: ChatMessage) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      // First send the user message
      const userMessage = await this.sendMessage(sessionId, { content });

      // Then poll for AI response or use SSE if available
      // For now, we'll use a simple polling approach
      let attempts = 0;
      const maxAttempts = 60; // 30 seconds max

      const checkForResponse = async () => {
        const messages = await this.getMessages(sessionId);
        const lastMessage = messages[messages.length - 1];

        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id !== userMessage.id) {
          onChunk(lastMessage.content);
          onComplete(lastMessage);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkForResponse, 500);
        } else {
          onError(new Error('AI response timeout'));
        }
      };

      // Start checking after a short delay to allow backend to process
      setTimeout(checkForResponse, 1000);
    } catch (error) {
      onError(error as Error);
    }
  },
};
