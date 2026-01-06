import api from './api';
import type {
  Consultation,
  ChatMessage,
  ConsultationWithMessages,
  ConsultationAnalysis,
  StartConsultationRequest,
  SendMessageRequest,
} from '../types';

export const aiConsultationService = {
  async startConsultation(data: StartConsultationRequest): Promise<Consultation> {
    const response = await api.post<Consultation>('/ai-consultations', data);
    return response.data;
  },

  async sendMessage(consultationId: number, data: SendMessageRequest): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>(
      `/ai-consultations/${consultationId}/messages`,
      data
    );
    return response.data;
  },

  async sendMessageStream(
    consultationId: number,
    content: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${api.defaults.baseURL}/ai-consultations/${consultationId}/messages/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              return;
            }
            onChunk(data);
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  },

  async completeConsultation(consultationId: number): Promise<ConsultationAnalysis> {
    const response = await api.post<ConsultationAnalysis>(
      `/ai-consultations/${consultationId}/complete`
    );
    return response.data;
  },

  async getMyConsultations(skip = 0, limit = 20): Promise<Consultation[]> {
    const response = await api.get<Consultation[]>('/ai-consultations/me', {
      params: { skip, limit },
    });
    return response.data;
  },

  async getConsultation(consultationId: number): Promise<ConsultationWithMessages> {
    const response = await api.get<ConsultationWithMessages>(
      `/ai-consultations/${consultationId}`
    );
    return response.data;
  },

  async getConsultationMessages(consultationId: number): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(
      `/ai-consultations/${consultationId}/messages`
    );
    return response.data;
  },
};
