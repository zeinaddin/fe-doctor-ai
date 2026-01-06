import api from './api';
import type {AdminDashboardStats} from '../types';

export const statsService = {
    async getAdminStats(): Promise<AdminDashboardStats> {
        const response = await api.get<AdminDashboardStats>('/admin/stats');
        return response.data;
    },
};
