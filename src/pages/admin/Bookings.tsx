import React, {useMemo, useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {Plus, Search, Edit, Trash2} from 'lucide-react';
import {format} from 'date-fns';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {BookingForm} from '@/components/forms/BookingForm';
import {bookingService} from '@/services/bookingService.ts';

import type {Appointment, AppointmentFormData, AppointmentStatus, PaginatedResponse} from '@/types';


const normalizeStatus = (s: unknown): string => String(s ?? '').toLowerCase();

const toIsoDateTime = (value: string) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toISOString();
};

const normalizeFormData = (data: AppointmentFormData) => {
    return {
        doctor_id: data.doctor_id,
        notes: data.notes,
        date_time: toIsoDateTime(data.date_time),
    };
};

export const Bookings: React.FC = () => {
    const {t} = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [page] = useState(0);
    const rowsPerPage = 10;
    const queryClient = useQueryClient();

    const [openForm, setOpenForm] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const {data, isLoading} = useQuery<PaginatedResponse<Appointment>>({
        queryKey: ['bookings', page + 1, rowsPerPage],
        queryFn: () => bookingService.getBookings(page + 1, rowsPerPage),
    });

    const createBookingMutation = useMutation({
        mutationFn: (formData: AppointmentFormData) => bookingService.createBooking(normalizeFormData(formData)),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['bookings']});
            setOpenForm(false);
            setSelectedBooking(null);
        },
        onError: (err) => {
            console.error(err);
            alert(t('adminBookings.createFailed'));
        },
    });

    const updateBookingMutation = useMutation({
        mutationFn: ({id, data}: { id: number; data: AppointmentFormData }) =>
            bookingService.updateBooking(id, normalizeFormData(data)),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['bookings']});
            setOpenForm(false);
            setSelectedBooking(null);
        },
        onError: (err) => {
            console.error(err);
            alert(t('adminBookings.updateFailed'));
        },
    });

    const cancelBookingMutation = useMutation({
        mutationFn: (bookingId: number) => bookingService.cancelBooking(bookingId),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['bookings']}),
        onError: (err) => {
            console.error(err);
            alert(t('adminBookings.cancelFailed'));
        },
    });

    const handleCreateBooking = () => {
        setFormMode('create');
        setSelectedBooking(null);
        setOpenForm(true);
    };

    const handleEditBooking = (booking: Appointment) => {
        setFormMode('edit');
        setSelectedBooking(booking);
        setOpenForm(true);
    };

    const handleCancelBooking = async (bookingId: number) => {
        if (window.confirm(t('adminBookings.confirmCancel'))) {
            await cancelBookingMutation.mutateAsync(bookingId);
        }
    };

    const handleFormSubmit = async (formData: AppointmentFormData) => {
        try {
            if (formMode === 'create') {
                await createBookingMutation.mutateAsync(formData);
            } else if (selectedBooking) {
                await updateBookingMutation.mutateAsync({id: selectedBooking.id, data: formData});
            }
        } catch (error) {
            console.error('Failed to save booking:', error);
            alert(t('adminBookings.saveFailed'));
        }
    };

    const getStatusBadgeVariant = (status: AppointmentStatus | string) => {
        switch (normalizeStatus(status)) {
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
                return 'warning';
            default:
                return 'outline';
        }
    };

    const filteredBookings = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const list = data?.data ?? [];
        if (!q) return list;

        return list.filter((b) => {
            const patient = (b.patient_name ?? '').toLowerCase();
            const doctor = (b.doctor_name ?? '').toLowerCase();
            return patient.includes(q) || doctor.includes(q);
        });
    }, [data?.data, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('adminBookings.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('adminBookings.subtitle')}</p>
                </div>
                <Button onClick={handleCreateBooking}>
                    <Plus className="mr-2 h-4 w-4"/>
                    {t('adminBookings.newBooking')}
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder={t('placeholders.searchBookings')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('common.id')}</TableHead>
                            <TableHead>{t('common.patient')}</TableHead>
                            <TableHead>{t('common.doctor')}</TableHead>
                            <TableHead>{t('adminBookings.dateTime')}</TableHead>
                            <TableHead>{t('common.status')}</TableHead>
                            <TableHead>{t('common.notes')}</TableHead>
                            <TableHead className="text-right">{t('common.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"/>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {t('adminBookings.noBookings')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBookings.map((booking) => {
                                const status = normalizeStatus(booking.status);
                                const dt = new Date(booking.date_time);

                                return (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-mono text-sm">{booking.id}</TableCell>
                                        <TableCell className="font-medium">{booking.patient_name ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {booking.doctor_name ? `Dr. ${booking.doctor_name}` : '—'}
                                        </TableCell>

                                        <TableCell className="text-muted-foreground">
                                            {isNaN(dt.getTime())
                                                ? booking.date_time
                                                : `${format(dt, 'MMM dd, yyyy')} at ${format(dt, 'HH:mm')}`}
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(booking.status) as any}>
                                                {status.toUpperCase().replace('_', ' ')}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-muted-foreground max-w-xs truncate">
                                            {booking.notes || '—'}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Edit booking"
                                                    onClick={() => handleEditBooking(booking)}
                                                    disabled={status === 'cancelled' || status === 'completed'}
                                                >
                                                    <Edit className="h-4 w-4"/>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Cancel booking"
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    disabled={cancelBookingMutation.isPending || status === 'cancelled'}
                                                >
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>

            <BookingForm
                open={openForm}
                onClose={() => {
                    setOpenForm(false);
                    setSelectedBooking(null);
                }}
                onSubmit={handleFormSubmit}
                booking={selectedBooking as any} // update BookingForm props to Appointment for a clean fix
                mode={formMode}
            />
        </div>
    );
};
