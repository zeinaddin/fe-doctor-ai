import api from './api';
import type {EMR, EMRFormData} from '../types';

export const emrService = {
    // API returns arrays directly, not paginated responses
    async getEMRs(skip = 0, limit = 10): Promise<EMR[]> {
        const response = await api.get<EMR[]>('/medical-records', {
            params: {skip, limit}
        });
        return response.data;
    },

    async getMyEMRs(skip = 0, limit = 10): Promise<EMR[]> {
        const response = await api.get<EMR[]>('/medical-records/me', {
            params: {skip, limit}
        });
        return response.data;
    },

    async createEMR(emrData: EMRFormData): Promise<EMR> {
        const response = await api.post<EMR>('/medical-records', emrData);
        return response.data;
    },

    async updateEMR(id: number, emrData: Partial<EMRFormData>): Promise<EMR> {
        const response = await api.patch<EMR>(`/medical-records/${id}`, emrData);
        return response.data;
    },

    async deleteEMR(id: number): Promise<void> {
        await api.delete(`/medical-records/${id}`);
    },

    async getPatientEMRs(patientId: number, skip = 0, limit = 10): Promise<EMR[]> {
        const response = await api.get<EMR[]>(`/medical-records/patient/${patientId}`, {
            params: {skip, limit}
        });
        return response.data;
    },

    async addDiagnosisAndPrescription(
        emrId: number,
        data: { diagnosis: string; prescription?: string }
    ): Promise<EMR> {
        const response = await api.patch<EMR>(`/medical-records/${emrId}`, data);
        return response.data;
    },
};
