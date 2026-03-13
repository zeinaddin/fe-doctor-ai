import api from './api';
import type {
    Doctor,
    DoctorFormData,
    DoctorFilters,
    DoctorDashboardStats,
    DoctorStatusFormData
} from '@/types';

export const doctorService = {
    // API returns array directly, not paginated response
    async getDoctors(skip = 0, limit = 10, filters?: DoctorFilters): Promise<Doctor[]> {
        const response = await api.get<Doctor[]>('/doctors', {
            params: {skip, limit, ...filters},
        });
        return response.data;
    },

    async getDoctorById(id: number): Promise<Doctor> {
        const response = await api.get<Doctor>(`/doctors/${id}`);
        return response.data;
    },

    async getCurrentDoctor(): Promise<Doctor> {
        const response = await api.get<Doctor>('/doctors/me');
        return response.data;
    },

    // API returns { has_application, status, rejection_reason }
    async getDoctorStatus(): Promise<{ has_application: boolean; status?: string; rejection_reason?: string }> {
        const response = await api.get<{ has_application: boolean; status?: string; rejection_reason?: string }>('/doctors/me/status');
        return response.data;
    },

    async registerDoctor(doctorData: DoctorFormData): Promise<Doctor> {
        const response = await api.post<Doctor>('/doctors/register', doctorData);
        return response.data;
    },

    async withdrawDoctorApplication(): Promise<void> {
        await api.delete('/doctors/me');
    },

    async createDoctor(doctorData: DoctorFormData): Promise<Doctor> {
        const response = await api.post<Doctor>('/admin/doctors/create', doctorData);
        return response.data;
    },

    async updateDoctor(id: number, doctorData: Partial<DoctorFormData>): Promise<Doctor> {
        const response = await api.patch<Doctor>(`/doctors/${id}`, doctorData);
        return response.data;
    },

    async updateDoctorAdmin(id: number, doctorData: Partial<DoctorFormData>): Promise<Doctor> {
        const response = await api.patch<Doctor>(`/admin/doctors/${id}/update`, doctorData);
        return response.data;
    },


    async deleteDoctor(id: number): Promise<void> {
        await api.delete(`/admin/doctors/${id}`);
    },


    async updateDoctorStatus(doctorId: number, statusData: Partial<DoctorStatusFormData>): Promise<Doctor> {
        const response = await api.patch<Doctor>(`/admin/doctors/${doctorId}/status`, statusData);
        return response.data;
    },

    async getDoctorStats(): Promise<DoctorDashboardStats> {
        // Get today's stats from appointments endpoint
        const today = new Date().toISOString().split('T')[0];
        const statsResponse = await api.get<{
            total: number;
            active: number;
            done: number;
            scheduled: number;
            confirmed: number;
            in_progress: number;
            completed: number;
            cancelled: number;
            no_show: number;
        }>('/appointments/doctor/me/stats', { params: { date: today } });

        // Get all-time stats (without date filter)
        const allTimeResponse = await api.get<{
            total: number;
            active: number;
            done: number;
            completed: number;
        }>('/appointments/doctor/me/stats');

        // Get unique patients count from all appointments
        const appointmentsResponse = await api.get<Array<{ patient_id: number }>>('/appointments/doctor/me');
        const uniquePatients = new Set(appointmentsResponse.data.map(a => a.patient_id));

        return {
            todayAppointments: statsResponse.data.total || 0,
            upcomingAppointments: statsResponse.data.active || 0,
            completedAppointments: allTimeResponse.data.completed || 0,
            totalPatients: uniquePatients.size,
        };
    },
};
