import api from './api';
import type { Specialization, SpecializationFormData } from '../types';

export const specializationService = {
  async getSpecializations(): Promise<Specialization[]> {
    const response = await api.get<Specialization[]>('/specializations');
    return response.data;
  },

  async getSpecializationById(id: number): Promise<Specialization> {
    const response = await api.get<Specialization>(`/specializations/${id}`);
    return response.data;
  },

  async createSpecialization(data: SpecializationFormData): Promise<Specialization> {
    const response = await api.post<Specialization>('/specializations', data);
    return response.data;
  },

  async updateSpecialization(id: number, data: Partial<SpecializationFormData>): Promise<Specialization> {
    const response = await api.patch<Specialization>(`/specializations/${id}`, data);
    return response.data;
  },

  async deleteSpecialization(id: number): Promise<void> {
    await api.delete(`/specializations/${id}`);
  },
};
