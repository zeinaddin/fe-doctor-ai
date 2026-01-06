import api from './api';
import type {SymptomCheckRequest, SymptomCheckResponse} from '../types';

interface AIConsultation {
    id: number;
    patient_id: number;
    symptoms: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface AIMessage {
    id: number;
    consultation_id: number;
    role: string;
    content: string;
    created_at: string;
}

export const aiService = {
    async checkSymptoms(symptoms: SymptomCheckRequest): Promise<SymptomCheckResponse> {
        // Create consultation with symptom text
        const symptomsText = `Patient symptoms: ${symptoms.symptoms.join(', ')}${symptoms.age ? `. Age: ${symptoms.age}` : ''}${symptoms.gender ? `. Gender: ${symptoms.gender}` : ''}`;

        const consultationResponse = await api.post<AIConsultation>('/ai-consultations', {
            symptoms_text: symptomsText,
        });

        // Complete the consultation to get AI analysis
        const analysisResponse = await api.post<{
            analysis: {
                recommended_specialization?: string;
                confidence?: number;
                urgency?: string;
                summary?: string;
                key_symptoms?: string[];
                suggested_questions_for_doctor?: string[];
            };
            recommended_doctors: any[];
        }>(`/ai-consultations/${consultationResponse.data.id}/complete`);

        return {
            predictedSpecialty: analysisResponse.data.analysis.recommended_specialization || 'GENERAL_PRACTICE',
            confidence: analysisResponse.data.analysis.confidence || 0.5,
            recommendations: analysisResponse.data.analysis.suggested_questions_for_doctor || [],
            urgencyLevel: (analysisResponse.data.analysis.urgency?.toUpperCase() as any) || 'MEDIUM',
        };
    },

    async getMessages(consultationId: number): Promise<AIMessage[]> {
        const response = await api.get<AIMessage[]>(`/ai-consultations/${consultationId}/messages`);
        return response.data;
    },

    async getMyConsultations(): Promise<AIConsultation[]> {
        const response = await api.get<AIConsultation[]>('/ai-consultations/me');
        return response.data;
    },

    async getConsultationById(id: number): Promise<AIConsultation> {
        const response = await api.get<AIConsultation>(`/ai-consultations/${id}`);
        return response.data;
    },

    async completeConsultation(id: number): Promise<AIConsultation> {
        const response = await api.post<AIConsultation>(`/ai-consultations/${id}/complete`);
        return response.data;
    },

    async sendMessage(consultationId: number, content: string): Promise<AIMessage> {
        const response = await api.post<AIMessage>(`/ai-consultations/${consultationId}/messages`, {
            content,
        });
        return response.data;
    },

    async streamMessages(consultationId: number): Promise<ReadableStream> {
        const token = localStorage.getItem('access_token');
        const baseURL = api.defaults.baseURL;
        const response = await fetch(`${baseURL}/ai-consultations/${consultationId}/messages/stream`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.body) throw new Error('No response body');
        return response.body;
    },
};
