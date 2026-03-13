import api from './api';
import type {SymptomCheckRequest, SymptomCheckResponse} from '../types';

interface ChatSession {
    id: number;
    user_id: number | null;
    source: string;
    status: string;
    locale: string;
    created_at: string;
}

interface ChatMessage {
    id: number;
    session_id: number;
    role: string;
    content: string;
    content_type: string;
    created_at: string;
}

interface ChatSessionWithMessages extends ChatSession {
    messages: ChatMessage[];
}

export const aiService = {
    async checkSymptoms(symptoms: SymptomCheckRequest): Promise<SymptomCheckResponse> {
        // Create a new chat session
        const sessionResponse = await api.post<ChatSession>('/chat/sessions', {
            source: 'web',
            locale: 'en',
            context_json: { type: 'symptom_check' },
        });

        const sessionId = sessionResponse.data.id;

        // Send symptoms as a message - this triggers AI analysis
        const symptomsText = `I need help analyzing these symptoms: ${symptoms.symptoms.join(', ')}${symptoms.age ? `. Patient age: ${symptoms.age}` : ''}${symptoms.gender ? `. Gender: ${symptoms.gender}` : ''}. Please recommend a medical specialty and urgency level.`;

        await api.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, {
            content: symptomsText,
            role: 'user',
            content_type: 'text',
        });

        // Wait a moment for AI to process and get the session with messages
        await new Promise(resolve => setTimeout(resolve, 2000));

        const sessionWithMessages = await api.get<ChatSessionWithMessages>(`/chat/sessions/${sessionId}`);
        const messages = sessionWithMessages.data.messages || [];

        // Find the AI response
        const aiResponse = messages.find(m => m.role === 'assistant');

        if (aiResponse) {
            // Parse the AI response to extract specialty and urgency
            const content = aiResponse.content.toLowerCase();

            // Extract specialty from response
            let specialty = 'GENERAL_PRACTICE';
            const specialties = [
                'cardiology', 'neurology', 'dermatology', 'orthopedics',
                'gastroenterology', 'pulmonology', 'endocrinology',
                'ophthalmology', 'otolaryngology', 'urology', 'psychiatry',
                'pediatrics', 'gynecology', 'rheumatology', 'nephrology',
                'general_practice', 'internal_medicine', 'family_medicine'
            ];

            for (const spec of specialties) {
                if (content.includes(spec)) {
                    specialty = spec.toUpperCase().replace(/ /g, '_');
                    break;
                }
            }

            // Determine urgency
            let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY' = 'MEDIUM';
            if (content.includes('emergency') || content.includes('immediately') || content.includes('urgent')) {
                urgency = 'HIGH';
            } else if (content.includes('serious') || content.includes('soon')) {
                urgency = 'MEDIUM';
            } else if (content.includes('routine') || content.includes('minor')) {
                urgency = 'LOW';
            }

            // Extract recommendations (sentences with "should", "recommend", "suggest")
            const sentences = aiResponse.content.split(/[.!?]+/);
            const recommendations = sentences
                .filter(s => /should|recommend|suggest|advise|consider/i.test(s))
                .map(s => s.trim())
                .filter(s => s.length > 10)
                .slice(0, 5);

            return {
                predictedSpecialty: specialty,
                confidence: 0.75,
                recommendations: recommendations.length > 0 ? recommendations : [
                    'Consult with a healthcare professional for accurate diagnosis',
                    'Keep track of your symptoms and their duration',
                    'Note any factors that worsen or improve your symptoms'
                ],
                urgencyLevel: urgency,
            };
        }

        // Fallback if no AI response
        return {
            predictedSpecialty: 'GENERAL_PRACTICE',
            confidence: 0.5,
            recommendations: [
                'Please consult a general practitioner for initial evaluation',
                'Keep track of your symptoms',
            ],
            urgencyLevel: 'MEDIUM',
        };
    },

    async getMessages(sessionId: number): Promise<ChatMessage[]> {
        const response = await api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
        return response.data;
    },

    async getMySessions(): Promise<ChatSession[]> {
        const response = await api.get<ChatSession[]>('/chat/sessions/me');
        return response.data;
    },

    async getSessionById(id: number): Promise<ChatSessionWithMessages> {
        const response = await api.get<ChatSessionWithMessages>(`/chat/sessions/${id}`);
        return response.data;
    },

    async closeSession(id: number): Promise<ChatSession> {
        const response = await api.post<ChatSession>(`/chat/sessions/${id}/close`);
        return response.data;
    },

    async sendMessage(sessionId: number, content: string): Promise<ChatMessage> {
        const response = await api.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, {
            content,
            role: 'user',
            content_type: 'text',
        });
        return response.data;
    },
};
