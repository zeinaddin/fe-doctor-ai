import api from './api';
import type { User } from '../types';

export const userService = {
    // API returns array directly
    async getUsers(skip = 0, limit = 10): Promise<User[]> {
        const response = await api.get<User[]>('/admin/users', {
            params: { skip, limit },
        });
        return response.data;
    },

    async getAllUsers(skip = 0, limit = 20): Promise<User[]> {
        const response = await api.get<User[]>('/admin/users', {
            params: { skip, limit },
        });
        return response.data;
    },

    async getAllPatients(skip = 0, limit = 20): Promise<User[]> {
        const response = await api.get<User[]>('/admin/users/patients', {
            params: { skip, limit },
        });
        return response.data;
    },

    async getUserById(id: number): Promise<User> {
        const response = await api.get<User>(`/admin/users/${id}`);
        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/users/me');
        return response.data;
    },

    async createUser(userData: Partial<User> & { password: string }): Promise<User> {
        const response = await api.post<User>('/admin/users', userData);
        return response.data;
    },

    async updateUser(id: number, userData: Partial<User>): Promise<User> {
        const response = await api.patch<User>(`/admin/users/${id}`, userData);
        return response.data;
    },

    async deleteUser(id: number): Promise<void> {
        await api.delete(`/admin/users/${id}`);
    },
};
