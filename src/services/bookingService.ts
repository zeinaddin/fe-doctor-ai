import api from './api';
import type {Booking, BookingFormData, BookingFilters, PaginatedResponse, BookingStatus} from '../types';

export const bookingService = {
    async getBookings(page = 1, pageSize = 10, filters?: BookingFilters): Promise<PaginatedResponse<Booking>> {
        const response = await api.get<PaginatedResponse<Booking>>('/appointments', {
            params: {page, limit: pageSize, ...filters},
        });
        return response.data;
    },

    async getBookingById(id: number): Promise<Booking> {
        const response = await api.get<Booking>(`/appointments/${id}`);
        return response.data;
    },

    async getMyBookings(): Promise<Booking[]> {
        const response = await api.get<Booking[]>('/appointments/me');
        return response.data;
    },

    async createBooking(bookingData: BookingFormData): Promise<Booking> {
        const response = await api.post<Booking>('/appointments', bookingData);
        return response.data;
    },

    async adminCreateBooking(bookingData: BookingFormData & { patient_id: number }): Promise<Booking> {
        const response = await api.post<Booking>('/appointments/admin/create', bookingData);
        return response.data;
    },

    async updateBooking(id: number, bookingData: Partial<BookingFormData>): Promise<Booking> {
        const response = await api.patch<Booking>(`/appointments/${id}`, bookingData);
        return response.data;
    },

    async cancelBooking(id: number): Promise<void> {
        await api.post(`/appointments/${id}/cancel`);
    },

    async updateBookingStatus(id: number, status: BookingStatus): Promise<Booking> {
        // Update via PATCH endpoint
        const response = await api.patch<Booking>(`/appointments/${id}`, {status});
        return response.data;
    },

    async getDoctorBookings(doctorId: number, date?: string): Promise<Booking[]> {
        const params: any = {};
        if (date) {
            params.date_from = date;
            params.date_to = date;
        }
        const response = await api.get<Booking[]>(`/appointments/doctor/${doctorId}`, {
            params,
        });
        return response.data;
    },

    async getMyDoctorBookings(date?: string, status?: BookingStatus): Promise<Booking[]> {
        const params: any = {};
        if (date) {
            params.date_from = date;
            params.date_to = date;
        }
        if (status) {
            params.status = status;
        }
        const response = await api.get<Booking[]>('/appointments/doctor/me', {
            params,
        });
        return response.data;
    },

    async getTodayBookings(status?: BookingStatus): Promise<Booking[]> {
        const today = new Date().toISOString().split('T')[0];
        return this.getMyDoctorBookings(today, status);
    },

    // Doctor appointment stats
    async getMyDoctorAppointmentsStats(date?: string): Promise<{
        total: number;
        active: number;
        done: number;
        scheduled: number;
        confirmed: number;
        in_progress: number;
        completed: number;
        cancelled: number;
        no_show: number;
    }> {
        const params: Record<string, string> = {};
        if (date) {
            params.date = date;
        }
        const response = await api.get('/appointments/doctor/me/stats', { params });
        return response.data;
    },

    // Status management actions
    async confirmAppointment(id: number): Promise<Booking> {
        const response = await api.post<Booking>(`/appointments/${id}/confirm`);
        return response.data;
    },

    async startAppointment(id: number): Promise<Booking> {
        const response = await api.post<Booking>(`/appointments/${id}/start`);
        return response.data;
    },

    async completeAppointment(id: number): Promise<Booking> {
        const response = await api.post<Booking>(`/appointments/${id}/complete`);
        return response.data;
    },

    async markNoShow(id: number): Promise<Booking> {
        const response = await api.post<Booking>(`/appointments/${id}/no-show`);
        return response.data;
    },
};
