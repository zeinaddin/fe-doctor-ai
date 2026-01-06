import api from './api';
import type {DoctorDaySlot, Schedule, ScheduleFormData} from '../types';

export const scheduleService = {
  async getSchedules(doctorId?: number): Promise<Schedule[]> {
    const response = await api.get<Schedule[]>('/schedules', {
      params: { doctor_id: doctorId },
    });
    return response.data;
  },

  async getScheduleById(id: number): Promise<Schedule> {
    const response = await api.get<Schedule>(`/schedules/${id}`);
    return response.data;
  },

  async getMySchedules(): Promise<Schedule[]> {
    const response = await api.get<Schedule[]>('/schedules/me');
    return response.data;
  },

  async getDoctorSchedules(doctorId: number): Promise<Schedule[]> {
    const response = await api.get<Schedule[]>(`/schedules/doctor/${doctorId}`);
    return response.data;
  },

  async createSchedule(scheduleData: ScheduleFormData): Promise<Schedule> {
    const response = await api.post<Schedule>('/schedules', scheduleData);
    return response.data;
  },

  async updateSchedule(id: number, scheduleData: Partial<ScheduleFormData>): Promise<Schedule> {
    const response = await api.patch<Schedule>(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  async deleteSchedule(id: number): Promise<void> {
    await api.delete(`/schedules/${id}`);
  },

  async getAvailableSlots(doctorId: number, slotDate: string): Promise<DoctorDaySlot[]> {
    const response = await api.get<DoctorDaySlot[]>(
        `/schedules/doctor/${doctorId}/slots`,
        { params: { slot_date: slotDate } }
    );
    return response.data;
  },
};
