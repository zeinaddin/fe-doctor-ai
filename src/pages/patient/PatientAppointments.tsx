import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {Calendar, Clock, Phone, Mail, Plus} from 'lucide-react';
import {format} from 'date-fns';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {useAuth} from '../../contexts/AuthContext';
import {bookingService} from '../../services/bookingService';
import {BookAppointmentForm} from '@/components/forms/BookAppointmentForm';
import type {Appointment, AppointmentStatus, AppointmentFormData} from '../../types';

export const PatientAppointments: React.FC = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const [selectedFilter, setSelectedFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

    const {data: appointments = [], isLoading} = useQuery<Appointment[]>({
        queryKey: ['patientAppointments', user?.id],
        queryFn: () => bookingService.getMyBookings(),
        enabled: !!user,
    });

    const createBookingMutation = useMutation({
        mutationFn: (data: AppointmentFormData) => bookingService.createBooking(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['patientAppointments']});
            setBookingDialogOpen(false);
        },
    });

    const handleBookAppointment = async (data: AppointmentFormData) => {
        try {
            await createBookingMutation.mutateAsync(data);
        } catch (error) {
            console.error('Failed to book appointment:', error);
            alert('Failed to book appointment. Please try again.');
        }
    };

    const getStatusBadgeVariant = (status: AppointmentStatus) => {
        switch (status) {
            case 'confirmed':
                return 'success';
            case 'scheduled':
                return 'warning';
            case 'cancelled':
                return 'destructive';
            case 'completed':
                return 'default';
            case 'no_show':
                return 'secondary';
            case 'in_progress':
                return 'default';
            default:
                return 'outline';
        }
    };

    const filteredAppointments = selectedFilter === 'ALL'
        ? appointments
        : appointments.filter(apt => apt.status === selectedFilter);

    const upcomingAppointments = appointments.filter(
        apt => apt.status === 'confirmed' || apt.status === 'scheduled'
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('patientAppointments.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('patientAppointments.subtitle')}</p>
                </div>
                <Button onClick={() => setBookingDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4"/>
                    {t('patientAppointments.bookAppointment')}
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-600"/>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{appointments.length}</p>
                                <p className="text-sm text-muted-foreground">{t('patientAppointments.total')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-green-600"/>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                                <p className="text-sm text-muted-foreground">{t('patientAppointments.upcoming')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-purple-600"/>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {appointments.filter(a => a.status === 'completed').length}
                                </p>
                                <p className="text-sm text-muted-foreground">{t('patientAppointments.completed')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-red-600"/>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {appointments.filter(a => a.status === 'cancelled').length}
                                </p>
                                <p className="text-sm text-muted-foreground">{t('patientAppointments.cancelled')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('ALL')}
                >
                    {t('common.all')}
                </Button>
                <Button
                    variant={selectedFilter === 'confirmed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('confirmed')}
                >
                    {t('common.confirmed')}
                </Button>
                <Button
                    variant={selectedFilter === 'scheduled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('scheduled')}
                >
                    {t('common.scheduled')}
                </Button>
                <Button
                    variant={selectedFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('completed')}
                >
                    {t('common.completed')}
                </Button>
                <Button
                    variant={selectedFilter === 'cancelled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('cancelled')}
                >
                    {t('common.cancelled')}
                </Button>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20"/>
                            <h3 className="text-lg font-semibold mb-2">{t('patientAppointments.noAppointmentsFound')}</h3>
                            <p className="text-muted-foreground mb-4">
                                {selectedFilter === 'ALL'
                                    ? t('patientAppointments.noAppointmentsYet')
                                    : t('patientAppointments.noStatusAppointments', {status: selectedFilter})}
                            </p>
                            <Button onClick={() => setBookingDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4"/>
                                {t('patientAppointments.bookAppointment')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredAppointments.map((appointment) => (
                        <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Calendar className="h-7 w-7 text-primary"/>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">
                                                {appointment.doctor_name ? `Dr. ${appointment.doctor_name}` : 'Doctor'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {appointment.specialization_name || 'Specialist'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(appointment.status) as any}>
                                        {appointment.status.toUpperCase().replace('_', ' ')}
                                    </Badge>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                                        <span>{format(new Date(appointment.date_time), 'EEEE, MMMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-muted-foreground"/>
                                        <span>{format(new Date(appointment.date_time), 'HH:mm')}</span>
                                    </div>
                                    {appointment.doctor_name && (
                                        <>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground"/>
                                                <span>{t('patientAppointments.contactViaClinic')}</span>
                                            </div>
                                            {appointment.patient_phone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-muted-foreground"/>
                                                    <span>{appointment.patient_phone}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {appointment.notes && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-sm font-medium mb-1">{t('common.notes')}:</p>
                                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                                    </div>
                                )}

                                <div className="mt-4 flex gap-2">
                                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                                        <>
                                            <Button variant="outline" size="sm">{t('patientAppointments.reschedule')}</Button>
                                            <Button variant="outline" size="sm"
                                                    className="text-destructive hover:text-destructive">
                                                {t('patientAppointments.cancel')}
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="outline" size="sm">{t('common.viewDetails')}</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Book Appointment Dialog */}
            <BookAppointmentForm
                open={bookingDialogOpen}
                onClose={() => setBookingDialogOpen(false)}
                onSubmit={handleBookAppointment}
            />
        </div>
    );
};
